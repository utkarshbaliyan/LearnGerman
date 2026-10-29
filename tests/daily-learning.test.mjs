import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null } });
after(() => vite.close());
const d = await vite.ssrLoadModule('/app/lib/daily-learning.ts');
const s = await vite.ssrLoadModule('/app/lib/story-progress.ts');
const v = await vite.ssrLoadModule('/app/lib/progress-sync.ts');
const learning = await vite.ssrLoadModule('/app/lib/learning-state.ts');
const sync = await vite.ssrLoadModule('/app/lib/cloud-progress.ts');
const emptyStories = () => ({ entries: {} });
const at = date => Date.parse(date);
const settings = { timeZone: 'UTC', startedAt: at('2026-10-29T00:00:00Z') };
const summary = (stories = emptyStories(), words = v.emptyVocabularyProgress(), now = at('2026-10-29T12:00:00Z'), daily = settings) => d.dailyLearningSummary(stories, words, daily, now);
const word = german => ({ german, english: german, progressByHeadword: true });
const fiveWords = (now, count = 5) => ['Haus', 'Baum', 'Brot', 'Zeit', 'Buch'].slice(0, count).reduce((p, german) => v.setVocabularyStatus(p, word(german), 'learned', now), v.emptyVocabularyProgress());

test('one first story completion earns a day; rereading and toggling cannot move it to tomorrow', () => {
  const now = at('2026-10-29T11:00:00Z');
  let stories = s.markStory(emptyStories(), 'new-story', false, now);
  assert.equal(summary(stories).todayComplete, false);
  stories = s.markStory(stories, 'new-story', true, now + 1);
  assert.equal(summary(stories).streak, 1);
  stories = s.markStory(stories, 'new-story', false, now + 2);
  stories = s.markStory(stories, 'new-story', true, now + 86_400_000);
  const tomorrow = summary(stories, undefined, now + 86_400_001);
  assert.equal(tomorrow.stories, 0); assert.equal(tomorrow.todayComplete, false); assert.equal(tomorrow.streak, 1);
  assert.equal(stories.entries['new-story'].firstCompletedAt, now + 1);
});

test('five distinct newly familiar words earn a day; four words, duplicate aliases and imports do not', () => {
  const now = at('2026-10-29T11:00:00Z');
  assert.equal(summary(undefined, fiveWords(now, 4)).todayComplete, false);
  let words = fiveWords(now);
  assert.equal(summary(undefined, words).todayComplete, true);
  words = v.setVocabularyStatus(words, word('Haus'), 'unlearned', now + 1);
  words = v.setVocabularyStatus(words, word('Haus'), 'learned', now + 86_400_000);
  assert.equal(summary(undefined, words, now + 86_400_001).words, 0);
  const card = fiveWords(now, 1).cards['de:haus'];
  assert.equal(summary(undefined, { ...v.emptyVocabularyProgress(), cards: { 'de:haus': card, 'de:haeuser': card } }).words, 1);
  const duplicated = { ...fiveWords(now), cards: { ...fiveWords(now).cards } };
  for (const [key, entry] of Object.entries(duplicated.cards)) duplicated.cards[`${key} alias`] = { ...entry, firstLearned: { ...entry.firstLearned, at: now + 86_400_000 } };
  assert.equal(summary(undefined, duplicated, now + 86_400_001).words, 0, 'aliases with later timestamps cannot count a word again tomorrow');
  const imported = ['Haus', 'Baum', 'Brot', 'Zeit', 'Buch'].reduce((p, german) => v.setVocabularyStatus(p, word(german), 'learned', now, false), v.emptyVocabularyProgress());
  assert.equal(summary(undefined, imported).words, 0);
});

test('existing learned marks and story completions remain intact without inventing past activity', () => {
  const now = at('2026-10-29T11:00:00Z');
  const old = s.readStoryProgress(['old-story']);
  const reread = s.markStory(old, 'old-story', true, now);
  assert.equal(reread.entries['old-story'].completed, true); assert.equal(summary(reread).streak, 0);
  let words = { learnedKeys: ['de:haus'], reviewKeys: [], legacyMigrated: true };
  words = v.setVocabularyStatus(words, word('Haus'), 'unlearned', now);
  words = v.markVocabularyRead(words, word('Haus'), now + 1);
  assert.equal(v.isVocabularyLearned(words, word('Haus')), true); assert.equal(summary(undefined, words).words, 0);
  assert.equal(summary(old).streak, 0);
});

test('correct guesses count once; saving or scheduling a review does not earn new-word credit', () => {
  const now = at('2026-10-29T11:00:00Z'), w = word('Haus');
  let words = v.setVocabularyStatus(v.emptyVocabularyProgress(), w, 'review', now);
  words = v.recordVocabularyGuess(words, w, false, now + 1);
  assert.equal(summary(undefined, words).words, 0);
  words = v.recordVocabularyGuess(words, w, true, now + 2);
  assert.equal(summary(undefined, words).words, 1);
  words = v.scheduleVocabularyReview(words, w, 60, now + 3);
  assert.equal(summary(undefined, words).words, 1);
});

test('different goals sustain consecutive days, allow today to remain pending, and reset after a missed day', () => {
  let stories = emptyStories();
  for (const [i, date] of ['2026-10-26', '2026-10-28'].entries()) stories = s.markStory(stories, `story-${i}`, true, at(`${date}T12:00:00Z`));
  const words = fiveWords(at('2026-10-27T12:00:00Z'));
  assert.equal(summary(stories, words).streak, 3); assert.equal(summary(stories, words).best, 3);
  const missed = summary(stories, words, at('2026-10-30T00:00:00Z'));
  assert.equal(missed.streak, 0); assert.equal(missed.best, 3);
  stories = s.markStory(stories, 'new-run', true, at('2026-10-30T01:00:00Z'));
  assert.equal(summary(stories, words, at('2026-10-30T02:00:00Z')).streak, 1);
});

test('days reset at midnight in the saved timezone, including both DST transitions', () => {
  let stories = s.markStory(emptyStories(), 'before', true, at('2026-10-28T18:29:59Z'));
  stories = s.markStory(stories, 'after', true, at('2026-10-28T18:30:01Z'));
  const india = summary(stories, undefined, at('2026-10-28T18:31:00Z'), { ...settings, timeZone: 'Asia/Kolkata' });
  assert.equal(india.streak, 2); assert.equal(india.stories, 1); assert.equal(india.week.at(-1).date, '2026-10-29');
  for (const dates of [['2026-03-28T22:30:00Z', '2026-03-29T21:30:00Z', '2026-03-30T21:30:00Z'], ['2026-10-24T21:30:00Z', '2026-10-25T22:30:00Z', '2026-10-26T22:30:00Z']]) {
    const state = dates.reduce((p, date, i) => s.markStory(p, `story-${i}`, true, at(date)), emptyStories());
    const result = summary(state, undefined, at(dates.at(-1)) + 1, { ...settings, timeZone: 'Europe/Berlin' });
    assert.equal(result.streak, 3); assert.equal(result.week.filter(day => day.complete).length, 3);
  }
});

test('cloud merges keep first achievements even when a newer device changes status or omits the new fields', () => {
  const now = at('2026-10-29T11:00:00Z');
  const story = s.markStory(emptyStories(), 'story', true, now);
  const later = { entries: { story: { completed: false, updatedAt: now + 100 } } };
  const a = sync.mergeProgress('stories', story, later), b = sync.mergeProgress('stories', later, story);
  assert.deepEqual(a, b); assert.equal(a.entries.story.completed, false); assert.equal(summary(a).streak, 1);
  const words = fiveWords(now, 1), oldClient = { cards: { 'de:haus': { status: 'review', updatedAt: now + 100, dueAt: now + 200, intervalMinutes: 1 } } };
  const x = sync.mergeProgress('vocabulary', words, oldClient), y = sync.mergeProgress('vocabulary', oldClient, words);
  assert.deepEqual(x.cards, y.cards); assert.equal(x.cards['de:haus'].status, 'review'); assert.equal(summary(undefined, x).words, 1);
  const olderFirst = v.setVocabularyStatus(v.emptyVocabularyProgress(), word('Haus'), 'learned', now - 50);
  assert.equal(v.mergeVocabularyProgress(words, olderFirst).cards['de:haus'].firstLearned.at, now - 50);
  const laterSettings = { timeZone: 'Europe/Berlin', startedAt: settings.startedAt + 100 };
  assert.deepEqual(sync.mergeProgress('learning', { daily: settings }, { daily: laterSettings }).daily, settings);
  assert.deepEqual(sync.mergeProgress('learning', { daily: laterSettings }, { daily: settings }).daily, settings);
});

test('normalization, personal-word migration and catalog aliases retain achievements without duplicating them', async () => {
  const now = at('2026-10-29T11:00:00Z'), original = fiveWords(now, 1), key = 'de:haus';
  const w = { ...word('Haus'), progressAliases: [word('Haeuser')] };
  const stored = { ...original, cards: { [key]: original.cards[key], 'de:haeuser': { status: 'review', updatedAt: now + 100, dueAt: now, intervalMinutes: 0 } } };
  const storage = { getItem: name => name === v.VOCABULARY_PROGRESS_STORAGE_KEY ? JSON.stringify(stored) : null };
  const normalized = v.readVocabularyProgress(storage, [w]);
  assert.equal(normalized.cards[key].status, 'review'); assert.equal(summary(undefined, normalized).words, 1);
  const migration = await vite.ssrLoadModule('/app/lib/saved-vocabulary.ts');
  const personal = { words: { 'word:haus': { german: 'Haus', english: 'house', context: '', storyId: 'reading-a1-01-v1', createdAt: 1, updatedAt: now + 200, dueAt: now + 300 } } };
  assert.equal(summary(undefined, migration.migrateReadingVocabulary(original, personal)).words, 1);
  const invalid = v.readReviewCards({ [key]: { ...original.cards[key], firstLearned: { at: 'today', key } } });
  assert.equal(invalid[key].status, 'learned'); assert.equal(invalid[key].firstLearned, undefined);
  assert.equal(learning.readLearningProgress({ daily: { timeZone: 'invalid/zone', startedAt: now } }).daily, undefined);
  assert.equal(summary(undefined, { ...original, cards: { [key]: { ...original.cards[key], firstLearned: { key, at: now + 86_400_000 } } } }).words, 0);
});

test('daily goals provide separate accessible progress bars, a seven-day history and a clear either-task rule', async () => {
  const { DailyLearning } = await vite.ssrLoadModule('/app/components/daily-learning.tsx');
  const markup = renderToStaticMarkup(React.createElement(DailyLearning, { summary: summary(), level: 'A1', signedIn: false }));
  assert.match(markup, /Complete either task/); assert.match(markup, /href="\/vocabulary\?level=A1"/);
  assert.equal((markup.match(/<progress /g) ?? []).length, 2); assert.equal((markup.match(/goal not complete/g) ?? []).length, 7);
  assert.match(markup, /Your next completed goal starts your streak/);
});

test('account cleanup removes every source of a streak before another account is loaded', async () => {
  const { clearAccountStorage } = await vite.ssrLoadModule('/app/lib/account-storage.ts');
  const { PROGRESS_STORAGE_KEYS, CLOUD_PROGRESS_OWNER_STORAGE_KEY } = await vite.ssrLoadModule('/app/lib/cloud-progress-keys.ts');
  const values = new Map(Object.entries({
    [PROGRESS_STORAGE_KEYS.learning]: JSON.stringify({ daily: settings }),
    [PROGRESS_STORAGE_KEYS.stories]: JSON.stringify(s.markStory(emptyStories(), 'story', true, at('2026-10-29T11:00:00Z'))),
    [PROGRESS_STORAGE_KEYS.vocabulary]: JSON.stringify(fiveWords(at('2026-10-29T11:00:00Z'))),
    [CLOUD_PROGRESS_OWNER_STORAGE_KEY]: 'account-a',
  }));
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), key: index => [...values.keys()][index] ?? null, get length() { return values.size; } };
  clearAccountStorage(storage, 'account-a');
  for (const key of [PROGRESS_STORAGE_KEYS.learning, PROGRESS_STORAGE_KEYS.stories, PROGRESS_STORAGE_KEYS.vocabulary, CLOUD_PROGRESS_OWNER_STORAGE_KEY]) assert.equal(storage.getItem(key), null);
  assert.equal(summary(s.readStoryProgress(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEYS.stories))), v.readVocabularyProgress(storage)).streak, 0);
});
