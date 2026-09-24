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
