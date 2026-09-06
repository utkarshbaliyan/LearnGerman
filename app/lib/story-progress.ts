export type StoryProgress = { entries: Record<string, { completed: boolean; updatedAt: number }> };

export function readStoryProgress(raw: unknown): StoryProgress {
  if (Array.isArray(raw)) return { entries: Object.fromEntries(raw.filter((id) => typeof id === "string").map((id) => [id, { completed: true, updatedAt: 0 }])) };
  const entries = (raw as Partial<StoryProgress> | null)?.entries;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) return { entries: {} };
  return { entries: Object.fromEntries(Object.entries(entries).filter(([, item]) => item && typeof item.completed === "boolean" && Number.isSafeInteger(item.updatedAt) && item.updatedAt >= 0)) };
}

export function mergeStoryProgress(local: unknown, remote: unknown): StoryProgress {
  const entries = { ...readStoryProgress(remote).entries };
  for (const [id, item] of Object.entries(readStoryProgress(local).entries)) {
    if (!entries[id] || item.updatedAt > entries[id].updatedAt || (item.updatedAt === entries[id].updatedAt && !item.completed)) entries[id] = item;
  }
  return { entries };
}

export function markStory(progress: StoryProgress, id: string, completed: boolean, now = Date.now()): StoryProgress {
  return { entries: { ...progress.entries, [id]: { completed, updatedAt: Math.max(now, (progress.entries[id]?.updatedAt ?? 0) + 1) } } };
}
