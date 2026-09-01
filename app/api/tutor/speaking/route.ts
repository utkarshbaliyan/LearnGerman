import { createTutorFeedback, rateLimited, transcribeGerman, tutorError, validateContext } from "@/app/api/tutor/_shared";

const ALLOWED_AUDIO = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav"]);

export async function POST(request: Request) {
  if (rateLimited(request)) return Response.json({ error: "Too many checks. Please review your feedback and try again in a few minutes." }, { status: 429 });
  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const contextValue = form.get("context");
    if (!(audio instanceof File) || audio.size < 100 || audio.size > 8 * 1024 * 1024 || (audio.type && !ALLOWED_AUDIO.has(audio.type))) {
      return Response.json({ error: "Record a response under 8 MB before requesting speaking feedback." }, { status: 400 });
    }
    if (typeof contextValue !== "string" || contextValue.length > 5_000) return Response.json({ error: "The chapter context is invalid." }, { status: 400 });
    const context = validateContext(JSON.parse(contextValue));
    if (!context) return Response.json({ error: "The chapter context is invalid." }, { status: 400 });
    const transcript = await transcribeGerman(audio);
    const feedback = await createTutorFeedback("speaking", context, transcript);
    return Response.json({ ...feedback, transcript });
  } catch (error) {
    return tutorError(error);
  }
}
