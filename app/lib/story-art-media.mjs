import { immutableMediaResponse } from './book-object-media.mjs';

const ROOT = 'illustrations/stories/';
const FILE = /^(reading-(a1|a2|b1|b2)-(\d{2,3})-v[12])-([a-f0-9]{12})\.webp$/;
const COUNTS = { a1: 104, a2: 150, b1: 200, b2: 200 };

export function allowedStoryArt(asset, registry) {
  const match = typeof asset === 'string' && asset.match(FILE);
  if (!match || Number(match[3]) < 1 || Number(match[3]) > COUNTS[match[2]]
    || match[3] !== String(Number(match[3])).padStart(2, '0')) return null;
  const key = ROOT + asset, entry = registry[key];
  return entry && entry.storyId === match[1] && entry.localFilename === `${match[1]}-watercolor.webp`
    && entry.contentType === 'image/webp' && Number.isSafeInteger(entry.bytes)
    && entry.bytes > 0 && entry.bytes <= 8 * 1024 ** 2
    && /^[a-f0-9]{64}$/.test(entry.sha256) && entry.sha256.slice(0, 12) === match[4]
    ? { key, entry } : null;
}

export function storyArtResponse(request, asset, options) {
  return immutableMediaResponse(request, allowedStoryArt(asset, options.registry), options);
}
