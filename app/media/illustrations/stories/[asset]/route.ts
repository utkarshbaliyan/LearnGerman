import registry from '@/content/illustrations/story-art-registry.json';
import { storyArtResponse } from '@/app/lib/story-art-media.mjs';

async function respond(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { env } = await import('cloudflare:workers');
  const bindings = env as unknown as { BUCKET?: R2Bucket; STORY_ART_UPLOAD_SECRET?: string };
  return storyArtResponse(request, (await params).asset, {
    bucket: bindings.BUCKET, registry, uploadSecret: bindings.STORY_ART_UPLOAD_SECRET,
  });
}

export const GET = respond;
export const HEAD = respond;
export const PUT = respond;
