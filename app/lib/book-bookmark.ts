export const BOOK_BOOKMARK_STORAGE_KEY = 'leselaut:book-bookmark:v1';
export const BOOK_PAGE_COUNT = 200;

export type BookBookmark = { page: number; updatedAt: number };

export function readBookBookmark(storage: Pick<Storage, 'getItem'>): BookBookmark | null {
  try { return validBookBookmark(JSON.parse(storage.getItem(BOOK_BOOKMARK_STORAGE_KEY) ?? 'null')); }
  catch { return null; }
}

export function validBookBookmark(value: unknown): BookBookmark | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return Number.isInteger(record.page) && Number(record.page) >= 1 && Number(record.page) <= BOOK_PAGE_COUNT
    && typeof record.updatedAt === 'number' && Number.isFinite(record.updatedAt) && record.updatedAt > 0
    ? { page: Number(record.page), updatedAt: record.updatedAt } : null;
}

export function mergeBookBookmark(local: unknown, remote: unknown): BookBookmark | Record<string, never> {
  const a = validBookBookmark(local);
  const b = validBookBookmark(remote);
  if (!a) return b ?? {};
  if (!b) return a;
  return a.updatedAt > b.updatedAt || (a.updatedAt === b.updatedAt && a.page >= b.page) ? a : b;
}
