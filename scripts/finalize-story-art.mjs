import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { allowedStoryArt } from '../app/lib/story-art-media.mjs';

const partial = process.argv.includes('--partial'), preview = process.argv.includes('--preview');
const briefs = JSON.parse(readFileSync('content/illustrations/story-art-briefs.json','utf8'));
const generated = JSON.parse(readFileSync('.local-piper/story-art-refinement/generation-manifest.json','utf8'));
const exports = JSON.parse(readFileSync('.local-piper/story-art-refinement/web-export-manifest.json','utf8'));
const registry = {}, covers = {}, prompts = {}, hashes = new Set();
for (const brief of briefs) {
  const image = generated[brief.id];
  if (image?.style !== 'ink-watercolor-v1' || image.status === 'rejected') {
    if (partial) continue;
    throw new Error(`Story illustration not ready: ${brief.id}`);
  }
  const original = readFileSync(join('.local-piper/story-art-refinement/generated',`${brief.id}-watercolor.png`));
  const sourceSha256 = createHash('sha256').update(original).digest('hex'), exported = exports[brief.id];
  if (sourceSha256 !== image.sha256 || original.length !== image.bytes || exported?.sourceSha256 !== sourceSha256)
    throw new Error(`Missing or stale web export: ${brief.id}`);
  if (!original.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    || original.readUInt32BE(16) !== original.readUInt32BE(20) || original.readUInt32BE(16) < 512
    || ![4,6].includes(original[25])) throw new Error(`Expected a square transparent PNG: ${brief.id}`);
  const localFilename = `${brief.id}-watercolor.webp`;
  const path = join('.local-piper/story-art-refinement/web-optimized.nosync',localFilename);
  const data = readFileSync(path), sha256 = createHash('sha256').update(data).digest('hex');
  if (sha256 !== exported.sha256 || data.length !== exported.bytes || hashes.has(sha256)
    || data.toString('ascii',0,4) !== 'RIFF' || data.toString('ascii',8,12) !== 'WEBP'
    || data.toString('ascii',12,16) !== 'VP8X' || !(data[20] & 16)
    || data.readUIntLE(24,3)+1 !== original.readUInt32BE(16)
    || data.readUIntLE(27,3)+1 !== original.readUInt32BE(20)) throw new Error(`Changed or repeated web illustration: ${brief.id}`);
  hashes.add(sha256);
  const asset = `${brief.id}-${sha256.slice(0,12)}.webp`, key = `illustrations/stories/${asset}`;
  const entry = {storyId:brief.id,localFilename,bytes:data.length,sha256,contentType:'image/webp'};
  registry[key] = entry;
  if (!allowedStoryArt(asset,registry)) throw new Error(`Illustration registry rejected: ${brief.id}`);
  covers[brief.id] = {url:preview ? `/@fs${resolve(path)}` : `/media/${key}`};
  prompts[brief.id] = {title:brief.title,scene:brief.scene,prompt:image.prompt,style:image.style,sourceSha256,sha256,width:exported.width,height:exported.height,alphaSha256:exported.alphaSha256};
}
if (!Object.keys(registry).length || (!partial && Object.keys(registry).length !== 654)) throw new Error('The full illustration release requires 654 distinct covers.');
for (const [name,data] of [['story-art-registry',registry],['story-art-manifest',covers],['story-art-prompts',prompts]]) writeFileSync(`content/illustrations/${name}.json`,JSON.stringify(data,null,2)+'\n');
console.log(`Prepared ${Object.keys(registry).length} distinct ${preview?'local preview':'immutable production'} story illustrations.`);
