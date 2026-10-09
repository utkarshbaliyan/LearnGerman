import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
const source = { kind: 'story', id: 'reading-a1-01-v3', href: '/stories/reading-a1-01-v3', title: 'First story', level: 'A1' };
const input = { german: 'Schlüssel', english: 'key', context: 'Der Schlüssel liegt hier.', source };
async function fixture(run) {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
  try { await run({ ...await vite.ssrLoadModule('/app/lib/progress-sync.ts'), ...await vite.ssrLoadModule('/app/lib/flashcard-progress.ts'), ...await vite.ssrLoadModule('/app/lib/saved-vocabulary.ts'), ...await vite.ssrLoadModule('/app/lib/learning-state.ts') }); }
  finally { await vite.close(); }
}
test('story and book saves share a headword schedule, are due immediately, and never restart a reviewed card', () => fixture(p => {
  const first = p.collectVocabularyWord(p.emptyVocabularyProgress(), input, 100);
  const key = p.vocabularyCardKey(input);
  assert.equal(p.vocabularyReviewDueAt(first, input), 100);
  const reviewed = p.rateVocabularyFlashcard(first, input, 3, 200);
  const again = p.collectVocabularyWord(reviewed, { ...input, german: 'der Schlüssel', source: { kind: 'book', id: 'der-schluessel-im-blauen-korb', href: '/books/a1/der-schluessel-im-blauen-korb/2', title: 'Page 2', level: 'A1' } }, 300);
  assert.equal(Object.keys(again.words).length, 1);
  assert.deepEqual(again.cards[key], reviewed.cards[key]);
  assert.equal(again.words[key].context, input.context);
  const verb = p.collectVocabularyWord(again, { ...input, german: 'ging', english: 'went' }, 400);
  assert.equal(p.isVocabularyReview(verb, { german: 'gehen', english: 'to go' }), true);
  const familiar = p.setVocabularyStatus(verb, input, 'learned', 500);
  assert.equal(p.isVocabularyLearned(familiar, again.words[key]), true);
}));
test('legacy migration preserves due dates, FSRS and recall history without overwriting a newer shared decision', () => fixture(p => {
  const legacy = p.saveStoryWord(p.emptyLearningProgress(), { german: input.german, english: input.english, context: input.context, storyId: source.id }, 100);
  const key = p.vocabularyCardKey(input), oldKey = p.personalWordKey(input.german);
  const rated = p.rateVocabularyFlashcard(p.collectVocabularyWord(p.emptyVocabularyProgress(), input, 100), input, 3, 300);
  legacy.words[oldKey].card = rated.cards[key]; legacy.words[oldKey].updatedAt = 300; legacy.words[oldKey].dueAt = rated.cards[key].dueAt;
  legacy.recalls.first = { id: 'first', key: oldKey, at: 300, correct: true, assisted: false, elapsedDays: 8 };
  const before = JSON.stringify(legacy), migrated = p.migrateReadingVocabulary(p.emptyVocabularyProgress(), legacy);
  assert.deepEqual(migrated.cards[key], rated.cards[key]);
  assert.deepEqual(migrated.recalls, legacy.recalls);
  assert.equal(JSON.stringify(legacy), before);
  assert.deepEqual(p.migrateReadingVocabulary(migrated, legacy), migrated);
  const fresh = p.setVocabularyStatus(migrated, input, 'unlearned', 500);
  assert.equal(p.migrateReadingVocabulary(fresh, legacy).cards[key].status, 'unlearned');
  const unreviewed = p.saveStoryWord(p.emptyLearningProgress(), { german: 'Haus', english: 'house', context: 'Ein Haus.', storyId: source.id }, 200);
  assert.equal(p.migrateReadingVocabulary(fresh, unreviewed).cards['de:haus'].dueAt, 200 + p.DAY);
}));
test('concurrent device merges preserve sources and newest schedules while rejecting malformed word metadata', () => fixture(p => {
  const a = p.collectVocabularyWord(p.emptyVocabularyProgress(), input, 100);
  const b = p.collectVocabularyWord(p.emptyVocabularyProgress(), { ...input, german: 'Haus', english: 'house', source: { kind: 'book', id: 'nicht-nur-ein-profil', href: '/books/a2/nicht-nur-ein-profil/1', title: 'Book', level: 'A2' } }, 200);
  const newer = p.rateVocabularyFlashcard(a, input, 3, 500);
  const merged = p.mergeVocabularyProgress(p.mergeVocabularyProgress(a, b), newer);
  assert.equal(Object.keys(merged.words).length, 2);
  assert.deepEqual(merged.cards['de:schlüssel'], newer.cards['de:schlüssel']);
  const reverse = p.mergeVocabularyProgress(b, a), forward = p.mergeVocabularyProgress(a, b);
  assert.deepEqual(reverse.words, forward.words); assert.deepEqual(reverse.cards, forward.cards);
  assert.deepEqual(new Set(reverse.reviewKeys), new Set(forward.reviewKeys));
  assert.deepEqual(p.readCollectedWords({ 'de:schlüssel': { ...a.words['de:schlüssel'], source: { ...source, href: 'javascript:alert(1)' } } }), {});
  assert.deepEqual(p.readCollectedWords({ 'de:wrong': a.words['de:schlüssel'] }), {});
  assert.throws(() => p.collectVocabularyWord(a, { ...input, german: '', source }, 600));
  const full = { ...a, words: Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`de:wort${i}`, { ...a.words['de:schlüssel'], german: `Wort${i}` }])) };
  assert.throws(() => p.collectVocabularyWord(full, { ...input, german: 'Zusatz' }, 700));
  assert.equal(Object.keys(p.mergeVocabularyProgress(full, b).words).length, 501, 'concurrent collections retain existing words at the limit');
}));
test('custom reading words round-trip in vocabulary and join the library and practice without duplicate headwords', () => fixture(p => {
  const saved = p.collectVocabularyWord(p.emptyVocabularyProgress(), input, 100);
  const storage = new Map(); const adapter = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) };
  p.writeVocabularyProgress(adapter, saved);
  const restored = p.readVocabularyProgress(adapter);
  assert.deepEqual(restored.words, saved.words);
  const catalog = [{ id: 'catalog-key', german: 'der Schlüssel', english: 'key', category: 'Zuhause & Wohnen', level: 'A1' }];
  assert.equal(p.connectedVocabulary(catalog, restored).length, 1);
  const custom = p.collectVocabularyWord(restored, { ...input, german: 'Bücherkorb', english: 'book basket' }, 200);
  const connected = p.connectedVocabulary(catalog, custom);
  assert.equal(connected.length, 2); assert.equal(connected[1].progressByHeadword, true);
  assert.equal(p.isVocabularyReview(custom, connected[1]), true);
}));
test('typed recall and its updated schedule are saved together; old and new keys do not inflate delayed unique words', () => fixture(p => {
  const saved = p.collectVocabularyWord(p.emptyVocabularyProgress(), input, 100);
  const attempt = { id: 'typed-first', key: 'de:schlüssel', at: 100 + 8 * p.DAY, correct: true, assisted: false, elapsedDays: 8 };
  const rated = p.rateVocabularyFlashcard(saved, input, 3, attempt.at, attempt);
  assert.deepEqual(rated.recalls[attempt.id], attempt); assert.equal(rated.cards[attempt.key].memory.reps, 1);
  assert.throws(() => p.rateVocabularyFlashcard(saved, input, 3, attempt.at, { ...attempt, key: 'de:other' }));
  const old = { ...attempt, id: 'old-first', key: 'word:schlüssel' };
  const helped = { ...attempt, id: 'helped', assisted: true };
  assert.deepEqual(p.delayedRecallSummary({ ...p.emptyLearningProgress(), recalls: { ...rated.recalls, [old.id]: old, [helped.id]: helped } }), { correct: 2, total: 2, words: 1 });
  const merged = p.mergeVocabularyProgress(saved, rated);
  assert.deepEqual(merged.recalls, rated.recalls);
}));
