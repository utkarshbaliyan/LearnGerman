import type { WritingAttempt } from "./writing-repair";

export function applyFeedbackAction(attempts: WritingAttempt[], body: Record<string, unknown>, now = new Date().toISOString()): string | null {
  const attempt = attempts.find((item) => item.id === body.attemptId && item.status === "complete");
  if (!attempt) return "Feedback not found.";
  if (body.action === "reveal") { attempt.revealed = true; attempt.helpLevel = 3; return null; }
  if (body.action === "help") {
    if (body.level !== 1 && body.level !== 2) return "Choose a guiding question or partial example.";
    attempt.helpLevel = Math.max(attempt.helpLevel ?? 0, body.level);
    return null;
  }
  if (body.action === "dispute") {
    if (body.reason !== "incorrect" && body.reason !== "meaning") return "Choose why you are questioning this feedback.";
    if (typeof body.start !== "number" || !attempt.feedback?.issues.some((issue) => issue.start === body.start)) return "Correction not found.";
    if (typeof body.note !== "string" || body.note.length > 1000) return "Keep your explanation under 1,000 characters.";
    if (body.reason === "meaning" && body.note.trim().length < 3) return "Briefly explain what you meant.";
    const dispute = { start: body.start, reason: body.reason, note: body.note.trim(), createdAt: now } as const;
    attempt.disputes = [...(attempt.disputes ?? []).filter((item) => item.start !== body.start), dispute];
    return null;
  }
  return "Unknown feedback action.";
}
