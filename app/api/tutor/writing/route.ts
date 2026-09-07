import { loadTutorMemory } from "@/app/lib/tutor-memory";
import { getPracticeTask } from "@/app/lib/tutor-practice";
import { getD1 } from "@/db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { getWritingTask } from "@/app/lib/writing-task";
import { publicWritingRecord, repairFeedback, type WritingRecord, type WritingAttempt } from "@/app/lib/writing-repair";
import { createTutorFeedback, tutorError } from "@/app/api/tutor/_shared";
import { boundedBody, readAssignmentPhoto } from "@/app/api/tutor/_photo";
import { MAX_PHOTO_BYTES, photoProblem, type PhotoReading } from "@/app/lib/writing-photo";

const error = (message: string, status = 400) => Response.json({ error: message }, { status });
async function read(db: D1Database, user: string, task: string): Promise<WritingRecord> {
  const row = await db.prepare("SELECT data, version FROM tutor_sessions WHERE user_id = ? AND task_id = ?").bind(user, task).first<{ data: string; version: number }>();
  return row ? { version: row.version, session: JSON.parse(row.data) } : { version: 0, session: { draft: "", attempts: [] } };
}
async function save(db: D1Database, user: string, task: string, record: WritingRecord) {
  const result = record.version === 0
    ? await db.prepare("INSERT INTO tutor_sessions (user_id, task_id, data, version, updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT DO NOTHING").bind(user, task, JSON.stringify(record.session), new Date().toISOString()).run()
    : await db.prepare("UPDATE tutor_sessions SET data = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND task_id = ? AND version = ?").bind(JSON.stringify(record.session), new Date().toISOString(), user, task, record.version).run();
  if (!result.meta.changes) return false;
  record.version += 1;
  return true;
}
function response(record: WritingRecord) { return Response.json(publicWritingRecord(record), { headers: { "cache-control": "no-store" } }); }
async function practiceAccess(db: D1Database, userId: string, taskId: string) {
  const practice = getPracticeTask(taskId);
  if (!practice || practice.variant !== 2) return null;
  const memory = await loadTutorMemory(db, userId, practice.level);
  const pattern = memory.patterns.find((item) => item.patternId === practice.patternId);
  return !pattern || Date.parse(pattern.nextDueAt) > Date.now() ? error("This delayed review becomes available seven days after relevant feedback. Choose a practice task from your learning profile.", 403) : null;
}
async function reserveQuota(db: D1Database, userId: string) {
  return db.prepare("INSERT INTO tutor_quotas (user_id, day, used) VALUES (?, ?, 1) ON CONFLICT (user_id, day) DO UPDATE SET used = used + 1 WHERE used < 20 RETURNING used").bind(userId, new Date().toISOString().slice(0, 10)).first();
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return error("Sign in to save writing and receive feedback.", 401);
  if (request.headers.get("x-writing-owner") && request.headers.get("x-writing-owner") !== user.id) return error("Account changed. Reload saved work.", 409);
  const taskId = new URL(request.url).searchParams.get("taskId") ?? "";
  if (!getWritingTask(taskId)) return error("Unknown writing task.");
  const db = await getD1();
  const denied = await practiceAccess(db, user.id, taskId);
  return denied ?? response(await read(db, user.id, taskId));
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return error("Sign in to save writing and receive feedback.", 401);
  if (request.headers.get("x-writing-owner") && request.headers.get("x-writing-owner") !== user.id) return error("Account changed. Reload saved work.", 409);
  let body: Record<string, unknown>;
  let photo: { bytes: Uint8Array; mime: string; hash: string } | undefined;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const multipart = contentType.startsWith("multipart/form-data;");
    const bytes = await boundedBody(request, multipart ? MAX_PHOTO_BYTES + 16_000 : 40_000);
    if (!bytes) return error("Writing request is too large.", 413);
    if (multipart) {
      const form = await new Response(new Blob([bytes.buffer as ArrayBuffer]), { headers: { "content-type": contentType } }).formData();
      const file = form.get("photo");
      if (!(file instanceof File)) return error("Choose an assignment photo.");
      if (form.get("consent") !== "true") return error("Confirm that this photo may be sent for text recognition.");
      const imageBytes = new Uint8Array(await file.arrayBuffer());
      const problem = photoProblem(imageBytes, file.type);
      if (problem) return error(problem);
      const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", imageBytes))].map((x) => x.toString(16).padStart(2, "0")).join("");
      photo = { bytes: imageBytes, mime: file.type, hash };
      body = { action: "photo", taskId: form.get("taskId"), version: Number(form.get("version")), requestId: form.get("requestId") };
    } else body = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return error("Invalid writing request."); }
  if (!body || typeof body !== "object") return error("Invalid writing request.");
  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  const task = getWritingTask(taskId);
  if (!task) return error("Unknown writing task.");
  const db = await getD1();
  const denied = body.action === "delete" ? null : await practiceAccess(db, user.id, taskId);
  if (denied) return denied;
  const record = await read(db, user.id, taskId);
  if (body.action === "photo" && photo) {
    const existing = record.session.photos?.find((x) => x.id === body.requestId);
    if (existing) {
      if (existing.imageHash !== photo.hash) return error("This upload ID belongs to another photo.", 409);
      if (existing.status === "pending") {
        if (Date.now() - Date.parse(existing.createdAt) < 60_000) return error("The photo is still being read. Reload saved work shortly.", 409);
        existing.status = "failed";
        if (!await save(db, user.id, taskId, record)) return error("Your work changed. Reload saved work.", 409);
      }
      return response(record);
    }
  }
  if (body.action === "check" && typeof body.requestId === "string") {
    const existing = record.session.attempts.find((x) => x.id === body.requestId);
    if (existing) {
      if (existing.answer !== body.answer) return error("This request ID already belongs to a different draft.", 409);
      if (existing.status === "pending") {
        if (Date.now() - Date.parse(existing.createdAt) < 60_000) return error("This check is still processing. Reload saved work shortly.", 409);
        existing.status = "failed";
        if (!await save(db, user.id, taskId, record)) return error("Your work changed. Reload saved work.", 409);
      }
      return response(record);
    }
  }
  if (body.version !== record.version) return error("Your saved work changed in another tab. Reload saved work before continuing.", 409);
  const pending = record.session.attempts.find((x) => x.status === "pending");
  if (pending && Date.now() - Date.parse(pending.createdAt) < 60_000) return error("A check is still processing. Please wait.", 409);
  if (pending) pending.status = "failed";
  const pendingPhoto = record.session.photos?.find((x) => x.status === "pending");
  if (pendingPhoto && Date.now() - Date.parse(pendingPhoto.createdAt) < 60_000) return error("A photo is still being read. Please wait.", 409);
  if (pendingPhoto) pendingPhoto.status = "failed";

  if (body.action === "photo" && photo) {
    if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) return error("A valid upload ID is required.");
    if (!process.env.GROQ_API_KEY) return error("Photo reading is not configured yet. You can still type your assignment.", 503);
    if ((record.session.photos?.length ?? 0) >= 20) return error("This task has 20 saved photo readings. Delete its history before uploading more.");
    const reading: PhotoReading = { id: body.requestId, imageHash: photo.hash, createdAt: new Date().toISOString(), status: "pending" };
    record.session.photos = [...(record.session.photos ?? []), reading];
    if (!await save(db, user.id, taskId, record)) return error("Your work changed. Reload saved work.", 409);
    let failure: string | undefined;
    let status = 502;
    try {
      if (!await reserveQuota(db, user.id)) {
        status = 429;
        failure = "Daily AI limit reached (20 photo reads or writing checks). Try again after midnight UTC.";
      } else {
        const result = await readAssignmentPhoto(photo.bytes, photo.mime);
        if (!result) { status = 422; failure = "The German answer could not be read. Use a clearer, closer photo of one page, or type your answer."; }
        else { Object.assign(reading, result); reading.status = "complete"; }
      }
    } catch { failure = "Photo reading is temporarily unavailable. Retry the photo or type your assignment. Your existing draft is unchanged."; }
    if (failure) reading.status = "failed";
    if (!await save(db, user.id, taskId, record)) return error("Your work changed. Reload saved work.", 409);
    return failure ? Response.json({ error: failure, ...publicWritingRecord(record) }, { status }) : response(record);
  } else if (body.action === "confirm-photo") {
    const reading = record.session.photos?.find((x) => x.id === body.photoId && x.status === "complete");
    if (!reading) return error("Photo reading not found.", 404);
    if (reading.confirmedAt) return error("This photo has already been confirmed. Revise the draft directly.", 409);
    if (typeof body.answer !== "string" || body.answer.trim().length < 10 || body.answer.length > 8000 || /\[unclear\]/i.test(body.answer)) return error("Check the extracted text and replace every [unclear] marker before confirming.");
    reading.confirmedText = body.answer;
    reading.confirmedAt = new Date().toISOString();
    record.session.draft = body.answer;
    record.session.draftPhotoId = reading.id;
  } else if (body.action === "delete") {
    // Keep an empty versioned tombstone so stale tabs cannot resurrect deleted text.
    record.session = { draft: "", attempts: [] };
  } else if (body.action === "reveal") {
    const attempt = record.session.attempts.find((x) => x.id === body.attemptId && x.status === "complete");
    if (!attempt) return error("Attempt not found.", 404);
    attempt.revealed = true;
  } else if (body.action === "draft" || body.action === "check") {
    if (typeof body.answer !== "string" || body.answer.length > 8000) return error("Write no more than 8,000 characters.");
    record.session.draft = body.answer;
    if (body.action === "check") {
      if (body.answer.trim().length < 10) return error("Write a German response before checking it.");
      if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) return error("A valid request ID is required.");
      if (record.session.attempts.length >= 40) return error("This task has 40 saved attempts. Delete this task’s history to start again.");
      const previous = record.session.attempts.filter((x) => x.status === "complete");
      if (previous.at(-1)?.answer === body.answer) return error("Change your draft before checking again.");
      const attempt: WritingAttempt = { id: body.requestId, answer: body.answer, status: "pending", createdAt: new Date().toISOString(), revealed: false,
        ...(record.session.draftPhotoId ? { sourcePhotoId: record.session.draftPhotoId } : {}),
        assistance: previous.some((x) => x.revealed) ? "correction" : previous.length ? "hint" : "independent" };
      record.session.attempts.push(attempt);
      if (!await save(db, user.id, taskId, record)) return error("Your work changed. Reload saved work.", 409);
      try {
        // Atomic reservation across tasks, tabs and Worker instances. Failed calls still consume budget.
        const quota = await reserveQuota(db, user.id);
        if (!quota) {
          attempt.status = "failed";
          await save(db, user.id, taskId, record);
          return Response.json({ error: "Daily AI limit reached (20 photo reads or writing checks). Try again after midnight UTC. Your draft is saved.", ...publicWritingRecord(record) }, { status: 429 });
        }
        attempt.feedback = repairFeedback(await createTutorFeedback("writing", task, body.answer), body.answer);
        attempt.status = "complete";
      } catch (cause) {
        attempt.status = "failed";
        await save(db, user.id, taskId, record);
        const failure = tutorError(cause);
        const payload = await failure.json() as { error: string };
        return Response.json({ ...payload, ...publicWritingRecord(record) }, { status: failure.status });
      }
    }
  } else return error("Unknown writing action.");
  if (!await save(db, user.id, taskId, record)) return error("Your work changed. Reload saved work.", 409);
  return response(record);
}
