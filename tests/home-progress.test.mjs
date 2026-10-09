import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null } });
after(() => vite.close());
const home = await vite.ssrLoadModule('/app/lib/home-progress.ts');
const progress = await vite.ssrLoadModule('/app/lib/progress-sync.ts');

test('Home word counts retain catalog statuses, reading additions and explicit familiar changes without changing progress', () => {
  const catalog = ['Haus', 'Baum', 'Brot'].map((german, i) => ({ id: `sample-${i}`, german, english: `meaning-${i}`, level: 'A1', category: 'Grundlagen & Kommunikation' }));
  let state = progress.setVocabularyStatus(progress.emptyVocabularyProgress(), catalog[0], 'learned', 100);
  state = progress.setVocabularyStatus(state, catalog[1], 'review', 101);
  state = progress.collectVocabularyWord(state, { german: 'Schlüssel', english: 'key', context: 'Der Schlüssel ist hier.', source: { kind: 'story', id: 'reading-a1-01-v1', href: '/stories/reading-a1-01-v1', title: 'A story', level: 'A1' } }, 102);
  const before = JSON.stringify(state);
  assert.deepEqual(home.vocabularyOverview(catalog, state), { total: 4, learned: 1, review: 2, unlearned: 1 });
  assert.equal(JSON.stringify(state), before);
  const familiar = progress.markVocabularyRead(state, catalog[1], 103);
  assert.deepEqual(home.vocabularyOverview(catalog, familiar), { total: 4, learned: 2, review: 1, unlearned: 1 });
});

test('Home grammar completion matches required course sets and ignores retired lesson IDs', () => {
  const lessons = ['a1-1-1', 'a1-1-2', 'a1-1-3'].map(id => ({ id, title: id, requiredSets: ['Core practice', 'Apply'] }));
  const grammar = { completed: ['a1-1-1', 'retired-lesson'], scores: {}, sets: {} };
  const course = { chapters: { 'a1-1-2': { grammarSets: { 'Core practice': 100 } }, 'a1-1-3': { grammarSets: { 'Core practice': 100, Apply: 50 } } } };
  const result = home.grammarOverview(grammar, course, lessons);
  assert.equal(result.total, 3); assert.equal(result.completed, 2); assert.equal(result.started, 3);
  assert.equal(result.next.id, 'a1-1-2', 'a high partial score does not finish a lesson');
  assert.deepEqual(grammar.completed, ['a1-1-1', 'retired-lesson']);
  course.chapters['a1-1-2'].grammarSets.Apply = 0;
  assert.equal(home.grammarOverview(grammar, course, lessons).next, undefined);
});

test('stateless Home summaries accept legacy vocabulary marks, preserve explicit decisions and bound malformed requests', async () => {
  const api = await vite.ssrLoadModule('/app/api/learning/overview/route.ts');
  const { ALL_VOCABULARY } = await vite.ssrLoadModule('/app/vocabulary/data.ts');
  const word = ALL_VOCABULARY[0];
  const post = body => api.POST(new Request('http://local/api/learning/overview', { method: 'POST', body: JSON.stringify(body) }));
  const empty = await post({ vocabulary: {} });
  assert.equal(empty.status, 200); assert.match(empty.headers.get('cache-control'), /private, no-store/);
  assert.deepEqual(await empty.json(), { total: ALL_VOCABULARY.length, learned: 0, review: 0, unlearned: ALL_VOCABULARY.length });
  const legacy = { [progress.VOCABULARY_LEGACY_STORAGE_KEYS[0]]: JSON.stringify({ completed: [word.id] }) };
  const old = await (await post({ vocabulary: {}, legacy })).json(); assert.ok(old.learned > 0);
  const current = progress.setVocabularyStatus({ ...progress.emptyVocabularyProgress(), legacyMigrated: true }, word, 'review', 200);
  const result = await (await post({ vocabulary: current, legacy })).json();
  assert.equal(result.learned, 0); assert.ok(result.review > 0); assert.equal(result.total, result.learned + result.review + result.unlearned);
  assert.equal((await post({ vocabulary: [] })).status, 400);
  assert.equal((await post({})).status, 400);
  assert.equal((await api.POST(new Request('http://local/api/learning/overview', { method: 'POST', body: '{' }))).status, 400);
  assert.equal((await api.POST(new Request('http://local/api/learning/overview', { method: 'POST', body: 'x'.repeat(1_000_001) }))).status, 413);
});

test('Active Learning activity counts first checked sets and sentences once, including helped practice without inflating recall evidence', async () => {
  const p = await vite.ssrLoadModule('/app/lib/translation-memory.ts');
  const feedback = number => ({ number, verdict: 'correct', correctTranslation: 'Ich lese.', explanation: 'Correct.', corrections: [] });
  const first = { id: 'first-check', createdAt: '2026-10-01T00:00:00Z', answers: [], feedback: [feedback(1), feedback(2)], usedHelp: true };
  const records = [
    { exerciseId: 'saved-unchecked', session: { checks: [] } },
    { exerciseId: 'checked-set', session: { checks: [first, { ...first, id: 'revision', feedback: [feedback(1), feedback(2)] }] } },
    { exerciseId: 'compressed-single-check', session: { checks: [{ ...first, feedback: [feedback(1), feedback(1)] }, first] } },
  ];
  const result = p.buildTranslationMemory(records);
  assert.deepEqual(result.activity, { savedSets: 3, checkedSets: 2, checkedSentences: 3 });
  assert.deepEqual(result.independent, { correct: 0, total: 0 });
  assert.deepEqual(result.delayed, { correct: 0, total: 0 });
});
