import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { buildB1Release, digest, validateB1Audio } from './lib/b1-release.mjs';

// Audit by default. Publication requires every reviewed source and all 200 recordings.
const root = resolve(process.argv.find(arg => arg.startsWith('--root='))?.slice(7) ?? '.');
const staged = resolve(process.argv.find(arg => arg.startsWith('--audio-root='))?.slice(13) ?? root);
const read = (path, base = root) => JSON.parse(readFileSync(join(base, path), 'utf8'));
const write = (path, value) => writeFileSync(join(root, path), JSON.stringify(value, null, 2) + '\n');
const directory = 'content/reading/b1-reviews';
const originals = read(`${directory}/original-editions.json`);
const release = buildB1Release({ originals, drafts: read('content/reading/b1-rewrite-drafts.json'),
  support: read(`${directory}/reading-support.json`), translations: read(`${directory}/sentence-translations.json`),
  reviews: read(`${directory}/translation-reviews.json`), questions: read(`${directory}/question-reviews.json`),
  speakers: read(`${directory}/speakers.json`) });
const audio = read(`${directory}/audio-manifest.json`, staged), valid = {}, failures = [];
let bytes = 0;
for (const story of release.stories) {
  try {
    const entry = audio[story.id];
    assert.ok(entry, `${story.id}: missing audio`);
    const sound = join(staged, directory, 'audio', basename(entry.src));
    const timing = join(staged, directory, 'audio', basename(entry.timingSrc));
    validateB1Audio(story, release.plans[story.id], entry, JSON.parse(readFileSync(timing, 'utf8')), readFileSync(sound).subarray(0, 4));
    valid[story.id] = entry;
    bytes += statSync(sound).size + statSync(timing).size;
  } catch (error) { failures.push(error.message); }
}
console.log(JSON.stringify({ reviewedStories: release.stories.length, validRecordings: Object.keys(valid).length,
  audioMiB: Number((bytes / 1024 ** 2).toFixed(2)), failures }, null, 2));
if (!process.argv.includes('--apply')) process.exit(0);
assert.equal(failures.length, 0, 'Release blocked: every B1 source needs matching, validated narration');

// Validate every destination before writing anything. The archived v1 texts are immutable.
const replacements = new Map(release.stories.map(story => [story.number, story]));
const originalByNumber = new Map(originals.map(story => [story.number, story]));
const catalogPaths = ['app/lib/reading-path-data.json', 'app/lib/reading-expanded-data.json'];
const catalogs = catalogPaths.map(path => read(path));
assert.equal(catalogs.flat().filter(story => story.level === 'B1').length, 200);
const nextCatalogs = catalogs.map(stories => stories.map(story => {
  if (story.level !== 'B1') return story;
  const replacement = replacements.get(story.number), archived = originalByNumber.get(story.number);
  assert.ok(replacement && archived, `${story.id}: unknown catalog story`);
  assert.ok((story.id === archived.id && digest(story.text) === digest(archived.text)) ||
    (story.id === replacement.id && digest(story.text) === digest(replacement.text)), `${story.id}: unexpected catalog edit`);
  return replacement;
}));
const translations = read('app/lib/a2-b1-sentence-translations.json');
const manifest = read('app/lib/reading-audio-manifest.json');
const plans = read('content/reading/dialogue-voices.json');
const oldAssets = new Set();
for (const original of originals) {
  const entry = manifest[original.id];
  if (entry) for (const path of [entry.src, entry.timingSrc]) {
    assert.ok(/^\/audio\/reading\/reading-b1-\d+-v1-[a-f0-9-]+-qwen-dialogue-opus24\.(webm|json)$/.test(path), `Unexpected old asset: ${path}`);
    oldAssets.add(path);
  }
  delete translations[original.id]; delete manifest[original.id]; delete plans[original.id];
}
Object.assign(translations, read(`${directory}/sentence-translations.json`));
Object.assign(manifest, valid); Object.assign(plans, release.plans);
const replaceCoverageIds = value => {
  if (typeof value === 'string') return value.replace(/reading-b1-(\d+)-v1/g, 'reading-b1-$1-v2');
  if (Array.isArray(value)) return value.map(replaceCoverageIds);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceCoverageIds(item)]));
  return value;
};
const coverage = ['docs/reading/topic-coverage.json', 'docs/reading/expanded-coverage.json']
  .map(path => [path, replaceCoverageIds(read(path))]);
mkdirSync(join(root, 'public/audio/reading'), { recursive: true });
for (const entry of Object.values(valid)) for (const path of [entry.src, entry.timingSrc])
  copyFileSync(join(staged, directory, 'audio', basename(path)), join(root, 'public', path));
for (const [index, path] of catalogPaths.entries()) write(path, nextCatalogs[index]);
write('app/lib/a2-b1-sentence-translations.json', translations);
write('app/lib/reading-audio-manifest.json', manifest);
write('content/reading/dialogue-voices.json', plans);
for (const [path, value] of coverage) write(path, value);
const csv = 'docs/reading/coverage.csv';
if (existsSync(join(root, csv))) writeFileSync(join(root, csv), replaceCoverageIds(readFileSync(join(root, csv), 'utf8')));
const editions = read('app/lib/reading-editions.json');
write('app/lib/reading-editions.json', { ...editions, B1: 2 });
// Remove only old generated B1 assets, after their complete replacements exist.
const referenced = new Set(Object.values(manifest).flatMap(entry => [entry.src, entry.timingSrc]));
for (const path of oldAssets) if (!referenced.has(path) && existsSync(join(root, 'public', path))) unlinkSync(join(root, 'public', path));
write(`${directory}/release-receipt.json`, { editions: 200, retiredAssets: [...oldAssets],
  sourceHashes: Object.fromEntries(release.stories.map(story => [story.id, digest(story.text)])) });
console.log('Prepared the complete B1 v2 catalog; run the full tests and production build before publishing.');
