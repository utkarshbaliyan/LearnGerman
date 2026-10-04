import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { basename, resolve, join } from 'node:path';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const root = resolve(process.argv.find(a => a.startsWith('--root='))?.slice(7) ?? '.');
const checkpoint = resolve(process.argv.find(a => a.startsWith('--checkpoint-root='))?.slice(18) ?? join(root, '.local-piper/b1-book/checkpoints'));
const base = 'content/books/zwischen-hoersaal-und-arbeitswelt';
const json = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
const digest = text => createHash('sha256').update(text).digest('hex');
const book = json(`${base}/book.json`), english = json(`${base}/translations.json`), glosses = json(`${base}/glosses.json`), plans = json(`${base}/dialogue-voices.json`), manifest = json(`${base}/audio-manifest.json`);
assert.equal(book.pages.length, 200); assert.equal(book.level, 'B1');
assert.equal(Object.keys(english).length, 200); assert.equal(Object.keys(plans).length, 200);
const failures = [], valid = [], validation = {}, registry = {}, objectManifest = {}; let bytes = 0;
for (const page of book.pages) {
  try {
    const text = page.paragraphs.join('\n\n'), hash = digest(text), plan = plans[page.number], audio = manifest[page.number];
    assert.equal(page.paragraphs.length, 4); assert.equal(english[page.number].length, 4);
    assert.ok(english[page.number].every((p, i) => p.source === page.paragraphs[i] && p.en.trim()));
    for (const token of text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? [])
      assert.ok(glosses[token.toLowerCase().replace(/[^a-zäöüßé]/g, '')]?.trim(), `Missing meaning: ${token}`);
    assert.equal(plan.textHash, hash); assert.equal(plan.segments.map(s => s.text).join(''), text);
    const serialized = '[' + plan.segments.map(s => '[' + JSON.stringify(s.voice) + ', ' + JSON.stringify(s.text) + ']').join(', ') + ']';
    const name = `p${String(page.number).padStart(3, '0')}-page-${hash.slice(0, 12)}-${digest(serialized).slice(0, 8)}-qwen-dialogue-opus16`;
    assert.ok(audio, 'Recording missing'); assert.equal(audio.textHash, hash);
    assert.equal(audio.src, `/audio/books/${book.id}/${name}.webm`); assert.equal(audio.timingSrc, `/audio/books/${book.id}/${name}.json`);
    const sound = join(root, base, 'audio', basename(audio.src)), sidecar = join(root, base, 'audio', basename(audio.timingSrc));
    const timing = JSON.parse(readFileSync(sidecar, 'utf8'));
    assert.equal(readFileSync(sound).subarray(0, 4).toString('hex'), '1a45dfa3');
    assert.equal(timing.textHash, hash); assert.equal(timing.duration, audio.duration);
    assert.equal(audio.wordCount, text.split(/\s+/).length); assert.equal(timing.starts.length, audio.wordCount);
    assert.ok(timing.starts.every((s, i) => Number.isFinite(s) && s >= 0 && s < audio.duration && (i === 0 || s > timing.starts[i - 1])));
    const transcript = JSON.parse(readFileSync(join(checkpoint, `${name}-transcript.json`), 'utf8'));
    assert.ok(transcript.coverage >= .9 && transcript.excess <= .12, 'Transcript validation');
    validation[page.number] = { audioHash: digest(readFileSync(sound)), coverage: transcript.coverage, excess: transcript.excess };
    const published = [];
    for (const [file, contentType] of [[sound, 'audio/webm'], [sidecar, 'application/json']]) {
      const sha256 = digest(readFileSync(file)), localFilename = basename(file);
      const objectFilename = localFilename.replace(/(\.(?:webm|json))$/, `-${sha256.slice(0, 12)}$1`);
      const key = `books/${book.id}/${objectFilename}`;
      registry[key] = { sha256, bytes: statSync(file).size, contentType, localFilename };
      published.push(`/media/${key}`);
    }
    objectManifest[page.number] = { ...audio, src: published[0], timingSrc: published[1] };
    bytes += statSync(sound).size + statSync(sidecar).size; valid.push(page.number);
  } catch (e) { failures.push({ page: page.number, reason: e.message }); }
}
console.log(JSON.stringify({ pages: 200, validRecordings: valid.length, mediaMiB: Number((bytes / 1024 ** 2).toFixed(2)), failures }, null, 2));
if (!process.argv.includes('--apply')) process.exit(0);
assert.equal(failures.length, 0, 'Release blocked: all 200 B1 pages need exact translations, meanings and validated narration');
assert.equal(Object.keys(manifest).length, 200);
assert.equal(Object.keys(registry).length, 400);
writeFileSync(join(root, base, 'object-manifest.json'), JSON.stringify(objectManifest, null, 2) + '\n');
writeFileSync(join(root, base, 'media-registry.json'), JSON.stringify(registry, null, 2) + '\n');
writeFileSync(join(root, base, 'release-receipt.json'), JSON.stringify({ id: book.id, pages: 200, paragraphs: 800, mediaBytes: bytes,
  validation, sourceHashes: Object.fromEntries(book.pages.map(p => [p.number, digest(p.paragraphs.join('\n\n'))])) }, null, 2) + '\n');
console.log('All 200 B1 recordings validated; exact-hash media registry prepared. Stored-byte verification, build and full tests remain required.');
