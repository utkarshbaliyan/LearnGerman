import registry from '@/content/reading/compatible/media-registry.json';
import {compatibleStoryMediaResponse} from '@/app/lib/compatible-story-media.mjs';
import {getBindings} from '@/platform-bindings';

async function respond(request: Request,{params}:{params:Promise<{asset:string}>}) {
  const env=await getBindings();
  return compatibleStoryMediaResponse(request,(await params).asset,{bucket:(env as unknown as {BUCKET?:R2Bucket}).BUCKET,registry});
}
export const GET=respond;
export const HEAD=respond;
