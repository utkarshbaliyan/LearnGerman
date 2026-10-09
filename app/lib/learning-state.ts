import { z } from 'zod';
import { TRANSLATION_LEVELS, sentenceKey } from './translation-practice';
import type { ReadingSummary } from './reading-path';
import { readReviewCards, type VocabularyReviewCard } from './progress-sync';

export const LEARNING_STORAGE_KEY = 'leselaut:learning:v1';
export const DAY = 86_400_000;
const time = z.number().int().min(0).max(8_640_000_000_000_000);
const id = z.string().min(1).max(200).regex(/^[\p{L}\p{N}_: -]+$/u).refine(v => !['__proto__', 'constructor', 'prototype'].includes(v));
export const preferencesSchema = z.object({ level: z.enum(TRANSLATION_LEVELS), goal: z.enum(['everyday', 'work', 'study']), minutes: z.union([z.literal(10), z.literal(15), z.literal(20)]), updatedAt: time });
export type LearningPreferences = z.infer<typeof preferencesSchema>;
const wordSchema = z.object({ german: z.string().min(1).max(100), english: z.string().min(1).max(600), context: z.string().max(1500), storyId: id, createdAt: time, updatedAt: time, dueAt: time, card: z.unknown().optional() });
export type SavedWord = Omit<z.infer<typeof wordSchema>, 'card'> & { card?: VocabularyReviewCard };
const recallSchema = z.object({ id, key: id, at: time, correct: z.boolean(), assisted: z.boolean(), elapsedDays: z.number().min(0).max(100000) });
export type RecallAttempt = z.infer<typeof recallSchema>;
const sessionSchema = z.object({ id, startedAt: time, updatedAt: time, day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), level: z.enum(TRANSLATION_LEVELS), goal: z.enum(['everyday', 'work', 'study']), minutes: z.union([z.literal(10), z.literal(15), z.literal(20)]), storyId: id, step: z.number().int().min(0).max(4), reviewKeys: z.array(id).max(8), reviewIndex: z.number().int().min(0).max(8), translationId: id.optional(), finishedAt: time.optional(), comprehensionScore: z.number().min(0).max(100).optional(), outputSkipped: z.boolean().optional() });
export type LearningSession = z.infer<typeof sessionSchema>;
export type LearningProgress = { preferences?: LearningPreferences; words: Record<string, SavedWord>; recalls: Record<string, RecallAttempt>; sessions: Record<string, LearningSession> };
export function emptyLearningProgress(): LearningProgress { return { words: {}, recalls: {}, sessions: {} }; }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records<T>(value: unknown, schema: z.ZodType<T>, limit: number): Record<string, T> {
  return Object.fromEntries(Object.entries(object(value)).filter(([key]) => id.safeParse(key).success).flatMap(([key, row]) => { const p = schema.safeParse(row); return p.success ? [[key, p.data] as const] : []; }).slice(-limit));
}
export function readLearningProgress(value: unknown): LearningProgress {
  const v = object(value), prefs = preferencesSchema.safeParse(v.preferences);
  const words = records(v.words, wordSchema, 500);
  for (const word of Object.values(words)) {
    const cards = readReviewCards({ 'de:personal': word.card });
    if (cards['de:personal']) word.card = cards['de:personal']; else delete word.card;
  }
  return { ...(prefs.success ? { preferences: prefs.data } : {}), words: words as Record<string, SavedWord>, recalls: records(v.recalls, recallSchema, 1000), sessions: records(v.sessions, sessionSchema, 180) };
}
function latest<T>(a: T, b: T, getTime: (x: T) => number) { return getTime(a) > getTime(b) || (getTime(a) === getTime(b) && JSON.stringify(a) > JSON.stringify(b)) ? a : b; }
function mergeRecords<T>(a: Record<string, T>, b: Record<string, T>, getTime: (x: T) => number, limit: number) {
  const result = { ...a };
  for (const [key, row] of Object.entries(b)) result[key] = result[key] ? latest(result[key], row, getTime) : row;
  return Object.fromEntries(Object.entries(result).sort((a, b) => getTime(a[1]) - getTime(b[1]) || a[0].localeCompare(b[0])).slice(-limit));
}
export function mergeLearningProgress(a: unknown, b: unknown): LearningProgress {
  const x = readLearningProgress(a), y = readLearningProgress(b);
  const preferences = x.preferences && y.preferences ? latest(x.preferences, y.preferences, p => p.updatedAt) : x.preferences ?? y.preferences;
  return { ...(preferences ? { preferences } : {}), words: mergeRecords(x.words, y.words, w => w.updatedAt, 500), recalls: mergeRecords(x.recalls, y.recalls, r => r.at, 1000), sessions: mergeRecords(x.sessions, y.sessions, s => s.updatedAt, 180) };
}
export const personalWordKey = (german: string) => `word:${sentenceKey(german)}`;
export function saveStoryWord(progress: LearningProgress, word: Omit<SavedWord, 'createdAt' | 'updatedAt' | 'dueAt' | 'card'>, now = Date.now()) {
  const key = personalWordKey(word.german);
  if (progress.words[key]) return progress;
  return readLearningProgress({ ...progress, words: { ...progress.words, [key]: { ...word, createdAt: now, updatedAt: now, dueAt: now + DAY } } });
}
export function recallMatches(answer: string, expected: string) { return sentenceKey(answer) === sentenceKey(expected); }
export function delayedRecallSummary(progress: LearningProgress) {
  const attempts = Object.values(progress.recalls).filter(r => !r.assisted && r.elapsedDays >= 7);
  return { correct: attempts.filter(r => r.correct).length, total: attempts.length, words: new Set(attempts.filter(r => r.correct).map(r => r.key)).size };
}
export function localDay(now = new Date()) { return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }
export function recommendStory(stories: ReadingSummary[], prefs: LearningPreferences, completed: Set<string>, sessions: LearningSession[]) {
  const level = prefs.level === 'C1' ? 'B2' : prefs.level;
  const goal = prefs.goal === 'work' ? /work|office|job/ : prefs.goal === 'study' ? /school|learning|college|study/ : /./;
  const recent = new Set(sessions.map(s => s.storyId));
  return stories.filter(s => s.level === level).sort((a, b) => Number(completed.has(a.id)) - Number(completed.has(b.id)) || Number(recent.has(a.id)) - Number(recent.has(b.id)) || Number(!goal.test(a.topics.join(' '))) - Number(!goal.test(b.topics.join(' '))) || a.number - b.number)[0];
}
