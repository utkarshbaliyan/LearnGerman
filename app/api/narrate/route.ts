import { A1_STORIES } from "@/app/a1-curriculum";
import { env } from "cloudflare:workers";

export const runtime = "edge";

const AUDIO_VERSION = "marin-hochdeutsch-v1";

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storyNumber = Number(url.searchParams.get("story"));
  const story = Number.isInteger(storyNumber) ? A1_STORIES[storyNumber - 1] : undefined;

  if (!story || story.number !== storyNumber) {
    return errorResponse("Unknown story.", 404);
  }

  const apiKey = (env as unknown as Record<string, string | undefined>).OPENAI_API_KEY;
  if (!apiKey) {
    return errorResponse("Narration is not configured.", 503);
  }

  let openAIResponse: Response;
  try {
    openAIResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "marin",
        input: story.text,
        instructions:
          "Speak in warm, native Standard German (Hochdeutsch) for an adult A1 learner. Use natural conversational rhythm and expressive intonation, never a robotic cadence. Pronounce every word accurately and clearly without exaggerating syllables. Keep a calm, friendly storytelling tone. Use short natural pauses at commas, full pauses between sentences, and a slightly longer pause between paragraphs. Dialogue should sound alive and distinct while remaining easy to understand. Maintain a measured but natural pace.",
        response_format: "mp3",
      }),
    });
  } catch (error) {
    console.error("OpenAI narration request failed", {
      story: story.number,
      message: error instanceof Error ? error.message : "Unknown fetch error",
    });
    return errorResponse("Narration service could not be reached.", 502);
  }

  if (!openAIResponse.ok || !openAIResponse.body) {
    const requestId = openAIResponse.headers.get("x-request-id");
    const details = await openAIResponse.clone().json().catch(() => null) as {
      error?: { code?: string; type?: string };
    } | null;
    console.error("OpenAI narration failed", {
      status: openAIResponse.status,
      code: details?.error?.code,
      type: details?.error?.type,
      requestId,
      story: story.number,
    });
    return errorResponse(
      openAIResponse.status === 429
        ? "Narration needs an active OpenAI API balance."
        : "Narration could not be generated.",
      openAIResponse.status === 429 ? 429 : 502,
    );
  }

  const audioResponse = new Response(openAIResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "X-LeseLaut-Voice": `${AUDIO_VERSION}`,
    },
  });

  return audioResponse;
}
