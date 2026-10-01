import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

// Prepare exact source/voice-plan inputs without changing the published catalog.
const directory = 'content/reading/b1-reviews';
const output = process.argv.find((arg) => arg.startsWith('--out-dir='))?.slice(10);
const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice(7)?.replace(/-v1$/u, '-v2');
assert.ok(output, 'Use --out-dir=/absolute/staging/path');
const drafts = JSON.parse(readFileSync('content/reading/b1-rewrite-drafts.json', 'utf8'));
const speakerData = JSON.parse(readFileSync(`${directory}/speakers.json`, 'utf8'));
const originals = JSON.parse(readFileSync(`${directory}/original-editions.json`, 'utf8'));
assert.equal(originals.length, 200, 'The archived B1 editions must remain complete');
const byId = new Map(originals.map((story) => [story.id, story]));
const sources = [];
const plans = {};
for (const file of readdirSync(directory).filter((name) => /^reading-b1-\d+-v2\.txt$/u.test(name)).sort()) {
  const id = file.slice(0, -4);
  if (only && id !== only) continue;
  const oldId = id.replace(/-v2$/u, '-v1');
  const original = byId.get(oldId);
  const draft = drafts[oldId];
  const storyText = readFileSync(`${directory}/${file}`, 'utf8').trim();
  assert.ok(original && draft?.reviewStatus === 'editorially-accepted', `${id}: no accepted source`);
  assert.equal(draft.text, storyText, `${id}: review file differs from accepted draft`);
  assert.equal(draft.sourceHash, createHash('sha256').update(original.text).digest('hex'), `${id}: stale source`);
  const quoteMatches = [...storyText.matchAll(/„[^“]+“/gu)];
  const speakerRows = speakerData[id] ?? [];
  assert.equal(speakerRows.length, quoteMatches.length, `${id}: every quote needs attribution`);
  const segments = [];
  const assignments = [];
  let cursor = 0;
  for (const [index, match] of quoteMatches.entries()) {
    const row = speakerRows[index];
    assert.equal(row.quote, match[0], `${id}: quote ${index + 1} changed`);
    assert.ok(['male', 'female', 'narrator'].includes(row.voice) && row.speaker && row.evidence,
      `${id}: incomplete quote attribution`);
    if (match.index > cursor) segments.push({ text: storyText.slice(cursor, match.index), voice: 'female', speaker: 'Narrator' });
    segments.push({ text: match[0], voice: row.voice === 'narrator' ? 'female' : row.voice, speaker: row.speaker });
    assignments.push({ index, voice: row.voice, speaker: row.speaker, evidence: row.evidence });
    cursor = match.index + match[0].length;
  }
  if (cursor < storyText.length) segments.push({ text: storyText.slice(cursor), voice: 'female', speaker: 'Narrator' });
  assert.equal(segments.map((segment) => segment.text).join(''), storyText);
  const textHash = createHash('sha256').update(storyText).digest('hex');
  sources.push({ id, level: 'B1', title: original.title, text: storyText,
    hotwords: [...new Set(assignments.filter((row) => row.voice !== 'narrator').map((row) => row.speaker))] });
  plans[id] = { textHash, assignments, segments };
}
assert.ok(sources.length, 'No reviewed stories selected');
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/sources.json`, JSON.stringify(sources, null, 2) + '\n');
writeFileSync(`${output}/plans.json`, JSON.stringify(plans, null, 2) + '\n');
console.log(`Prepared ${sources.length} reviewed B1 source${sources.length === 1 ? '' : 's'} for staged narration`);
