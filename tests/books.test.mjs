import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { createServer } from 'vite';

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

test('the A1 book preserves all 200 source pages and four paragraphs per page', async () => {
  const source = await readFile(new URL('../content/books/der-schluessel-im-blauen-korb.txt', import.meta.url), 'utf8');
  const book = await readJson('../app/lib/book-data.json');
  const headings = [...source.matchAll(/^Seite (\d+) — ([^\n]+)$/gm)];
  const chapters = [...source.matchAll(/^KAPITEL (\d+): ([^\n]+)$/gm)];
  assert.equal(book.title, 'Der Schlüssel im blauen Korb');
  assert.equal(book.subtitle, 'Eine leichte Geschichte auf Deutsch – Niveau A1');
  assert.equal(book.level, 'A1');
  assert.equal(headings.length, 200);
  assert.equal(chapters.length, 10);
  assert.equal(book.pages.length, 200);
  for (const [index, match] of headings.entries()) {
    const page = book.pages[index];
    const body = source.slice(match.index + match[0].length, headings[index + 1]?.index ?? source.length).split(/^KAPITEL \d+: /m)[0].trim();
    const paragraphs = body.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
    assert.equal(page.number, index + 1);
    assert.equal(page.chapter, Math.floor(index / 20) + 1);
    assert.equal(page.chapterPage, index % 20 + 1);
    assert.equal(page.title, match[2]);
    assert.equal(paragraphs.length, 4);
    assert.deepEqual(page.paragraphs, paragraphs, `page ${index + 1} text remains exact`);
  }
});

test('every book word has a tap or hover meaning', async () => {
  const book = await readJson('../app/lib/book-data.json');
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
  try {
    const { getBookPage } = await vite.ssrLoadModule('/app/lib/book-data.ts');
    const { cleanWord } = await vite.ssrLoadModule('/app/curriculum/index.ts');
    for (const page of book.pages) {
      const glosses = getBookPage(page.number).glosses;
      for (const paragraph of page.paragraphs) for (const token of paragraph.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
        assert.ok(glosses[cleanWord(token)], `page ${page.number}: ${token}`);
      }
    }
    assert.equal(getBookPage(0), null);
    assert.equal(getBookPage(201), null);
  } finally { await vite.close(); }
});

test('each of the 800 book paragraphs has its own matching recording and word timings', async () => {
  const book = await readJson('../app/lib/book-data.json');
  const manifest = await readJson('../app/lib/book-audio-manifest.json');
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false } });
  try {
    const { narrationTokens, validNarrationTiming } = await vite.ssrLoadModule('/app/lib/reading-narration.ts');
    assert.equal(Object.keys(manifest).length, 200);
    for (const page of book.pages) {
      const assets = manifest[String(page.number)];
      assert.equal(assets?.length, 4, `page ${page.number}`);
      for (const [index, paragraph] of page.paragraphs.entries()) {
        const asset = assets[index];
        assert.equal(asset.textHash, createHash('sha256').update(paragraph).digest('hex'));
        assert.equal(asset.wordCount, narrationTokens(paragraph)[0].filter(part => part.wordIndex !== null).length);
        const timing = await readJson(`../public${asset.timingSrc}`);
        assert.ok(validNarrationTiming(timing, asset), `page ${page.number}, paragraph ${index + 1}`);
        const path = new URL(`../public${asset.src}`, import.meta.url);
        assert.ok((await stat(path)).size > 10000);
        assert.equal((await readFile(path)).subarray(0, 4).toString('hex'), '1a45dfa3');
      }
    }
  } finally { await vite.close(); }
});

test('the previous book media and manuscript are absent from the active site', async () => {
  await assert.rejects(stat(new URL('../public/audio/books/unser-leben-in-lindenstadt', import.meta.url)), { code: 'ENOENT' });
  await assert.rejects(stat(new URL('../content/books/unser-leben-in-lindenstadt.txt', import.meta.url)), { code: 'ENOENT' });
});
