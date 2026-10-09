import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null } });
after(() => vite.close());
const p = await vite.ssrLoadModule('/app/lib/recall-decks.ts');
const learning = await vite.ssrLoadModule('/app/lib/learning-state.ts');
const sync = await vite.ssrLoadModule('/app/lib/progress-merge.ts');
const vocabulary = await vite.ssrLoadModule('/app/lib/progress-sync.ts');
const flashcards = await vite.ssrLoadModule('/app/lib/flashcard-progress.ts');
const words = Array.from({ length: 16 }, (_, i) => ({ german: `Wort ${i}`, english: `word ${i}`, key: `de:wort ${i}`, progressByHeadword: true }));
const deck = () => p.startRecallDeck(p.createRecallDeck('deck-one', 'First deck', words.slice(0, 5), 100), 'run-one', 200, () => .5);
const answer = (key, at = 300, correct = true, assisted = false) => ({ id: `attempt-${at}`, key, at, correct, assisted, elapsedDays: 8 });

test('decks require 5–15 unique canonical words and reject corrupt records or unsafe source links', () => {
  assert.throws(() => p.createRecallDeck('small', 'Small', words.slice(0, 4)));
  assert.throws(() => p.createRecallDeck('big', 'Big', words));
  assert.equal(p.createRecallDeck('max', 'Maximum', words.slice(0, 15)).words.length, 15);
  assert.throws(() => p.createRecallDeck('duplicate', 'Duplicate', [words[0], words[0], ...words.slice(1, 4)]));
  assert.throws(() => p.createRecallDeck('wrong-key', 'Wrong key', [{ ...words[0], key: words[1].key }, ...words.slice(1, 5)]));
  assert.throws(() => p.createRecallDeck('unsafe', 'Unsafe', [{ ...words[0], sourceHref: 'https://elsewhere.invalid' }, ...words.slice(1, 5)]));
  assert.deepEqual(p.readRecallDecks({ wrong: deck(), broken: { words } }), {});
});

test('deck rounds retain first attempts, resume remaining words, and keep assistance explicit', () => {
  const original = deck(), key = original.run.order[0];
  const first = p.recordDeckAnswer(original, original.run.id, answer(key, 300, false, true));
  const retry = p.recordDeckAnswer(first, original.run.id, answer(key, 500, true));
  assert.deepEqual(retry, first);
  assert.equal(first.run.answers[key].assisted, true);
  const reloaded = p.readRecallDecks({ [first.id]: JSON.parse(JSON.stringify(first)) })[first.id];
  assert.equal(reloaded.run.order.find(k => !reloaded.run.answers[k]), original.run.order[1]);
  assert.throws(() => p.recordDeckAnswer(original, 'other-run', answer(key)));
  assert.throws(() => p.recordDeckAnswer(original, original.run.id, answer('de:unselected')));
});

test('concurrent deck answers merge without losing first attempts or replacing a newer round with old offline answers', () => {
  const original = deck();
  const a = p.recordDeckAnswer(original, original.run.id, answer(original.run.order[0], 300));
  const b = p.recordDeckAnswer(original, original.run.id, answer(original.run.order[1], 400));
  const merge = p.mergeRecallDecks({ [a.id]: a }, { [b.id]: b });
  assert.equal(Object.keys(merge[a.id].run.answers).length, 2);
  assert.deepEqual(merge, p.mergeRecallDecks({ [b.id]: b }, { [a.id]: a }));
  const conflicting = p.recordDeckAnswer(original, original.run.id, answer(original.run.order[0], 350, false));
  assert.equal(p.mergeRecallDecks({ [a.id]: a }, { [a.id]: conflicting })[a.id].run.answers[original.run.order[0]].correct, true);
  const newRound = p.startRecallDeck(a, 'run-two', 600);
  const lateOld = p.recordDeckAnswer(a, original.run.id, answer(original.run.order[2], 1000));
  assert.equal(p.mergeRecallDecks({ [a.id]: newRound }, { [a.id]: lateOld })[a.id].run.id, 'run-two');
  assert.deepEqual(p.mergeRecallDecks({ [a.id]: newRound }, { [a.id]: lateOld }), p.mergeRecallDecks({ [a.id]: lateOld }, { [a.id]: newRound }));
});

test('learning sync preserves legacy sessions, reading words and decks, including concurrent creations over the UI limit', () => {
  const legacy = learning.saveStoryWord(learning.emptyLearningProgress(), { german: 'Haus', english: 'house', context: 'Das Haus.', storyId: 'reading-a1-01-v1' }, 10);
  legacy.preferences = { level: 'B1', goal: 'work', minutes: 15, updatedAt: 50 };
  const a = { ...legacy, decks: Object.fromEntries(Array.from({ length: 30 }, (_, i) => { const d = p.createRecallDeck(`left-${i}`, 'Left', words.slice(0, 5), i); return [d.id, d]; })) };
  const b = { ...learning.emptyLearningProgress(), decks: Object.fromEntries(Array.from({ length: 30 }, (_, i) => { const d = p.createRecallDeck(`right-${i}`, 'Right', words.slice(0, 5), i); return [d.id, d]; })) };
  const merged = sync.mergeProgress('learning', a, b);
  assert.equal(Object.keys(merged.decks).length, 60, 'valid independent decks survive concurrent device creation');
  assert.deepEqual(merged.words, legacy.words);
  assert.deepEqual(merged.preferences, legacy.preferences);
  assert.deepEqual(merged, sync.mergeProgress('learning', b, a));
});

test('a deck recall updates the same vocabulary card and evidence while leaving unrelated schedules intact', () => {
  const original = deck(), word = original.words[0];
  const other = { german: 'Haus', english: 'house', progressByHeadword: true };
  let current = vocabulary.scheduleVocabularyReview(vocabulary.emptyVocabularyProgress(), other, 10000, 100);
  const previous = current.cards[vocabulary.vocabularyCardKey(other)];
  const attempt = answer(word.key, 864000100, true, false);
  current = flashcards.rateVocabularyFlashcard(current, word, 3, attempt.at, attempt);
  assert.equal(current.cards[word.key].status, 'review');
  assert.equal(current.recalls[attempt.id].correct, true);
  assert.deepEqual(current.cards[vocabulary.vocabularyCardKey(other)], previous);
  assert.equal(p.recordDeckAnswer(original, original.run.id, attempt).run.answers[word.key].id, current.recalls[attempt.id].id);
});

test('deck vocabulary search supports all levels, deduplicates card identities and bounds public results and inputs', async () => {
  const api = await vite.ssrLoadModule('/app/api/learning/words/route.ts');
  const get = params => api.GET(new Request(`http://local/api/learning/words?${params}`));
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const response = await get(`level=${level}`); assert.equal(response.status, 200);
    const { words: result } = await response.json();
    assert.ok(result.length >= 15 && result.length <= 24);
    assert.equal(new Set(result.map(w => w.key)).size, result.length);
    assert.ok(result.every(w => w.key === vocabulary.vocabularyCardKey(w)));
  }
  assert.equal((await get('level=C2')).status, 400);
  assert.equal((await get(`q=${'a'.repeat(81)}`)).status, 400);
  const { words: found } = await (await get('level=A1&q=house')).json();
  assert.ok(found.length && found.every(w => /house/i.test(`${w.german} ${w.english}`)));
});

test('mounted daily and review forms have unique label targets and hide German recall models', async () => {
  const { LearningWordReview } = await vite.ssrLoadModule('/app/components/learning-word-review.tsx');
  const { TranslationWorkspace } = await vite.ssrLoadModule('/app/active-learning/translation-workspace.tsx');
  const html = renderToStaticMarkup(createElement(Fragment, null,
    createElement(LearningWordReview, { word: words[0], onDone() {} }),
    createElement(LearningWordReview, { word: words[1], onDone() {} }),
    createElement(TranslationWorkspace), createElement(TranslationWorkspace)));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const labels = [...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]);
  assert.ok(labels.length >= 4);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(labels.every(id => ids.includes(id)));
  assert.doesNotMatch(html, /Wort 0|Wort 1/);
});
