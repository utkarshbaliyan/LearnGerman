import type { TutorContext, TutorFeedback } from "@/app/lib/ai-tutor-types";

async function readTutorResponse(response: Response): Promise<TutorFeedback> {
  const payload = await response.json().catch(() => null) as (TutorFeedback & { error?: string }) | null;
  if (!response.ok) throw new Error(payload?.error ?? "Feedback could not be loaded. Please try again.");
  return payload as TutorFeedback;
}

export async function requestWritingFeedback(context: TutorContext, answer: string) {
  const response = await fetch("/api/tutor/writing", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...context, answer }),
  });
  return readTutorResponse(response);
}

export async function requestSpeakingFeedback(context: TutorContext, audio: Blob) {
  const form = new FormData();
  form.set("audio", new File([audio], "learner-response.webm", { type: audio.type || "audio/webm" }));
  form.set("context", JSON.stringify(context));
  const response = await fetch("/api/tutor/speaking", { method: "POST", body: form });
  return readTutorResponse(response);
}
