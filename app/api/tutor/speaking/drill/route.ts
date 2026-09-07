import { getD1 } from "@/db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { getSpeakingMission } from "@/app/lib/speaking-missions";
import { speakingAudioFile, speakingAudioProblem } from "@/app/lib/speaking-audio";
import { readTutorSession, saveTutorSession, reserveTutorQuota } from "../../_sessions";
import { boundedBody } from "../../_photo";
import { createTutorFeedback, transcribeGerman } from "../../_shared";
import { publicWritingRecord, repairFeedback, type WritingAttempt } from "@/app/lib/writing-repair";
const fail = (error: string, status = 400) => Response.json({ error }, { status });
const headers = { "cache-control": "no-store" };
export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return fail("Sign in to practise speaking.", 401);
  const taskId = new URL(request.url).searchParams.get("taskId") ?? "";
  const mission = getSpeakingMission(taskId);
  if (!mission) return fail("Unknown speaking question.");
  return Response.json({ ...publicWritingRecord(await readTutorSession(await getD1(), user.id, `speaking-drill:${taskId}`)), mission }, { headers });
}
export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return fail("Sign in to practise speaking.", 401);
  if (request.headers.get("x-tutor-owner") !== user.id) return fail("Account changed. Reload this page.", 409);
  let body: Record<string, unknown>, audio: File | undefined;
  try {
    const type = request.headers.get("content-type") ?? "";
    const multipart = type.startsWith("multipart/form-data;");
    const bytes = await boundedBody(request, multipart ? 5_260_000 : 16_000);
    if (!bytes) return fail("Recording is too large. Try a shorter answer.", 413);
    if (multipart) {
      const form = await new Response(new Blob([bytes.buffer as ArrayBuffer]), { headers: { "content-type": type } }).formData();
      const file = form.get("audio");
      if (!file || typeof file === "string") return fail("No recording received.");
      const problem = speakingAudioProblem(file); if (problem) return fail(problem);
      if (form.get("consent") !== "true") return fail("Recording consent is required.");
      audio = speakingAudioFile(file);
      body = { action: "check", taskId: form.get("taskId"), version: Number(form.get("version")), questionIndex: Number(form.get("questionIndex")), requestId: form.get("requestId") };
    } else body = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return fail("Invalid recording request."); }
  if (!body || typeof body !== "object") return fail("Invalid request.");
  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  const mission = getSpeakingMission(taskId); if (!mission) return fail("Unknown speaking question.");
  const db = await getD1(), key = `speaking-drill:${taskId}`;
  const record = await readTutorSession(db, user.id, key);
  const save = () => saveTutorSession(db, user.id, key, record);
  const result = (error?: string, status = 200) => Response.json({ ...publicWritingRecord(record), mission, ...(error ? { error } : {}) }, { status, headers });
  let hash = "";
  if (audio) hash = `${body.questionIndex}:` + [...new Uint8Array(await crypto.subtle.digest("SHA-256", await audio.arrayBuffer()))].map(x => x.toString(16).padStart(2,"0")).join("");
  else hash = JSON.stringify({ action: body.action, attemptId: body.attemptId, answer: body.answer });
  const existing = record.session.attempts.find(x => x.id === body.requestId);
  if (existing) {
    if (existing.requestHash !== hash) return fail("This request belongs to another recording.", 409);
    if (existing.status === "pending") {
      if (Date.now() - Date.parse(existing.createdAt) < 90_000) return fail("Your recording is still being checked. Reload shortly.", 409);
      existing.status = "failed";
      if (!await save()) return fail("Saved work changed. Reload.", 409);
    }
    return existing.status === "failed" ? result("That check did not finish. Please try again.", 502) : result();
  }
  if (record.version !== body.version) return fail("Saved work changed. Reload before trying again.", 409);
  for (const attempt of record.session.attempts) if (attempt.status === "pending") {
    if (Date.now() - Date.parse(attempt.createdAt) < 90_000) return fail("A recording is still being checked.", 409);
    attempt.status = "failed";
  }
  if (body.action === "delete") { record.session = { draft: "", attempts: [] }; return await save() ? result() : fail("Saved work changed. Reload.", 409); }
  if (body.action !== "check" && body.action !== "correct-transcript") return fail("Unknown action.");
  const source = record.session.attempts.find(x => x.id === body.attemptId && x.status === "complete");
  const questionIndex = audio ? body.questionIndex : source?.questionIndex;
  if (!Number.isInteger(questionIndex) || (questionIndex as number) < 0 || (questionIndex as number) >= mission.questions.length) return fail("Unknown speaking question.");
  if (!audio && (body.action !== "correct-transcript" || !source || typeof body.answer !== "string" || !body.answer.trim() || body.answer.length > 2000)) return fail("Enter what you actually said.");
  if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) return fail("A valid request ID is required.");
  if (record.session.attempts.length >= 60) return fail("Delete saved practice to make room for more attempts.");
  const attempt: WritingAttempt = { id: body.requestId, requestHash: hash, questionIndex: questionIndex as number, transcriptConfirmed: !audio, answer: audio ? "" : body.answer as string, createdAt: new Date().toISOString(), status: "pending", revealed: true, assistance: record.session.attempts.some(x => x.questionIndex === questionIndex && x.status === "complete") ? "correction" : "independent" };
  record.session.attempts.push(attempt);
  if (!await save()) return fail("Saved work changed. Reload.", 409);
  let error: string | undefined, status = 502;
  try {
    if (!await reserveTutorQuota(db, user.id, audio ? 2 : 1)) { status = 429; error = "Daily speaking allowance reached. Try again tomorrow."; }
    else {
      if (audio) attempt.answer = await transcribeGerman(audio);
      if (!attempt.answer.trim() || attempt.answer.length > 2000) throw new Error("Unusable transcript");
      const feedback = await createTutorFeedback("speaking", { level: mission.level, chapter: mission.chapter, prompt: `Answer this one question: ${mission.questions[questionIndex as number]}`, grammarFocus: mission.grammarFocus, vocabulary: [], rubric: `${mission.rubric} Grade only this one spoken answer, not the whole chapter task. A brief answer is enough. Speech recognition may be wrong; do not claim to assess pronunciation.` }, attempt.answer);
      attempt.feedback = repairFeedback(feedback, attempt.answer);
    }
  } catch { error = "We could not check that recording. Please try again."; }
  attempt.status = error ? "failed" : "complete";
  if (!await save()) return fail("Saved work changed. Reload.", 409);
  return result(error, error ? status : 200);
}
