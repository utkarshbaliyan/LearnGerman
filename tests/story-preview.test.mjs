import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null } });
after(() => vite.close());
const { storyPreview } = await vite.ssrLoadModule('/app/lib/story-preview.ts');
const { READING_STORIES } = await vite.ssrLoadModule('/app/lib/reading-path.ts');

test('First-visit story preview keeps the original text and only links words that have meanings', () => {
  const story = READING_STORIES[0];
  const preview = storyPreview(story, READING_STORIES.length, 3);
  assert.equal(preview.id, story.id);
  assert.equal(preview.storyCount, READING_STORIES.length);
  assert.equal(preview.paragraphs.length, 3);
  const original = story.text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).slice(0, 3);
  assert.deepEqual(preview.paragraphs.map(tokens => tokens.map(t => t.text).join('')), original);
  const keys = preview.paragraphs.flat().filter(t => t.key).map(t => t.key);
  assert.ok(keys.length > 5);
  for (const key of keys) assert.ok(preview.glosses[key], key);
  assert.deepEqual(Object.keys(preview.glosses).sort(), [...new Set(keys)].sort());
});
