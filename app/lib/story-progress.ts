import { firstCompletion, validActivityTime } from './daily-learning';
export type StoryProgress = { entries: Record<string, { completed: boolean; updatedAt: number; firstCompletedAt?: number }> };

export function readStoryProgress(raw: unknown): StoryProgress {
  if (Array.isArray(raw)) return { entries: Object.fromEntries(raw.filter((id) => typeof id === "string").map((id) => [id, { completed: true, updatedAt: 0 }])) };
  const entries = (raw as Partial<StoryProgress> | null)?.entries;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) return { entries: {} };
  return { entries: Object.fromEntries(Object.entries(entries).filter(([, item]) => item && typeof item.completed === "boolean" && Number.isSafeInteger(item.updatedAt) && item.updatedAt >= 0).map(([id, item]) => [id, { completed: item.completed, updatedAt: item.updatedAt, ...(validActivityTime(item.firstCompletedAt) ? { firstCompletedAt: item.firstCompletedAt } : {}) }])) };
}

export function mergeStoryProgress(local: unknown, remote: unknown): StoryProgress {
  const entries = { ...readStoryProgress(remote).entries };
  for (const [id, item] of Object.entries(readStoryProgress(local).entries)) {
    const old = entries[id];
    const winner = !old || item.updatedAt > old.updatedAt || (item.updatedAt === old.updatedAt && !item.completed) ? item : old;
    const firstCompletedAt = firstCompletion(item.firstCompletedAt, old?.firstCompletedAt);
    entries[id] = { ...winner, ...(firstCompletedAt !== undefined ? { firstCompletedAt } : {}) };
  }
  return { entries };
}

export function markStory(progress: StoryProgress, id: string, completed: boolean, now = Date.now()): StoryProgress {
  const previous = progress.entries[id];
  const firstCompletedAt = firstCompletion(previous?.firstCompletedAt) ?? (previous?.completed ? 0 : completed ? now : undefined);
  return { entries: { ...progress.entries, [id]: { completed, updatedAt: Math.max(now, (previous?.updatedAt ?? 0) + 1), ...(firstCompletedAt !== undefined ? { firstCompletedAt } : {}) } } };
}
