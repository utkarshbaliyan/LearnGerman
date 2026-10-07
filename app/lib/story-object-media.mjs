import {immutableMediaResponse} from './book-object-media.mjs';

const ROOT = 'stories/b2/';
const FILE = /^reading-b2-(\d{2,3})-v1-[a-f0-9]{12}-[a-f0-9]{8}-qwen-dialogue-opus16-([a-f0-9]{12})\.(webm|json)$/;

export function allowedStoryMedia(asset, registry) {
  const match = typeof asset === 'string' && asset.match(FILE);
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 200 || match[1] !== String(Number(match[1])).padStart(2, '0')) return null;
  const key = ROOT + asset, entry = registry[key];
  return entry && Number.isSafeInteger(entry.bytes) && entry.bytes > 0 && entry.bytes <= 2 * 1024 ** 2
    && /^[a-f0-9]{64}$/.test(entry.sha256) && entry.sha256.slice(0,12) === match[2]
    && entry.localFilename === asset.replace(`-${match[2]}.`, '.')
    && entry.contentType === (asset.endsWith('.webm') ? 'audio/webm' : 'application/json') ? {key, entry} : null;
}

export function storyMediaResponse(request, asset, options) {
  return immutableMediaResponse(request, allowedStoryMedia(asset, options.registry), options);
}
