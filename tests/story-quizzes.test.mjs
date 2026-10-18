import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'vite';
import { quizCount, quizIssues, publishedQuestions, storyHash, quizHash } from '../scripts/lib/story-quiz-quality.mjs';

const read = name => JSON.parse(readFileSync(new URL('../' + name, import.meta.url), 'utf8'));
const stories = ['reading-path-data', 'reading-expanded-data', 'reading-b2-data'].flatMap(name => read(`app/lib/${name}.json`));
const reviews = read('content/reading/quizzes/reviewed.json');
const published = read('app/lib/reading-quizzes.json');

test('every published story receives two additional, source-bound questions without changing its identity', () => {
  assert.equal(stories.length, 654);
  assert.deepEqual(Object.keys(published).sort(), stories.map(s => s.id).sort());
  assert.deepEqual(Object.keys(reviews).sort(), Object.keys(published).sort());
  const positions = [0, 0, 0];
  let total = 0;
  for (const story of stories) {
    const row = reviews[story.id];
    assert.equal(row.sourceHash, storyHash(story.text), story.id);
    assert.equal(row.review.pass, true, story.id);
    assert.equal(row.review.peerReview.pass, true, story.id);
    assert.equal(row.review.peerReview.sourceHash, row.sourceHash, story.id);
    assert.equal(row.review.peerReview.quizHash, quizHash(row.questions), story.id);
    assert.deepEqual(quizIssues(story, row.questions), [], story.id);
    assert.equal(row.questions.length, story.questions.length + 2, story.id);
    assert.equal(row.questions.length, quizCount(story.level), story.id);
    assert.deepEqual(published[story.id], publishedQuestions(row.questions), story.id);
    assert.ok(row.questions.some((q, i) => JSON.stringify(q.options) !== JSON.stringify(story.questions[i]?.options)), `${story.id}: harder alternatives`);
    for (const q of published[story.id]) {
      assert.deepEqual(Object.keys(q).sort(), ['answer', 'explanation', 'options', 'prompt']);
      positions[q.answer]++; total++;
    }
  }
  assert.equal(total, 3016);
  assert.ok(Math.max(...positions) - Math.min(...positions) < total * .05, 'Answer positions must not give the answer away');
});

test('quiz gates reject missing questions, repeated prompts and fabricated source evidence', () => {
  const story = stories[0], questions = structuredClone(reviews[story.id].questions);
  assert.ok(quizIssues(story, questions.slice(0, -1)).length);
  const invented = structuredClone(questions); invented[0].evidence = ['This invented sentence is not in the German story.'];
  assert.ok(quizIssues(story, invented).some(issue => /exact source excerpt/.test(issue)));
  const repeated = structuredClone(questions); repeated[1].prompt = repeated[0].prompt;
  assert.ok(quizIssues(story, repeated).some(issue => /repeated prompt/.test(issue)));
  const invalid = structuredClone(questions); invalid[0].answer = 3;
  assert.ok(quizIssues(story, invalid).some(issue => /invalid answer/.test(issue)));
});

test('answer positions vary within quizzes instead of following a repeated cycle', () => {
  const sequences = stories.filter(story => story.level === 'B2').map(story => published[story.id].map(q => q.answer));
  assert.ok(new Set(sequences.map(sequence => sequence.join(''))).size >= 40, 'Longer quizzes need varied answer orders');
  const repeating = sequences.filter(sequence => sequence.slice(3).every((answer, index) => answer === sequence[index]));
  assert.ok(repeating.length < sequences.length / 4, 'The second half must not predictably repeat the first half');
});

test('an incomplete editorial bank cannot overwrite the published quizzes', () => {
  const directory = mkdtempSync(join(tmpdir(), 'leselaut-quizzes-'));
  const path = join(directory, 'incomplete.json');
  const before = readFileSync(new URL('../app/lib/reading-quizzes.json', import.meta.url), 'utf8');
  try {
    writeFileSync(path, JSON.stringify({ [stories[0].id]: reviews[stories[0].id] }));
    const result = spawnSync(process.execPath, ['scripts/compile-story-quizzes.mjs', `--source=${path}`], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /incomplete question bank/);
    assert.equal(readFileSync(new URL('../app/lib/reading-quizzes.json', import.meta.url), 'utf8'), before);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('story routes and retained course chapters use the same revised questions', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false } });
  try {
    const { READING_STORIES, getChapterReading } = await vite.ssrLoadModule('/app/lib/reading-path.ts');
    for (const story of READING_STORIES) {
      assert.deepEqual(story.questions, published[story.id]);
      if (story.courseChapter !== null) assert.deepEqual(getChapterReading(story.level, story.courseChapter).questions, story.questions);
    }
  } finally { await vite.close(); }
});

test('missing or stale independent review prevents compiling a release', () => {
  const directory = mkdtempSync(join(tmpdir(), 'leselaut-quiz-review-'));
  const path = join(directory, 'unreviewed.json');
  const first = stories[0].id;
  const before = readFileSync(new URL('../app/lib/reading-quizzes.json', import.meta.url), 'utf8');
  try {
    for (const change of [
      bank => { delete bank[first].review.peerReview; },
      bank => { bank[first].questions[0].explanation += ' This was edited after the peer review.'; },
    ]) {
      const bank = structuredClone(reviews); change(bank);
      writeFileSync(path, JSON.stringify(bank));
      const result = spawnSync(process.execPath, ['scripts/compile-story-quizzes.mjs', `--source=${path}`], { encoding: 'utf8' });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /independent peer review missing|quiz changed after peer review/);
      assert.equal(readFileSync(new URL('../app/lib/reading-quizzes.json', import.meta.url), 'utf8'), before);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
