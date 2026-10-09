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
const review = await vite.ssrLoadModule('/app/lib/review-deck.ts');
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

test('shared Review includes only explicit German review marks and saved reading words, with no synonym filler', () => {
  const library = [{ german: 'die Bank', english: 'bank' }, { german: 'das Ufer', english: 'bank' }, { german: 'Haus', english: 'house' }];
  let state = vocabulary.setVocabularyStatus(vocabulary.emptyVocabularyProgress(), library[0], 'review', 100);
  state = vocabulary.setVocabularyStatus(state, library[2], 'learned', 101);
  assert.deepEqual(review.sharedReviewWords(library, state).map(w => w.key), ['de:bank']);
  assert.ok(review.reviewLookupKeys(state).every(k => k.startsWith('de:')));
  const source = { kind: 'story', id: 'reading-a1-01-v3', href: '/stories/reading-a1-01-v3', title: 'A story', level: 'A1' };
  state = vocabulary.collectVocabularyWord(state, { german: 'Bank', english: 'bench', context: 'Die Bank ist blau.', source }, 102);
  state = vocabulary.collectVocabularyWord(state, { german: 'Schlüssel', english: 'key', context: 'Der Schlüssel liegt hier.', source: { ...source, kind: 'book', id: 'der-schluessel-im-blauen-korb', href: '/books/a1/der-schluessel-im-blauen-korb/1' } }, 103);
  const pool = review.sharedReviewWords(library, state);
  assert.equal(pool.length, 2); assert.equal(new Set(pool.map(w => w.key)).size, 2);
  assert.equal(pool.find(w => w.key === 'de:bank').sourceKind, 'story');
  assert.equal(pool.find(w => w.key === 'de:schlüssel').sourceKind, 'book');
  assert.equal(review.reviewLookupKeys(state).length, 0, 'reading metadata resolves its own words');
  state = vocabulary.markVocabularyRead(state, library[0], 104);
  assert.deepEqual(review.sharedReviewWords(library, state).map(w => w.key), ['de:schlüssel']);
});

test('8, 10 and 12 word flashcard rounds use only Review, preserve shortages, and resume after reload', () => {
  let state = vocabulary.emptyVocabularyProgress();
  for (const [i, word] of words.entries()) state = vocabulary.setVocabularyStatus(state, word, 'review', 100 + i);
  for (const size of [8, 10, 12]) {
    const round = review.startSharedReviewSession(`round-${size}`, `run-${size}`, words, state, size, 200, () => .5);
    assert.equal(round.words.length, size); assert.equal(round.requestedSize, size);
    assert.equal(new Set(round.run.order).size, size);
    assert.ok(round.words.every(w => vocabulary.isVocabularyReview(state, w)));
    const reloaded = learning.readLearningProgress({ reviewSession: JSON.parse(JSON.stringify(round)) });
    assert.deepEqual(reloaded.reviewSession, JSON.parse(JSON.stringify(round)));
    assert.equal(review.remainingReviewWords(round, review.sharedReviewWords(words, state)).length, size);
  }
  const short = review.startSharedReviewSession('short-review', 'short-run', words.slice(0, 1), state, 12, 200);
  assert.equal(short.words.length, 1); assert.equal(short.requestedSize, 12);
  assert.equal(learning.readLearningProgress({ reviewSession: short }).reviewSession.words.length, 1);
  assert.throws(() => review.startSharedReviewSession('empty-review', 'empty-run', words, vocabulary.emptyVocabularyProgress(), 8));
  assert.throws(() => review.startSharedReviewSession('invalid-size', 'invalid-run', words, state, 9));
});

test('Mark as read shares familiar progress and removes the word from a round without erasing FSRS or counting recall evidence', () => {
  const word = words[0], other = words[1];
  let state = vocabulary.setVocabularyStatus(vocabulary.emptyVocabularyProgress(), other, 'review', 50);
  state = flashcards.rateVocabularyFlashcard(state, word, 3, 100);
  const round = review.startSharedReviewSession('reading-round', 'reading-run', words, state, 8, 150);
  const before = state.cards[word.key], unrelated = state.cards[other.key];
  const next = vocabulary.markVocabularyRead(state, word, 200);
  assert.equal(vocabulary.isVocabularyLearned(next, word), true); assert.equal(vocabulary.isVocabularyReview(next, word), false);
  assert.deepEqual(next.cards[word.key].memory, before.memory);
  assert.equal(next.cards[word.key].dueAt, before.dueAt); assert.equal(next.cards[word.key].intervalMinutes, before.intervalMinutes);
  assert.deepEqual(next.cards[other.key], unrelated); assert.deepEqual(next.recalls, state.recalls);
  const pool = review.sharedReviewWords(words, next);
  assert.deepEqual(review.remainingReviewWords(round, pool).map(w => w.key), [other.key]);
  assert.equal(vocabulary.isVocabularyReview(state, word), true, 'the input state stays intact');
});

test('review-session sync merges answers and chooses a newer round over late answers while retaining legacy decks', () => {
  let state = vocabulary.emptyVocabularyProgress();
  for (const word of words.slice(0, 3)) state = vocabulary.setVocabularyStatus(state, word, 'review', 100);
  const round = review.startSharedReviewSession('review-one', 'review-run-one', words, state, 8, 200);
  const a = p.recordDeckAnswer(round, round.run.id, { ...answer(round.run.order[0], 300), assisted: true, action: 'flashcard', rating: 3 });
  const b = p.recordDeckAnswer(round, round.run.id, { ...answer(round.run.order[1], 400), assisted: true, action: 'read' });
  const merged = sync.mergeProgress('learning', { reviewSession: a, decks: { legacy: p.createRecallDeck('legacy', 'Legacy', words.slice(0, 5), 10) } }, { reviewSession: b });
  assert.equal(Object.keys(merged.reviewSession.run.answers).length, 2);
  assert.equal(merged.reviewSession.run.answers[round.run.order[1]].action, 'read');
  assert.equal(merged.decks.legacy.words.length, 5);
  const newRound = review.startSharedReviewSession('review-two', 'review-run-two', words, state, 12, 500);
  const late = p.recordDeckAnswer(a, round.run.id, { ...answer(round.run.order[2], 1000), assisted: true, action: 'flashcard', rating: 1 });
  assert.equal(p.mergeReviewSessions(late, newRound).id, newRound.id);
  assert.deepEqual(p.mergeReviewSessions(late, newRound), p.mergeReviewSessions(newRound, late));
  assert.equal(learning.readLearningProgress({ reviewSession: deck() }).reviewSession, undefined);
});

test('review lookup resolves only requested canonical words across levels and rejects malformed batches', async () => {
  const api = await vite.ssrLoadModule('/app/api/learning/words/route.ts');
  const { ALL_VOCABULARY } = await vite.ssrLoadModule('/app/vocabulary/data.ts');
  const chosen = ['A1', 'A2', 'B1', 'B2', 'C1'].map(level => ALL_VOCABULARY.find(w => w.level === level));
  const keys = [...new Set(chosen.map(vocabulary.vocabularyCardKey))];
  const post = data => api.POST(new Request('http://local/api/learning/words', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) }));
  const response = await post({ keys }); assert.equal(response.status, 200);
  const found = (await response.json()).words;
  assert.deepEqual(new Set(found.map(vocabulary.vocabularyCardKey)), new Set(keys));
  assert.deepEqual((await (await post({ keys: [] })).json()).words, []);
  assert.deepEqual((await (await post({ keys: ['de:unknown-example-word'] })).json()).words, []);
  assert.equal((await post({ keys: Array(501).fill(keys[0]) })).status, 400);
  assert.equal((await post({ keys: [null] })).status, 400);
  assert.equal((await post({})).status, 400);
});
