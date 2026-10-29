import type { LearningProgress } from './learning-state';
import type { VocabularyProgress } from './progress-sync';
import type { StoryProgress } from './story-progress';

export const DAILY_WORD_GOAL = 5;
const DAY = 86_400_000;
export type DailyLearningSettings = { timeZone: string; startedAt: number };
export type FirstWordLearning = { key: string; at: number };
export function validActivityTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000;
}
export function firstCompletion(...values: unknown[]) {
  const times = values.filter(validActivityTime);
  return times.length ? Math.min(...times) : undefined;
}
export function readFirstWordLearning(value: unknown): FirstWordLearning | undefined {
  if (!value || typeof value !== 'object') return;
  const v = value as FirstWordLearning;
  if (typeof v.key === 'string' && v.key.startsWith('de:') && v.key.length > 3 && v.key.length <= 200 && validActivityTime(v.at)) return { key: v.key, at: v.at };
}
export function firstWordLearning(...values: unknown[]): FirstWordLearning | undefined {
  return values.map(readFirstWordLearning).filter(v => v !== undefined).sort((a, b) => a.at - b.at || (a.key === b.key ? 0 : a.key < b.key ? -1 : 1))[0];
}
export function readDailyLearningSettings(value: unknown): DailyLearningSettings | undefined {
  if (!value || typeof value !== 'object') return;
  const v = value as DailyLearningSettings;
  if (typeof v.timeZone !== 'string' || v.timeZone.length > 100 || !validActivityTime(v.startedAt)) return;
  try { new Intl.DateTimeFormat('en', { timeZone: v.timeZone }); return { timeZone: v.timeZone, startedAt: v.startedAt }; } catch { return; }
}
export function mergeDailyLearningSettings(a: unknown, b: unknown) {
  return [readDailyLearningSettings(a), readDailyLearningSettings(b)].filter(v => v !== undefined).sort((x, y) => x.startedAt - y.startedAt || (x.timeZone === y.timeZone ? 0 : x.timeZone < y.timeZone ? -1 : 1))[0];
}
function calendarDay(at: number, formatter: Intl.DateTimeFormat) {
  const parts = formatter.formatToParts(at);
  const part = (name: string) => Number(parts.find(p => p.type === name)?.value);
  return Date.UTC(part('year'), part('month') - 1, part('day')) / DAY;
}
export function dailyLearningSummary(stories: StoryProgress, vocabulary: VocabularyProgress, settings: LearningProgress['daily'], now = Date.now()) {
  const timeZone = readDailyLearningSettings(settings)?.timeZone ?? 'UTC';
  const formatter = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const today = calendarDay(now, formatter);
  const days = new Map<number, { stories: Set<string>; words: Set<string> }>();
  function add(at: number | undefined, kind: 'stories' | 'words', key: string) {
    // Zero means a pre-existing/imported achievement, not a new learning event.
    if (!validActivityTime(at) || at === 0 || at > now) return;
    const day = calendarDay(at, formatter), value = days.get(day) ?? { stories: new Set<string>(), words: new Set<string>() };
    value[kind].add(key); days.set(day, value);
  }
  for (const [id, entry] of Object.entries(stories.entries)) add(entry.firstCompletedAt, 'stories', id);
  const firstWords = new Map<string, number>();
  for (const card of Object.values(vocabulary.cards ?? {})) {
    const first = readFirstWordLearning(card.firstLearned);
    if (first) firstWords.set(first.key, Math.min(firstWords.get(first.key) ?? Infinity, first.at));
  }
  for (const [key, at] of firstWords) add(at, 'words', key);
  const complete = (day: number) => (days.get(day)?.stories.size ?? 0) >= 1 || (days.get(day)?.words.size ?? 0) >= DAILY_WORD_GOAL;
  const completedDays = [...days.keys()].filter(complete).sort((a, b) => a - b);
  let best = 0, run = 0, previous = -Infinity;
  for (const day of completedDays) { run = day === previous + 1 ? run + 1 : 1; best = Math.max(best, run); previous = day; }
  let streak = 0, end = complete(today) ? today : today - 1;
  while (complete(end--)) streak++;
  return {
    timeZone, todayComplete: complete(today), streak, best,
    stories: days.get(today)?.stories.size ?? 0, words: days.get(today)?.words.size ?? 0,
    week: Array.from({ length: 7 }, (_, i) => {
      const day = today - 6 + i, date = new Date(day * DAY);
      return { date: date.toISOString().slice(0, 10), label: new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(date), complete: complete(day), today: day === today };
    }),
  };
}
