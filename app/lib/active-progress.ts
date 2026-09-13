import { activeLessons, activeReviews, getActiveLesson } from './active-learning';
export type ActiveMode = 'speaking' | 'writing';
export type TaskProgress = { attempts: number; checked: boolean; successful: boolean; updatedAt?: string; firstCheckedAt?: string };
export type ActiveProgress = Record<string, Partial<Record<ActiveMode, TaskProgress>>>;
export type ProgressRow = { taskId: string; attempts: number; successful: number; updatedAt: string; firstCheckedAt: string };
export function deriveActiveProgress(rows: ProgressRow[]): ActiveProgress {
 const result: ActiveProgress = {};
 for (const row of rows) {
  const speaking = row.taskId.startsWith('speaking-drill:');
  const id = speaking ? row.taskId.slice('speaking-drill:'.length) : row.taskId;
  if (!getActiveLesson(id)) continue;
  (result[id] ??= {})[speaking ? 'speaking' : 'writing'] = { attempts: row.attempts, checked: row.attempts > 0, successful: row.successful > 0, updatedAt: row.updatedAt, firstCheckedAt: row.firstCheckedAt };
 }
 return result;
}
export function reviewDueAt(id: string, progress: ActiveProgress): number | null {
 const review = activeReviews.find(row => row.id === id); if (!review) return null;
 const dates = activeLessons.filter(row => row.level === review.level && row.module === review.module).flatMap(row => ['speaking','writing'].map(mode => progress[row.id]?.[mode as ActiveMode]));
 if (dates.some(item => !item?.checked || !item.firstCheckedAt || !Number.isFinite(Date.parse(item.firstCheckedAt)))) return null;
 return Math.max(...dates.map(item => Date.parse(item!.firstCheckedAt!))) + 7 * 86400000;
}
