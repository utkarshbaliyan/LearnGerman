import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { b1DraftIssues, germanWordCount } from '../scripts/lib/b1-draft-quality.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const digest = (text) => createHash('sha256').update(text).digest('hex');
const drafts = JSON.parse(read('content/reading/b1-rewrite-drafts.json'));
const speakers = JSON.parse(read('content/reading/b1-reviews/speakers.json'));
const audio = JSON.parse(read('content/reading/b1-reviews/audio-manifest.json'));
const originals = JSON.parse(read('content/reading/b1-reviews/original-editions.json'));
assert.equal(originals.length, 200, 'The archived B1 editions must remain complete');
const byId = new Map(originals.map((story) => [story.id, story]));
const reviewDirectory = new URL('content/reading/b1-reviews/', root);
const files = readdirSync(reviewDirectory).filter((name) => /^reading-b1-\d+-v2\.txt$/u.test(name));

test('reviewed B1 editions match current source hashes and quote attribution', () => {
  assert.ok(files.length > 0);
  for (const file of files) {
    const id = file.slice(0, -4);
    const oldId = id.replace(/-v2$/u, '-v1');
    const source = byId.get(oldId);
    const accepted = drafts[oldId];
    const text = read(`content/reading/b1-reviews/${file}`).trim();
    assert.ok(source && accepted, id);
    assert.equal(accepted.reviewStatus, 'editorially-accepted', id);
    assert.equal(accepted.sourceHash, digest(source.text), id);
    assert.equal(accepted.text, text, id);
    assert.equal(accepted.wordCount, germanWordCount(text), id);
    assert.deepEqual(b1DraftIssues(source.text, text), [], id);
    const quotes = [...text.matchAll(/„[^“]+“/gu)].map((match) => match[0]);
    const attribution = speakers[id] ?? [];
    assert.deepEqual(attribution.map((row) => row.quote), quotes, `${id}: every quote must have exact attribution`);
    for (const row of attribution) {
      assert.ok(['male', 'female', 'narrator'].includes(row.voice), id);
      assert.ok(row.speaker && row.evidence, id);
    }
  }
  assert.deepEqual(Object.keys(speakers).sort(), files.filter((file) => speakers[file.slice(0, -4)]).map((file) => file.slice(0, -4)).sort());
});

test('every staged B1 recording and timing sidecar matches the reviewed edition', () => {
  for (const [id, entry] of Object.entries(audio)) {
    const file = `${id}.txt`;
    assert.ok(files.includes(file), `${id}: audio has no reviewed story`);
    const text = read(`content/reading/b1-reviews/${file}`).trim();
    assert.equal(entry.textHash, digest(text), id);
    assert.equal(entry.wordCount, germanWordCount(text), id);
    const segments = [];
    let cursor = 0;
    for (const [i, quote] of [...text.matchAll(/„[^“]+“/gu)].entries()) {
      if (quote.index > cursor) segments.push(['female', text.slice(cursor, quote.index)]);
      const assigned = speakers[id][i].voice;
      segments.push([assigned === 'narrator' ? 'female' : assigned, quote[0]]);
      cursor = quote.index + quote[0].length;
    }
    if (cursor < text.length) segments.push(['female', text.slice(cursor)]);
    // Match Python's ensure_ascii=False JSON representation used by the renderer.
    const plan = '[' + segments.map(([voice, segment]) =>
      '[' + JSON.stringify(voice) + ', ' + JSON.stringify(segment) + ']').join(', ') + ']';
    const voiceHash = digest(plan).slice(0, 8);
    assert.ok(entry.src.split('/').at(-1).startsWith(`${id}-${digest(text).slice(0, 12)}-${voiceHash}-qwen-dialogue-opus`),
      `${id}: recording uses a stale character voice plan`);
    assert.equal(entry.timingSrc, entry.src.replace(/\.webm$/, '.json'), `${id}: timing belongs to another recording`);
    const sound = new URL(`content/reading/b1-reviews/audio/${entry.src.split('/').at(-1)}`, root);
    const timing = new URL(`content/reading/b1-reviews/audio/${entry.timingSrc.split('/').at(-1)}`, root);
    assert.ok(existsSync(sound) && existsSync(timing), id);
    const sidecar = JSON.parse(readFileSync(timing, 'utf8'));
    assert.equal(sidecar.textHash, entry.textHash, id);
    assert.equal(sidecar.starts.length, entry.wordCount, id);
    assert.equal(sidecar.duration, entry.duration, id);
    assert.ok(sidecar.starts.every((start, index) => Number.isFinite(start) && start >= 0 &&
      start <= sidecar.duration && (index === 0 || start >= sidecar.starts[index - 1])),
      `${id}: invalid spoken-word timing`);
  }
});
