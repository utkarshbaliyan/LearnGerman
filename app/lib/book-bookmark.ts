export const BOOK_BOOKMARK_STORAGE_KEY = 'leselaut:book-bookmark:v1';
export const BOOK_PAGE_COUNT = 200;
export const A1_BOOK_ID = 'der-schluessel-im-blauen-korb';

export type BookBookmark = { page: number; updatedAt: number };

export function readBookBookmark(storage: Pick<Storage, 'getItem'>, bookId = A1_BOOK_ID): BookBookmark | null {
  try {
    const value = JSON.parse(storage.getItem(BOOK_BOOKMARK_STORAGE_KEY) ?? 'null');
    return validBookBookmark(bookId === A1_BOOK_ID ? value : value?.volumes?.[bookId]);
  }
  catch { return null; }
}

export function validBookBookmark(value: unknown): BookBookmark | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return Number.isInteger(record.page) && Number(record.page) >= 1 && Number(record.page) <= BOOK_PAGE_COUNT
    && typeof record.updatedAt === 'number' && Number.isFinite(record.updatedAt) && record.updatedAt > 0
    ? { page: Number(record.page), updatedAt: record.updatedAt } : null;
}

function latestBookmark(local: unknown, remote: unknown): BookBookmark | Record<string, never> {
  const a = validBookBookmark(local);
  const b = validBookBookmark(remote);
  if (!a) return b ?? {};
  if (!b) return a;
  return a.updatedAt > b.updatedAt || (a.updatedAt === b.updatedAt && a.page >= b.page) ? a : b;
}

function volumes(value: unknown): Record<string, BookBookmark> {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>).volumes : null;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).flatMap(([id, item]) => {
    const bookmark = validBookBookmark(item);
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id !== A1_BOOK_ID && bookmark ? [[id, bookmark]] : [];
  }));
}

export function mergeBookBookmark(local: unknown, remote: unknown) {
  const a = volumes(local), b = volumes(remote);
  const merged = Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])]
    .map(id => [id, latestBookmark(a[id], b[id])]));
  const legacy = latestBookmark(local, remote);
  return Object.keys(merged).length ? { ...legacy, volumes: merged } : legacy;
}

export function updateBookBookmark(current: unknown, bookId: string, page: number, now = Date.now()) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bookId)) throw new Error('Invalid book');
  const previous = validBookBookmark(bookId === A1_BOOK_ID ? current : volumes(current)[bookId]);
  const next = validBookBookmark({ page, updatedAt: Math.max(now, (previous?.updatedAt ?? 0) + 1) });
  if (!next) throw new Error('Invalid page');
  const existing = mergeBookBookmark(current, null);
  return bookId === A1_BOOK_ID ? { ...existing, ...next }
    : { ...existing, volumes: { ...volumes(existing), [bookId]: next } };
}
