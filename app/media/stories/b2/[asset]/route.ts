import registry from '@/content/reading/b2/media-registry.json';
import {storyMediaResponse} from '@/app/lib/story-object-media.mjs';
import {getBindings} from '@/platform-bindings';

async function respond(request: Request, {params}: {params: Promise<{asset: string}>}) {
  const env = await getBindings();
  const bindings = env as unknown as {BUCKET?: R2Bucket; B2_STORY_MEDIA_UPLOAD_SECRET?: string};
  return storyMediaResponse(request, (await params).asset, {bucket:bindings.BUCKET, registry, uploadSecret:bindings.B2_STORY_MEDIA_UPLOAD_SECRET});
}
export const GET = respond;
export const HEAD = respond;
export const PUT = respond;
