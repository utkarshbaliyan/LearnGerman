import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { b1DraftIssues, germanWordCount } from './lib/b1-draft-quality.mjs';

// One reviewed text file per story keeps editorial diffs readable. Importing
// changes only the unpublished draft checkpoint; it never edits live stories.
const directory = 'content/reading/b1-reviews';
const destination = 'content/reading/b1-rewrite-drafts.json';
const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice(7);
const replace = process.argv.includes('--replace');
const seeds = ['reading-path-data', 'reading-expanded-data']
  .flatMap((name) => JSON.parse(readFileSync(`app/lib/${name}.json`, 'utf8')))
  .filter((story) => story.level === 'B1');
const byId = new Map(seeds.map((seed) => [seed.id, seed]));
const drafts = JSON.parse(readFileSync(destination, 'utf8'));
const files = readdirSync(directory).filter((file) => /^reading-b1-\d+-v2\.txt$/u.test(file));
if (only && !files.some((file) => file === `${only.replace(/-v1$/u, '-v2')}.txt`))
  throw new Error(`No reviewed text for ${only}`);

let imported = 0;
for (const file of files) {
  const id = file.replace(/-v2\.txt$/u, '-v1');
  if (only && id !== only) continue;
  const seed = byId.get(id);
  assert.ok(seed, `${file}: no source story`);
  const text = readFileSync(`${directory}/${file}`, 'utf8').trim();
  assert.deepEqual(b1DraftIssues(seed.text, text), [], `${file}: failed B1 checks`);
  const sourceHash = createHash('sha256').update(seed.text).digest('hex');
  const previous = drafts[id];
  if (previous?.reviewStatus === 'editorially-accepted' && previous.text === text && previous.sourceHash === sourceHash) continue;
  assert.ok(previous?.reviewStatus !== 'editorially-accepted' || replace,
    `${file}: accepted text changed; use --replace after reviewing the revision`);
  drafts[id] = { sourceHash, text, wordCount: germanWordCount(text),
    reviewStatus: 'editorially-accepted', reviewMethod: 'ChatGPT editorial review',
    reviewedAt: new Date().toISOString() };
  imported++;
  console.log(`${id}: imported ${drafts[id].wordCount} reviewed words`);
}
if (imported) {
  writeFileSync(`${destination}.tmp`, JSON.stringify(drafts, null, 2) + '\n');
  renameSync(`${destination}.tmp`, destination);
}
console.log(`Imported ${imported} B1 review${imported === 1 ? '' : 's'}`);
