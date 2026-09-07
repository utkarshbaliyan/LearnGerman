import { applyFeedbackAction } from "@/app/lib/tutor-feedback-actions";
import { getD1 } from "@/db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { getSpeakingMission } from "@/app/lib/speaking-missions";
import { publicWritingRecord, repairFeedback, type WritingAttempt } from "@/app/lib/writing-repair";
import { readTutorSession, saveTutorSession, reserveTutorQuota } from "@/app/api/tutor/_sessions";
import { boundedBody } from "@/app/api/tutor/_photo";
import { createTutorFeedback, transcribeGerman } from "@/app/api/tutor/_shared";
import { dialogueReply } from "@/app/api/tutor/_dialogue";

const fail = (error: string, status = 400) => Response.json({ error }, { status });
const responseHeaders = { "cache-control": "no-store" };
export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return fail("Sign in to save speaking practice.", 401);
  const taskId = new URL(request.url).searchParams.get("taskId") ?? "";
  const mission = getSpeakingMission(taskId);
  if (!mission) return fail("Unknown speaking task.");
  return Response.json({ ...publicWritingRecord(await readTutorSession(await getD1(), user.id, `speaking:${taskId}`)), mission }, { headers: responseHeaders });
}
export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return fail("Sign in to save speaking practice.", 401);
  if (request.headers.get("x-tutor-owner") !== user.id) return fail("Account changed. Reload your speaking practice.", 409);
  let body: Record<string, unknown>, audio: File | undefined;
  try {
    const type = request.headers.get("content-type") ?? "";
    const multipart = type.startsWith("multipart/form-data;");
    const bytes = await boundedBody(request, multipart ? 5_260_000 : 40_000);
    if (!bytes) return fail("Recording is too large. Record up to 90 seconds and try again.", 413);
    if (multipart) {
      const form = await new Response(new Blob([bytes.buffer as ArrayBuffer]), { headers: { "content-type": type } }).formData();
      const file = form.get("audio");
      if (!(file instanceof File) || file.size < 100 || file.size > 5_242_880 || !["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav"].includes(file.type.split(";")[0])) return fail("Choose a supported audio recording under 5 MB.");
      if (form.get("consent") !== "true") return fail("Recording consent is required.");
      audio = file;
      body = { action: "transcribe", taskId: form.get("taskId"), requestId: form.get("requestId"), version: Number(form.get("version")) };
    } else body = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return fail("Invalid speaking request."); }
  if (!body || typeof body !== "object") return fail("Invalid speaking request.");
  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  const mission = getSpeakingMission(taskId);
  if (!mission) return fail("Unknown speaking task.");
  const db = await getD1(), key = `speaking:${taskId}`;
  const record = await readTutorSession(db, user.id, key);
  const respond = () => Response.json({ ...publicWritingRecord(record), mission }, { headers: responseHeaders });
  const save = () => saveTutorSession(db, user.id, key, record);
  const hash = audio ? [...new Uint8Array(await crypto.subtle.digest("SHA-256", await audio.arrayBuffer()))].map((x) => x.toString(16).padStart(2, "0")).join("") : JSON.stringify({ action: body.action, answer: body.answer, transcriptId: body.transcriptId });
  const existing = record.session.speaking?.requests.find((item) => item.id === body.requestId);
  if (existing) {
    if (existing.hash !== hash || existing.action !== body.action) return fail("This request belongs to a different response.", 409);
    if (existing.status === "pending") {
      if (Date.now() - Date.parse(existing.createdAt) < 90_000) return fail("Your speaking request is processing. Reload shortly.", 409);
      existing.status = "failed"; if (!await save()) return fail("Your session changed. Reload it.", 409);
    }
    return respond();
  }
  if (body.version !== record.version) return fail("Your speaking session changed in another tab. Reload saved work.", 409);
  const pending = record.session.speaking?.requests.find((item) => item.status === "pending");
  if (pending && Date.now() - Date.parse(pending.createdAt) < 90_000) return fail("A speaking request is still processing.", 409);
  if (pending) pending.status = "failed";
  if (body.action === "delete") record.session = { draft: "", attempts: [] };
  else if (body.action === "start") {
    if (body.mode !== "focus" && body.mode !== "conversation") return fail("Choose a speaking mode.");
    if (record.session.speaking && !record.session.speaking.ended) return fail("Finish or delete the current mission before starting another.", 409);
    if ((record.session.speakingHistory?.length ?? 0) >= 9) return fail("Ten missions are saved. Delete this task’s speaking history before starting again.");
    if (record.session.speaking) record.session.speakingHistory = [...(record.session.speakingHistory ?? []), record.session.speaking];
    record.session.speaking = { mode: body.mode, startedAt: new Date().toISOString(), ended: false, turns: [], requests: [] };
  } else {
    const state = record.session.speaking;
    if (!state) return fail("Start a speaking mission first.");
    if (["reveal", "help", "dispute"].includes(String(body.action))) {
      const problem = applyFeedbackAction(record.session.attempts, body);
      if (problem) return fail(problem);
    } else if (body.action === "transcribe" || (body.action === "respond" || body.action === "repair")) {
      if (state.ended && !(state.mode === "focus" && body.action !== "respond")) return fail("This mission is finished. Start another mission.", 409);
      if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) return fail("A valid request ID is required.");
      if (state.requests.length >= 32) return fail("Too many requests in this mission. Delete it to start again.");
      if (body.action === "transcribe" && !audio) return fail("Record a response first.");
      if ((body.action === "respond" || body.action === "repair") && (body.confirmed !== true || !state.transcript || state.transcript.consumed || body.transcriptId !== state.transcript.id || typeof body.answer !== "string" || body.answer.trim().length < 3 || body.answer.length > 2000)) return fail("Confirm the transcript before sending your response.");
      if (body.action === "repair" && (state.mode !== "focus" || !state.turns.length)) return fail("There is no focused response to repair.");
      const operation = { id: body.requestId, hash, action: body.action, status: "pending" as "pending" | "complete" | "failed", createdAt: new Date().toISOString() };
      state.requests.push(operation);
      if (!await save()) return fail("Your session changed. Reload it.", 409);
      let error: string | undefined, status = 502;
      try {
        const grade = body.action === "repair" || body.action === "respond" && (state.mode === "focus" || state.turns.length + 1 === mission.turns);
        if (!await reserveTutorQuota(db, user.id, grade && body.action !== "repair" ? 2 : 1)) { status = 429; error = "Daily AI limit reached. Speaking, writing and photo reads share 20 requests per day."; }
        else if (body.action === "transcribe") {
          const text = await transcribeGerman(audio!);
          if (text.length > 2000) throw new Error("Transcript too long");
          state.transcript = { id: operation.id, original: text, text, consentAt: operation.createdAt, consumed: false };
        } else {
          const answer = body.answer as string;
          const reply = body.action === "repair" ? state.turns.at(-1)!.reply : await dialogueReply(mission, state, answer);
          const combined = grade && state.mode === "conversation" ? [...state.turns.map((turn) => turn.text), answer].join("\n") : answer;
          let attempt: WritingAttempt | undefined;
          if (grade) {
            const context = { level: mission.level, chapter: 1, prompt: `${mission.goal} Questions asked: ${[...state.turns.map((turn) => turn.prompt), (body.action === "repair" ? state.turns.at(-1)?.prompt : state.turns.at(-1)?.reply) ?? mission.opening].join(" ")}`, grammarFocus: mission.patternId, vocabulary: [], targetPattern: mission.patternId };
            attempt = { id: operation.id, answer: combined, createdAt: operation.createdAt, status: "complete", revealed: false,
              assistance: record.session.attempts.some((x) => x.revealed) ? "correction" : record.session.attempts.some((x) => x.status === "complete") ? "hint" : "independent",
              feedback: repairFeedback(await createTutorFeedback("speaking", context, combined), combined) };
          }
          if (body.action === "repair") {
            const turn = state.turns.at(-1)!; turn.text = answer; turn.originalTranscript = state.transcript!.original;
          } else state.turns.push({ id: operation.id, prompt: state.turns.at(-1)?.reply ?? mission.opening, originalTranscript: state.transcript!.original, text: answer, reply, createdAt: operation.createdAt });
          state.transcript!.text = answer; state.transcript!.consumed = true;
          state.ended = state.turns.length >= mission.turns;
          if (attempt) record.session.attempts.push(attempt);
        }
      } catch { error = "Speaking feedback is temporarily unavailable. Your saved turns are safe. Retry this response."; }
      operation.status = error ? "failed" : "complete";
      if (!await save()) return fail("Your session changed. Reload saved work.", 409);
      return error ? Response.json({ error, ...publicWritingRecord(record), mission }, { status, headers: responseHeaders }) : respond();
    } else return fail("Unknown speaking action.");
  }
  if (!await save()) return fail("Your session changed. Reload saved work.", 409);
  return respond();
}
