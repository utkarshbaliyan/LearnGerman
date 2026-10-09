import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assignStoryArtCovers } from '../app/lib/story-art-covers.mjs';

const read = name => JSON.parse(readFileSync(new URL(`../content/illustrations/${name}.json`, import.meta.url)));

test('all 654 stories have existing verified artwork, original covers stay intact and no image appears more than three times', () => {
  const briefs = read('story-art-briefs'), registry = read('story-art-registry');
  const covers = read('story-art-manifest'), reuse = read('story-art-reuse');
  const originals = Object.fromEntries(Object.entries(registry).map(([key, entry]) => [entry.storyId, { url: `/media/${key}` }]));
  const verified = read('story-art-verification');
  assert.equal(briefs.length, 654);
  assert.equal(Object.keys(originals).length, 307);
  assert.equal(Object.keys(reuse).length, 347);
  assert.equal(verified.stage, 'all-objects-verified');
  assert.deepEqual(new Set(Object.keys(covers)), new Set(briefs.map(b => b.id)));
  assert.deepEqual(covers, assignStoryArtCovers(briefs, originals, reuse));
  for (const [id, cover] of Object.entries(originals)) assert.deepEqual(covers[id], cover, id);
  const urls = new Set(Object.values(originals).map(c => c.url)), usage = new Map();
  for (const cover of Object.values(covers)) {
    assert.ok(urls.has(cover.url), cover.url);
    usage.set(cover.url, (usage.get(cover.url) ?? 0) + 1);
  }
  assert.equal(usage.size, 307);
  assert.ok([...usage.values()].every(n => n <= 3));
});

test('cover assignment rejects missing images and excessive reuse before publication', () => {
  const briefs = ['a', 'b', 'c', 'd'].map(id => ({ id }));
  const originals = { a: { url: '/media/a.webp' } };
  assert.throws(() => assignStoryArtCovers(briefs, originals, { b: 'a', c: 'a', d: 'missing' }), /Unknown story artwork/);
  assert.throws(() => assignStoryArtCovers(briefs, originals, { b: 'a', c: 'a', d: 'a' }), /more than three/);
  assert.throws(() => assignStoryArtCovers(briefs, originals, { b: 'a', c: 'a' }), /Missing story cover: d/);
});
