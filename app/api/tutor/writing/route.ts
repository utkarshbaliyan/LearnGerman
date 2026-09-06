import { getD1 } from "@/db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { getWritingTask } from "@/app/lib/writing-task";
import { publicWritingRecord, repairFeedback, type WritingRecord, type WritingAttempt } from "@/app/lib/writing-repair";
import { createTutorFeedback, tutorError } from "@/app/api/tutor/_shared";

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

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return error("Sign in to save writing and receive feedback.", 401);
  if (request.headers.get("x-writing-owner") && request.headers.get("x-writing-owner") !== user.id) return error("Account changed. Reload saved work.", 409);
  const taskId = new URL(request.url).searchParams.get("taskId") ?? "";
  if (!getWritingTask(taskId)) return error("Unknown writing task.");
  return response(await read(await getD1(), user.id, taskId));
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return error("Sign in to save writing and receive feedback.", 401);
  if (request.headers.get("x-writing-owner") && request.headers.get("x-writing-owner") !== user.id) return error("Account changed. Reload saved work.", 409);
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 12_000) return error("Writing request is too large.", 413);
    body = JSON.parse(text);
  } catch { return error("Invalid writing request."); }
  if (!body || typeof body !== "object") return error("Invalid writing request.");
  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  const task = getWritingTask(taskId);
  if (!task) return error("Unknown writing task.");
  const db = await getD1();
  const record = await read(db, user.id, taskId);
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

  if (body.action === "delete") {
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
        assistance: previous.some((x) => x.revealed) ? "correction" : previous.length ? "hint" : "independent" };
      record.session.attempts.push(attempt);
      if (!await save(db, user.id, taskId, record)) return error("Your work changed. Reload saved work.", 409);
      try {
        // Atomic reservation across tasks, tabs and Worker instances. Failed calls still consume budget.
        const quota = await db.prepare("INSERT INTO tutor_quotas (user_id, day, used) VALUES (?, ?, 1) ON CONFLICT (user_id, day) DO UPDATE SET used = used + 1 WHERE used < 20 RETURNING used").bind(user.id, new Date().toISOString().slice(0, 10)).first();
        if (!quota) {
          attempt.status = "failed";
          await save(db, user.id, taskId, record);
          return Response.json({ error: "Daily writing limit reached (20 checks). Try again after midnight UTC. Your draft is saved.", ...publicWritingRecord(record) }, { status: 429 });
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
