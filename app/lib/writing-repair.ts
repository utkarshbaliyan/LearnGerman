import { z } from "zod";
import type { PhotoReading } from "./writing-photo";
import type { TutorFeedback } from "./ai-tutor-types";

const correctionSchema = z.object({
  original: z.string().min(1).max(1000), corrected: z.string().max(1000),
  explanation: z.string().min(1).max(1500), category: z.string().min(1).max(100),
  hint: z.string().min(1).max(700), kind: z.enum(["error", "style"]),
  confidence: z.number().min(0).max(1), severity: z.enum(["minor", "major"]),
});
export type RepairIssue = z.infer<typeof correctionSchema> & { start: number; end: number };
export type RepairFeedback = { summary: string; issues: RepairIssue[]; taskSuccess: boolean; needsReview: boolean };
export type WritingAttempt = {
  id: string; answer: string; createdAt: string; assistance: "independent" | "hint" | "correction";
  sourcePhotoId?: string;
  revealed: boolean; status: "pending" | "complete" | "failed"; feedback?: RepairFeedback;
};
export type WritingSession = { draft: string; attempts: WritingAttempt[]; photos?: PhotoReading[]; draftPhotoId?: string };
export type WritingRecord = { version: number; session: WritingSession };

// Reject hallucinated, ambiguous and overlapping spans instead of marking innocent text.
export function repairFeedback(feedback: TutorFeedback, answer: string): RepairFeedback {
  const issues: RepairIssue[] = [];
  let needsReview = false;
  for (const raw of feedback.corrections) {
    const parsed = correctionSchema.safeParse(raw);
    if (!parsed.success) { needsReview = true; continue; }
    const item = parsed.data;
    const start = answer.indexOf(item.original);
    const end = start + item.original.length;
    if (start < 0 || answer.indexOf(item.original, start + 1) !== -1 || item.confidence < 0.8 || issues.some((x) => start < x.end && end > x.start)) {
      needsReview = true; continue;
    }
    if (issues.length < 2) issues.push({ ...item, start, end });
    else needsReview = true;
  }
  return {
    // Unstructured provider prose may reveal the answer; use controlled hint-first copy.
    summary: issues.some((x) => x.kind === "error") ? "Repair the highlighted parts, then submit your revision." : needsReview ? "Some feedback could not be verified. Try a fresh check; this is not evidence of error-free writing." : "No high-confidence errors were identified. This is practice evidence, not mastery.",
    issues, needsReview,
    taskSuccess: !needsReview && feedback.overallScore >= 80 && !issues.some((x) => x.kind === "error"),
  };
}

export function publicWritingRecord(record: WritingRecord): WritingRecord {
  return { ...record, session: { ...record.session, attempts: record.session.attempts.map((attempt) => ({
    ...attempt, feedback: attempt.feedback && { ...attempt.feedback, issues: attempt.feedback.issues.map((issue) => attempt.revealed ? issue : { ...issue, corrected: "", explanation: "" }) },
  })) } };
}
