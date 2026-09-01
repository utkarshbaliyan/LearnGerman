import { createTutorFeedback, rateLimited, tutorError, validateContext } from "@/app/api/tutor/_shared";

export async function POST(request: Request) {
  if (rateLimited(request)) return Response.json({ error: "Too many tutor requests. Please review your feedback and try again in a few minutes." }, { status: 429 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const context = validateContext(body);
    const answer = typeof body.answer === "string" ? body.answer.trim() : "";
    if (!context || answer.length < 10 || answer.length > 8_000) return Response.json({ error: "Please provide a valid chapter response before requesting feedback." }, { status: 400 });
    return Response.json(await createTutorFeedback("writing", context, answer));
  } catch (error) {
    return tutorError(error);
  }
}
