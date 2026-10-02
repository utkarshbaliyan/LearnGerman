import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('book bookmarks keep the latest valid page across devices', async () => {
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false } });
  try {
    const { BOOK_BOOKMARK_STORAGE_KEY, readBookBookmark, mergeBookBookmark } = await vite.ssrLoadModule('/app/lib/book-bookmark.ts');
    const older = { page: 8, updatedAt: 100 };
    const newer = { page: 4, updatedAt: 200 };
    assert.deepEqual(mergeBookBookmark(newer, older), newer, 'a later bookmark may intentionally move back');
    assert.deepEqual(mergeBookBookmark(older, newer), newer);
    assert.deepEqual(mergeBookBookmark({ page: 201, updatedAt: 300 }, older), older);
    assert.deepEqual(mergeBookBookmark({ page: 0, updatedAt: 300 }, null), {});
    assert.deepEqual(readBookBookmark({ getItem: key => key === BOOK_BOOKMARK_STORAGE_KEY ? JSON.stringify(newer) : null }), newer);
    assert.equal(readBookBookmark({ getItem: () => '{broken' }), null);
  } finally { await vite.close(); }
});

test('A2 bookmarks sync independently while legacy A1 pages and future book records remain intact', async () => {
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false } });
  try {
    const { A1_BOOK_ID, readBookBookmark, updateBookBookmark, mergeBookBookmark } = await vite.ssrLoadModule('/app/lib/book-bookmark.ts');
    const id = 'nicht-nur-ein-profil', legacy = { page: 150, updatedAt: 100 };
    const local = updateBookBookmark(legacy, id, 20, 200);
    assert.deepEqual(readBookBookmark({ getItem: () => JSON.stringify(local) }), legacy);
    assert.deepEqual(readBookBookmark({ getItem: () => JSON.stringify(local) }, id), { page: 20, updatedAt: 200 });
    const remote = { page: 140, updatedAt: 300, volumes: { [id]: { page: 12, updatedAt: 400 }, 'a-future-book': { page: 5, updatedAt: 350 } } };
    const merged = mergeBookBookmark(local, remote);
    assert.equal(merged.page, 140); assert.equal(merged.volumes[id].page, 12);
    assert.deepEqual(merged.volumes['a-future-book'], remote.volumes['a-future-book']);
    const updated = updateBookBookmark(merged, A1_BOOK_ID, 180, 500);
    assert.equal(updated.page, 180); assert.equal(updated.volumes[id].page, 12);
    assert.deepEqual(mergeBookBookmark(updated, remote), updated);
    assert.equal(readBookBookmark({ getItem: () => JSON.stringify(legacy) }, id), null, 'A1 page must never become the new book bookmark');
  } finally { await vite.close(); }
});
