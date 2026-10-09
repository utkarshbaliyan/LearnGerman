import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
const root = process.cwd();
const server = () => createServer({ configFile: false, resolve: { alias: { '@': root } }, server: { middlewareMode: true, ws: false } });

test('learning state preserves independent records, Unicode words and newest preferences across devices', async () => {
  const vite = await server();
  try {
    const p = await vite.ssrLoadModule('/app/lib/learning-state.ts');
    const a = p.saveStoryWord(p.emptyLearningProgress(), { german: 'Schlüssel', english: 'key', context: 'Der Schlüssel liegt hier.', storyId: 'reading-a1-01-v3' }, 100);
    const b = p.saveStoryWord(p.emptyLearningProgress(), { german: 'Häuser', english: 'houses', context: 'Neue Häuser.', storyId: 'reading-a2-01-v2' }, 200);
    a.preferences = { level: 'A1', goal: 'everyday', minutes: 10, updatedAt: 100 };
    b.preferences = { level: 'B1', goal: 'work', minutes: 15, updatedAt: 200 };
    const merged = p.mergeLearningProgress(a, b);
    assert.equal(Object.keys(merged.words).length, 2);
    assert.equal(merged.preferences.level, 'B1');
    assert.deepEqual(p.mergeLearningProgress(a, b), p.mergeLearningProgress(b, a));
    const same = p.saveStoryWord(merged, { german: 'Schlüssel', english: 'different', context: 'New.', storyId: 'reading-a1-02-v3' }, 300);
    assert.equal(same.words['word:schlüssel'].context, 'Der Schlüssel liegt hier.');
    assert.equal(same.words['word:schlüssel'].dueAt, 100 + p.DAY);
    assert.deepEqual(p.readLearningProgress({ words: { bad: { german: 'x' } }, preferences: { level: 'C2' } }), p.emptyLearningProgress());
    const withCard = { ...a, words: { ...a.words, 'word:schlüssel': { ...a.words['word:schlüssel'], updatedAt: 500, card: { status: 'review', updatedAt: 500, dueAt: 800, intervalMinutes: 1 } } } };
    assert.equal(p.mergeLearningProgress(a, withCard).words['word:schlüssel'].card.dueAt, 800);
  } finally { await vite.close(); }
});

test('delayed recall counts only unrevealed attempts after the full seven-day interval', async () => {
  const vite = await server();
  try {
    const p = await vite.ssrLoadModule('/app/lib/learning-state.ts');
    const recalls = { first: { id: 'first', key: 'word:gehen', at: 100, correct: true, assisted: false, elapsedDays: 6.999 }, helped: { id: 'helped', key: 'word:gehen', at: 200, correct: true, assisted: true, elapsedDays: 8 }, success: { id: 'success', key: 'word:gehen', at: 300, correct: true, assisted: false, elapsedDays: 7 }, failure: { id: 'failure', key: 'word:gehen', at: 400, correct: false, assisted: false, elapsedDays: 8 } };
    assert.deepEqual(p.delayedRecallSummary({ ...p.emptyLearningProgress(), recalls }), { correct: 1, total: 2, words: 1 });
    assert.equal(p.recallMatches(' SCHLÜSSEL! ', 'Schlüssel'), true);
    assert.equal(p.recallMatches('Schlussel', 'Schlüssel'), false);
  } finally { await vite.close(); }
});

test('recommendation respects level, goal, previous sessions and C1 reading ceiling', async () => {
  const vite = await server();
  try {
    const p = await vite.ssrLoadModule('/app/lib/learning-state.ts');
    const stories = [{ id: 'a1', level: 'A1', number: 1, topics: ['office'] }, { id: 'b1-first', level: 'B1', number: 1, topics: ['home'] }, { id: 'b1-work', level: 'B1', number: 2, topics: ['work'] }, { id: 'b2', level: 'B2', number: 1, topics: ['work'] }];
    const prefs = { level: 'B1', goal: 'work', minutes: 15, updatedAt: 1 };
    assert.equal(p.recommendStory(stories, prefs, new Set(), []).id, 'b1-work');
    assert.equal(p.recommendStory(stories, prefs, new Set(['b1-work']), []).id, 'b1-first');
    assert.equal(p.recommendStory(stories, { ...prefs, level: 'C1' }, new Set(), []).id, 'b2');
  } finally { await vite.close(); }
});

test('mistake memory excludes style and assisted revisions, keeps first-attempt failures, and schedules spaced contexts', async () => {
  const vite = await server();
  try {
    const p = await vite.ssrLoadModule('/app/lib/translation-memory.ts');
    const DAY = 86400000, at = Date.parse('2026-10-01T00:00:00Z');
    const correction = { original: 'Sie kaufen', corrected: 'Sie kauft', explanation: 'Use the singular verb ending.', category: 'grammar', kind: 'error' };
    const f = { number: 1, verdict: 'needs_work', correctTranslation: 'Sie kauft Brot.', explanation: 'Check the verb.', corrections: [correction] };
    const first = { id: 'first-check-00001', createdAt: new Date(at).toISOString(), answers: ['Sie kaufen Brot.'], feedback: [f] };
    const source = { exerciseId: 'translation-source-first-01', checkId: first.id, number: 1 };
    const base = { exerciseId: source.exerciseId, version: 1, session: { kind: 'translation-v1', level: 'A1', checks: [first] } };
    const style = { ...base, exerciseId: 'translation-style-only-01', session: { ...base.session, checks: [{ ...first, feedback: [{ ...f, verdict: 'correct', corrections: [{ ...correction, category: 'style', kind: 'style' }] }] }] } };
    assert.equal(p.buildTranslationMemory([base, style], at).due, 0);
    assert.equal(p.buildTranslationMemory([base, style], at + DAY).due, 1);
    const review = { exerciseId: 'translation-review-fresh-01', version: 1, session: { kind: 'translation-v1', level: 'A1', learning: { reviewSource: source, sourceAt: first.createdAt }, checks: [{ ...first, id: 'review-first-0001', createdAt: new Date(at + 7 * DAY).toISOString(), usedHelp: false }, { ...first, id: 'revision-second-01', createdAt: new Date(at + 7 * DAY + 100).toISOString(), usedHelp: true, feedback: [{ ...f, verdict: 'correct', corrections: [] }] }] } };
    const memory = p.buildTranslationMemory([base, review], at + 7 * DAY + 1000);
    assert.deepEqual(memory.delayed, { correct: 0, total: 1 });
    assert.equal(memory.reviews[0].latestCorrect, false);
    assert.equal(memory.reviews[0].pattern, 'verb-agreement');
    assert.equal(memory.due, 0);
    review.session.checks[0].usedHelp = true;
    assert.deepEqual(p.buildTranslationMemory([base, review], at + 20 * DAY).delayed, { correct: 0, total: 0 });
    base.session.checks.push({ ...first, id: 'late-source-revision', createdAt: new Date(at + 15 * DAY).toISOString() });
    assert.equal(p.buildTranslationMemory([base, review], at + 15 * DAY).reviews[0].dueAt, at + 16 * DAY);
  } finally { await vite.close(); }
});
