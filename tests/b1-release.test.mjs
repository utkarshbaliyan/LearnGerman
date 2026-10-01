import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createServer } from 'vite';
import { buildB1Release, validateB1Audio } from '../scripts/lib/b1-release.mjs';

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const directory = 'content/reading/b1-reviews';
const inputs = { originals: read(`${directory}/original-editions.json`), drafts: read('content/reading/b1-rewrite-drafts.json'),
  support: read(`${directory}/reading-support.json`), translations: read(`${directory}/sentence-translations.json`),
  reviews: read(`${directory}/translation-reviews.json`), questions: read(`${directory}/question-reviews.json`),
  speakers: read(`${directory}/speakers.json`) };
const release = buildB1Release(inputs);

test('complete B1 release preserves story identities and uses exact reviewed translations and questions', () => {
  assert.equal(release.stories.length, 200);
  for (const [index, story] of release.stories.entries()) {
    const original = inputs.originals[index];
    assert.equal(story.id, original.id.replace(/-v1$/, '-v2'));
    for (const field of ['number', 'title', 'level', 'section', 'courseChapter']) assert.equal(story[field], original[field]);
    assert.deepEqual(story.topics, original.topics);
    assert.ok(!story.questions.some(question => 'evidence' in question), 'Review evidence stays outside the learner quiz');
    assert.equal(story.english, inputs.translations[story.id].paragraphs.map(paragraph => paragraph.sentences.map(row => row.en).join(' ')).join('\n\n'));
  }
});

test('stale English, question evidence and missing narration block B1 release', () => {
  const id = release.stories[0].id;
  const reviews = { ...inputs.reviews, [id]: { ...inputs.reviews[id], sourceHash: 'stale' } };
  assert.throws(() => buildB1Release({ ...inputs, reviews }), /English review is stale/);
  const questions = { ...inputs.questions, [id]: { ...inputs.questions[id], questions: inputs.questions[id].questions.map(question =>
    ({ ...question, evidence: ['A sentence absent from this story.'] })) } };
  assert.throws(() => buildB1Release({ ...inputs, questions }), /stale evidence/);
  assert.throws(() => validateB1Audio(release.stories[0], release.plans[id], undefined, undefined, []), /missing or stale audio/);
});

test('revised editions preserve old saved results and require separate completion', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
  try {
    const { mergeReadingEditionChecks, readingEditionComplete, currentReadingEditionId, readingEditionId } = await vite.ssrLoadModule('/app/lib/reading-progress.ts');
    const { mergeStoryProgress, markStory } = await vite.ssrLoadModule('/app/lib/story-progress.ts');
    const timestamp = '2026-10-01T00:00:00Z', check = { score: 100, checkedAt: timestamp, usedText: false };
    const oldId = 'reading-b1-01-v1', id = 'reading-b1-01-v2';
    const complete = { reading: check, listening: check, checkpoint: check, completedAt: timestamp };
    const merged = mergeReadingEditionChecks({ [oldId]: complete }, {});
    assert.equal(readingEditionComplete(merged[oldId]), true);
    assert.equal(readingEditionComplete(merged[id]), false);
    const both = mergeReadingEditionChecks(merged, { [id]: { reading: check } });
    assert.equal(readingEditionComplete(both[id]), false);
    assert.deepEqual(both[oldId], complete);
    const stories = mergeStoryProgress(markStory({ entries: {} }, oldId, true, 10), markStory({ entries: {} }, id, false, 20));
    assert.equal(stories.entries[oldId].completed, true);
    assert.equal(stories.entries[id].completed, false);
    assert.equal(currentReadingEditionId(oldId), readingEditionId('B1', 1));
    assert.equal(currentReadingEditionId('reading-b1-01-v99'), 'reading-b1-01-v99');
    assert.equal(currentReadingEditionId('unrelated'), 'unrelated');
  } finally { await vite.close(); }
});

test('an incomplete audio batch cannot alter the published catalog', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const temporary = mkdtempSync(join(tmpdir(), 'leselaut-incomplete-release-'));
  const protectedFiles = ['app/lib/reading-path-data.json', 'app/lib/reading-expanded-data.json',
    'app/lib/reading-audio-manifest.json', 'app/lib/reading-editions.json', 'app/lib/a2-b1-sentence-translations.json',
    'content/reading/dialogue-voices.json'];
  const before = protectedFiles.map(path => readFileSync(path));
  try {
    mkdirSync(join(temporary, directory), { recursive: true });
    writeFileSync(join(temporary, directory, 'audio-manifest.json'), '{}\n');
    const result = spawnSync(process.execPath, ['scripts/prepare-b1-release.mjs', `--audio-root=${temporary}`, '--apply'], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Release blocked/);
    for (const [index, path] of protectedFiles.entries()) assert.deepEqual(readFileSync(path), before[index], path);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
