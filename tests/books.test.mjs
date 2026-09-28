import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

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

test('every book paragraph has a concise English summary', async () => {
  const summaries = await readJson('../app/lib/book-summaries.json');
  const source = await readFile(new URL('../content/books/paragraph-summaries.psv', import.meta.url), 'utf8');
  assert.equal(summaries.length, 200);
  assert.equal(source.trim().split('\n').length, 200);
  for (const [pageIndex, row] of summaries.entries()) {
    assert.equal(row.length, 4, `page ${pageIndex + 1}`);
    for (const [paragraphIndex, summary] of row.entries()) {
      assert.ok(summary.split(' ').length >= 4 && summary.split(' ').length <= 25,
        `page ${pageIndex + 1}, paragraph ${paragraphIndex + 1}`);
    }
    assert.equal(source.trim().split('\n')[pageIndex], `${pageIndex + 1}|${row.join('|')}`);
  }
});

test('all 200 book pages have one complete recording with continuous word timings and paragraph pauses', async () => {
  const book = await readJson('../app/lib/book-data.json');
  const manifest = await readJson('../app/lib/book-audio-manifest.json');
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false } });
  try {
    const { narrationTokens, validNarrationTiming } = await vite.ssrLoadModule('/app/lib/reading-narration.ts');
    assert.equal(Object.keys(manifest).length, 200);
    for (const page of book.pages) {
      const asset = manifest[String(page.number)];
      assert.ok(asset && !Array.isArray(asset), `page ${page.number}: one asset`);
      const text = page.paragraphs.join('\n\n');
      assert.equal(asset.textHash, createHash('sha256').update(text).digest('hex'));
      assert.equal(asset.wordCount, narrationTokens(text).flat().filter(part => part.wordIndex !== null).length);
        const timing = await readJson(`../public${asset.timingSrc}`);
        assert.ok(validNarrationTiming(timing, asset), `page ${page.number}`);
        let offset = 0;
        for (const [index, paragraph] of page.paragraphs.entries()) {
          if (index) assert.ok(timing.starts[offset] - timing.starts[offset - 1] > .3, `page ${page.number}: paragraph pause`);
          offset += narrationTokens(paragraph)[0].filter(part => part.wordIndex !== null).length;
        }
        const path = new URL(`../public${asset.src}`, import.meta.url);
        assert.ok((await stat(path)).size > 10000);
        assert.equal((await readFile(path)).subarray(0, 4).toString('hex'), '1a45dfa3');
    }
  } finally { await vite.close(); }
});

test('every book paragraph has full source-matched English and each page renders one translation toggle', async () => {
  const book = await readJson('../app/lib/book-data.json');
  const translations = await readJson('../app/lib/book-translations.json');
  assert.equal(Object.keys(translations).length, 200);
  for (const page of book.pages) {
    const row = translations[String(page.number)];
    assert.equal(row.length, 4);
    for (const [index, paragraph] of row.entries()) {
      assert.equal(paragraph.source, page.paragraphs[index]);
      assert.ok(paragraph.en.trim());
    }
  }
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
  try {
    const { getBookPage } = await vite.ssrLoadModule('/app/lib/book-data.ts');
    const { BookPageReader } = await vite.ssrLoadModule('/app/components/book-page-reader.tsx');
    for (const number of [1, 50, 200]) {
      const page = getBookPage(number);
      const html = renderToStaticMarkup(React.createElement(BookPageReader, page));
      assert.equal((html.match(/<audio /g) ?? []).length, 1);
      assert.equal((html.match(/class="reading-translation-toggle"/g) ?? []).length, 1);
      assert.match(html, /aria-pressed="false"/);
      assert.match(html, /aria-label="Play this whole page in German"/);
      assert.match(html, /<option value="0.85" selected="">/);
      assert.doesNotMatch(html, /book-paragraph-translation|book-paragraph-summary/);
      const indices = [...html.matchAll(/data-reading-word="(\d+)"/g)].map(m => Number(m[1]));
      assert.deepEqual(indices, Array.from({ length: page.audio.wordCount }, (_, index) => index));
    }
  } finally { await vite.close(); }
});

test('the previous book media and manuscript are absent from the active site', async () => {
  await assert.rejects(stat(new URL('../public/audio/books/unser-leben-in-lindenstadt', import.meta.url)), { code: 'ENOENT' });
  await assert.rejects(stat(new URL('../content/books/unser-leben-in-lindenstadt.txt', import.meta.url)), { code: 'ENOENT' });
});
