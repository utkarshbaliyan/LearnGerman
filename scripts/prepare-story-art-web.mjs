// Encode web copies without resizing, cropping or changing the original PNGs.
// Pin both files and verify the decoded alpha plane before selecting an export.
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const ffmpeg = process.argv[2];
if (!ffmpeg) throw new Error('Provide the absolute path to a local FFmpeg binary with libwebp.');
const base = '.local-piper/story-art-refinement';
const generated = JSON.parse(readFileSync(join(base, 'generation-manifest.json'), 'utf8'));
const destination = join(base, 'web-optimized.nosync');
mkdirSync(destination, { recursive: true });
const manifestPath = join(base, 'web-export-manifest.json');
let exports = {};
try { exports = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const alphaHash = path => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-threads', '1', '-i', path,
  '-vf', 'alphaextract', '-frames:v', '1', '-f', 'hash', '-hash', 'sha256', '-'], { encoding: 'utf8' }).trim();
let count = 0, sourceBytes = 0, webBytes = 0;
for (const [id, image] of Object.entries(generated)) {
  if (image.style !== 'ink-watercolor-v1' || image.status === 'rejected') continue;
  const source = join(base, 'generated', `${id}-watercolor.png`), original = readFileSync(source);
  if (digest(original) !== image.sha256 || original.length !== image.bytes) throw new Error(`Source image changed: ${id}`);
  const localFilename = `${id}-watercolor.webp`, target = join(destination, localFilename);
  const previous = exports[id];
  let data;
  if (previous?.sourceSha256 === image.sha256) {
    try { data = readFileSync(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (data && (digest(data) !== previous.sha256 || data.length !== previous.bytes)) throw new Error(`Web export changed: ${id}`);
  }
  if (!data) {
    const temporary = `${target}.pending.webp`;
    execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-threads', '1', '-i', source, '-frames:v', '1',
      '-c:v', 'libwebp', '-quality', '86', '-compression_level', '6', '-pix_fmt', 'bgra', '-y', temporary]);
    data = readFileSync(temporary);
    if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP'
      || data.toString('ascii', 12, 16) !== 'VP8X' || !(data[20] & 16)
      || data.readUIntLE(24, 3) + 1 !== original.readUInt32BE(16)
      || data.readUIntLE(27, 3) + 1 !== original.readUInt32BE(20)) throw new Error(`Web export dimensions or transparency differ: ${id}`);
    const alphaSha256 = alphaHash(source);
    if (alphaHash(temporary) !== alphaSha256) throw new Error(`Web export alpha differs: ${id}`);
    renameSync(temporary, target);
    exports[id] = { sourceSha256: image.sha256, sha256: digest(data), bytes: data.length, localFilename,
      width: original.readUInt32BE(16), height: original.readUInt32BE(20), alphaSha256, quality: 86 };
    writeFileSync(`${manifestPath}.tmp`, JSON.stringify(exports, null, 2) + '\n');
    renameSync(`${manifestPath}.tmp`, manifestPath);
  }
  count++; sourceBytes += original.length; webBytes += data.length;
  if (count % 20 === 0) console.log(`Verified ${count} web exports.`);
}
console.log(JSON.stringify({ count, sourceBytes, webBytes, directory: resolve(destination) }));
