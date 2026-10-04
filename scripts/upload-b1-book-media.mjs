// One release allowlist, immutable uploads, then full stored-byte verification.
// The temporary signing secret is accepted only through hidden stdin.
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { createHash, createHmac } from 'node:crypto';
import { allowedMedia } from '../app/lib/book-object-media.mjs';

if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdout.write('Ready for media upload JSON on stdin (input is hidden).\n');
const input = await new Promise((resolve, reject) => {
  let value = '';
  process.stdin.on('data', chunk => {
    value += chunk;
    if (value.length > 16000) reject(new Error('Input exceeds permitted size.'));
    if (value.includes('\n')) { process.stdin.pause(); resolve(value.slice(0, value.indexOf('\n'))); }
  });
  process.stdin.on('end', () => resolve(value));
});
let config;
try { config = JSON.parse(input); } catch { throw new Error('Invalid upload configuration.'); }
const { secret, directory, registryPath, receiptPath } = config;
const origin = new URL(config.url).origin;
if (origin !== 'https://leselaut-german.professor-ut7.chatgpt.site' || typeof secret !== 'string' || secret.length < 32)
  throw new Error('Invalid origin or signing configuration.');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const entries = Object.entries(registry);
if (entries.length !== 400) throw new Error('A complete book must contain 400 media objects.');
const digest = body => createHash('sha256').update(body).digest('hex');
const verified = {};
let cursor = 0, finished = 0;
async function transfer([key, entry]) {
  const asset = basename(key), accepted = allowedMedia(asset, registry);
  if (accepted?.key !== key) throw new Error(`Invalid registry object: ${asset}`);
  const bytes = readFileSync(join(directory, entry.localFilename));
  if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) throw new Error(`Local checksum differs: ${asset}`);
  const url = `${origin}/media/${key}`;
  let success = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
      const exists = head.ok && head.headers.get('x-media-sha256') === entry.sha256 && head.headers.get('content-length') === String(entry.bytes);
      if (!exists) {
        const expiry = String(Math.floor(Date.now() / 1000) + 300);
        const signature = createHmac('sha256', secret).update(`PUT\n${key}\n${expiry}\n${entry.bytes}\n${entry.sha256}`).digest('base64url');
        const put = await fetch(url, { method: 'PUT', body: bytes, headers: { 'Content-Type': entry.contentType,
          'X-Media-Expiry': expiry, 'X-Media-Signature': signature }, signal: AbortSignal.timeout(60000) });
        await put.body?.cancel();
        if (put.status !== 204) throw new Error(`Upload status ${put.status}`);
      }
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (response.status !== 200) { await response.body?.cancel(); throw new Error(`Read status ${response.status}`); }
      const actual = Buffer.from(await response.arrayBuffer());
      if (actual.length !== entry.bytes || digest(actual) !== entry.sha256) throw new Error('Stored checksum differs');
      success = true; break;
    } catch (error) {
      if (attempt === 4) throw new Error(`Could not verify ${asset}: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
  if (!success) throw new Error(`Object not verified: ${asset}`);
  verified[key] = { bytes: entry.bytes, sha256: entry.sha256 };
  finished++;
  if (finished % 20 === 0) process.stdout.write(`Verified ${finished}/400 stored objects.\n`);
  writeFileSync(receiptPath, JSON.stringify({ stage: 'uploading', origin, objects: verified }, null, 2) + '\n');
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < entries.length) { const item = entries[cursor++]; await transfer(item); }
}));
writeFileSync(receiptPath, JSON.stringify({ stage: 'all-objects-verified', origin, objects: verified }, null, 2) + '\n');
process.stdout.write('All 400 stored media objects match the validated local release.\n');
process.exit(0);
