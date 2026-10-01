import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

test('story readers receive the selected audio asset without downloading the collection index', async () => {
  const root = new URL('../dist/client/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', root), 'utf8'));
  const visited = new Set();
  async function inspect(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = manifest[key];
    assert.ok(entry, `Missing built client entry ${key}`);
    const code = await readFile(new URL(entry.file, root), 'utf8');
    assert.doesNotMatch(code, /\/audio\/reading\/reading-[ab][12]-/, `${entry.file} embeds collection audio paths`);
    for (const dependency of entry.imports ?? []) await inspect(dependency);
  }
  await inspect('app/components/reading-narration.tsx');
  await inspect('app/components/reading-experience.tsx');
});

test('long-lived media caching only covers filenames containing source and voice-plan hashes', async () => {
  const headers = await readFile(new URL('../dist/client/_headers', import.meta.url), 'utf8');
  for (const directory of ['audio/reading', 'audio/books/der-schluessel-im-blauen-korb']) {
    assert.ok(headers.includes(`/${directory}/*\n  Cache-Control: public, max-age=31536000, immutable`));
    const files = await readdir(new URL(`../public/${directory}/`, import.meta.url));
    assert.ok(files.length > 0);
    for (const file of files) {
      const bitrate = /^reading-b1-\d+-v2-/.test(file) ? '16' : '24';
      assert.match(file, new RegExp(`-[a-f0-9]{12}-[a-f0-9]{8}-qwen-dialogue-opus${bitrate}\\.(webm|json)$`));
    }
  }
  assert.doesNotMatch(headers, /^\/api\//m);
});
