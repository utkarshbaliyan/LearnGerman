import { firstCompletion, validActivityTime } from './daily-learning';
export type StoryProgress = { entries: Record<string, { completed: boolean; updatedAt: number; firstCompletedAt?: number }> };

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const safeKey = (key: string) => !UNSAFE_KEYS.has(key);

export function readStoryProgress(raw: unknown): StoryProgress {
  if (Array.isArray(raw)) return { entries: Object.fromEntries(raw.filter((id): id is string => typeof id === "string" && safeKey(id)).map((id) => [id, { completed: true, updatedAt: 0 }])) };
  const entries = (raw as Partial<StoryProgress> | null)?.entries;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) return { entries: {} };
  return { entries: Object.fromEntries(Object.entries(entries).filter(([id, item]) => safeKey(id) && item && typeof item.completed === "boolean" && Number.isSafeInteger(item.updatedAt) && item.updatedAt >= 0).map(([id, item]) => [id, { completed: item.completed, updatedAt: item.updatedAt, ...(validActivityTime(item.firstCompletedAt) ? { firstCompletedAt: item.firstCompletedAt } : {}) }])) };
}

export function mergeStoryProgress(local: unknown, remote: unknown): StoryProgress {
  const entries = { ...readStoryProgress(remote).entries };
  for (const [id, item] of Object.entries(readStoryProgress(local).entries)) {
    if (!safeKey(id)) continue;
    const old = Object.hasOwn(entries, id) ? entries[id] : undefined;
    const winner = !old || item.updatedAt > old.updatedAt || (item.updatedAt === old.updatedAt && !item.completed) ? item : old;
    const firstCompletedAt = firstCompletion(item.firstCompletedAt, old?.firstCompletedAt);
    entries[id] = { ...winner, ...(firstCompletedAt !== undefined ? { firstCompletedAt } : {}) };
  }
  return { entries };
}

export function markStory(progress: StoryProgress, id: string, completed: boolean, now = Date.now()): StoryProgress {
  if (!safeKey(id)) return progress;
  const previous = Object.hasOwn(progress.entries, id) ? progress.entries[id] : undefined;
  const firstCompletedAt = firstCompletion(previous?.firstCompletedAt) ?? (previous?.completed ? 0 : completed ? now : undefined);
  return { entries: { ...progress.entries, [id]: { completed, updatedAt: Math.max(now, (previous?.updatedAt ?? 0) + 1), ...(firstCompletedAt !== undefined ? { firstCompletedAt } : {}) } } };
}
