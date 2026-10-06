import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';
import { allowedMedia } from '../app/lib/book-object-media.mjs';
const directory = 'content/books/zwischen-hoersaal-und-arbeitswelt';
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const digest = value => createHash('sha256').update(value).digest('hex');

test('B1 employment book has 200 unique authored pages and 800 matching translations', () => {
  const book = json(`${directory}/book.json`), english = json(`${directory}/translations.json`);
  const manuscript = readFileSync(`${directory}/manuscript.psv`, 'utf8').trim().split('\n');
  assert.equal(book.id, 'zwischen-hoersaal-und-arbeitswelt'); assert.equal(book.level, 'B1');
  assert.equal(book.pages.length, 200); assert.equal(manuscript.length, 200);
  assert.equal(Object.keys(english).length, 200);
  const paragraphs = [];
  for (const [index, page] of book.pages.entries()) {
    assert.equal(page.number, index + 1); assert.equal(page.chapter, Math.floor(index / 20) + 1);
    assert.equal(page.chapterPage, index % 20 + 1); assert.equal(page.paragraphs.length, 4);
    const fields = manuscript[index].split('|'); assert.equal(fields.length, 11);
    assert.deepEqual(page.paragraphs, [fields[2], fields[4], fields[6], fields[8]]);
    assert.equal(english[page.number].length, 4);
    for (const [i, row] of english[page.number].entries()) {
      assert.equal(row.source, page.paragraphs[i]); assert.equal(row.en, fields[3 + i * 2]);
      assert.ok(row.en.trim()); paragraphs.push(row.source);
    }
    const words = page.paragraphs.join(' ').split(/\s+/).length;
    assert.ok(words >= 115 && words <= 175, `Page ${page.number}: short reading unit`);
    for (const sentence of page.paragraphs.flatMap(readingSentences))
      assert.ok(sentence.split(/\s+/).length <= 30, `Page ${page.number}: sentence length guard`);
  }
  assert.equal(new Set(paragraphs).size, 800, 'No repeated paragraphs');
});
test('B1 word meanings and character voices match the final text', () => {
  const book = json(`${directory}/book.json`), glosses = json(`${directory}/glosses.json`), plans = json(`${directory}/dialogue-voices.json`);
  assert.equal(Object.keys(plans).length, 200);
  const male = ['Amir', 'Nico', 'Beck', 'Felix', 'Weber', 'Paul'];
  for (const page of book.pages) {
    const text = page.paragraphs.join('\n\n'), plan = plans[page.number];
    for (const token of text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
      const key = token.toLowerCase().replace(/[^a-zäöüßé]/g, '');
      assert.ok(glosses[key]?.trim(), `${page.number}: ${token}`);
      assert.notEqual(glosses[key], 'name / place');
    }
    assert.equal(plan.textHash, digest(text)); assert.equal(plan.segments.map(s => s.text).join(''), text);
    assert.equal(plan.assignments.length, [...text.matchAll(/„[^“]+“/gu)].length);
    for (const assignment of plan.assignments) {
      assert.ok(assignment.evidence.includes(`page ${page.number}`));
      assert.equal(assignment.voice, male.includes(assignment.speaker) ? 'male' : 'female');
    }
    assert.ok(plan.segments.filter(s => s.speaker === 'Narrator').every(s => s.voice === 'female'));
  }
  assert.deepEqual(plans['162'].assignments.map(a => a.speaker), ['Sommer']);
  assert.deepEqual(plans['185'].assignments.map(a => a.voice), ['male']);
  assert.match(glosses.arbeitszeugnis, /reference/); assert.match(glosses.aufenthaltstitel, /residence/);
  assert.match(glosses.stand, /status/); assert.match(glosses.tablett, /tray/);
  assert.match(glosses.eingegangen, /received/); assert.match(glosses.wachen, /awake/);
});
test('every B1 recording and R2 object is pinned to final source, voice plan and stored bytes', () => {
  const book = json(`${directory}/book.json`), manifest = json(`${directory}/audio-manifest.json`), plans = json(`${directory}/dialogue-voices.json`), receipt = json(`${directory}/release-receipt.json`);
  const registry = json(`${directory}/media-registry.json`), stored = json(`${directory}/storage-receipt.json`), delivery = json(`${directory}/object-manifest.json`);
  assert.equal(Object.keys(manifest).length, 200); assert.equal(Object.keys(registry).length, 400);
  assert.equal(stored.stage, 'all-objects-verified');
  assert.deepEqual(Object.keys(stored.objects).sort(), Object.keys(registry).sort());
  for (const page of book.pages) {
    const text = page.paragraphs.join('\n\n'), entry = manifest[page.number], plan = plans[page.number];
    const serialized = '[' + plan.segments.map(s => '[' + JSON.stringify(s.voice) + ', ' + JSON.stringify(s.text) + ']').join(', ') + ']';
    const name = `p${String(page.number).padStart(3, '0')}-page-${digest(text).slice(0, 12)}-${digest(serialized).slice(0, 8)}-qwen-dialogue-opus16`;
    assert.equal(entry.textHash, digest(text)); assert.equal(entry.src, `/audio/books/${book.id}/${name}.webm`);
    assert.equal(entry.timingSrc, `/audio/books/${book.id}/${name}.json`);
    const timing = json(`${directory}/audio/${basename(entry.timingSrc)}`);
    assert.equal(timing.textHash, entry.textHash); assert.equal(timing.duration, entry.duration);
    assert.equal(timing.starts.length, entry.wordCount); assert.equal(entry.wordCount, text.split(/\s+/).length);
    assert.ok(timing.starts.every((s, i) => Number.isFinite(s) && s >= 0 && s < entry.duration && (i === 0 || s > timing.starts[i - 1])));
    for (const path of [entry.src, entry.timingSrc]) {
      const file = readFileSync(`${directory}/audio/${basename(path)}`), hash = digest(file);
      const objectFilename = basename(path).replace(/(\.(?:webm|json))$/, `-${hash.slice(0,12)}$1`);
      const key = `books/${book.id}/${objectFilename}`;
      assert.equal(delivery[page.number][path.endsWith('.webm') ? 'src' : 'timingSrc'], `/media/${key}`);
      assert.equal(registry[key].localFilename, basename(path));
      assert.ok(allowedMedia(objectFilename, registry));
      assert.equal(registry[key].bytes, file.length); assert.equal(registry[key].sha256, digest(file));
      assert.equal(stored.objects[key].sha256, digest(file)); assert.equal(stored.objects[key].bytes, file.length);
    }
    const checked = receipt.validation[page.number];
    assert.equal(checked.audioHash, registry[delivery[page.number].src.replace(/^\/media\//, '')].sha256);
    assert.equal(receipt.sourceHashes[page.number], digest(text));
    assert.ok(checked.coverage >= .9 && checked.excess <= .12);
  }
});
test('B1 cover, contents and reader use separate book routes and object-backed narration', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null } });
  try {
    const { default: Shelf } = await vite.ssrLoadModule('/app/books/page.tsx');
    const shelf = renderToStaticMarkup(React.createElement(Shelf));
    assert.equal((shelf.match(/class="book-shelf-item"/g) ?? []).length, 3);
    assert.match(shelf, /href="\/books\/b1\/zwischen-hoersaal-und-arbeitswelt"/);
    assert.doesNotMatch(shelf, /Die Miete wartet nicht|Amir sitzt am Küchentisch/);
    const { default: Contents } = await vite.ssrLoadModule('/app/books/b1/zwischen-hoersaal-und-arbeitswelt/page.tsx');
    const contents = renderToStaticMarkup(React.createElement(Contents));
    for (const number of [1,21,41,61,81,101,121,141,161,181]) assert.ok(contents.includes(`/books/b1/zwischen-hoersaal-und-arbeitswelt/${number}`));
    const { default: Page } = await vite.ssrLoadModule('/app/books/b1/zwischen-hoersaal-und-arbeitswelt/[page]/page.tsx');
    const middle = renderToStaticMarkup(await Page({ params: Promise.resolve({ page: '100' }) }));
    assert.match(middle, /Page 100 of 200/);
    assert.match(middle, /href="\/books\/b1\/zwischen-hoersaal-und-arbeitswelt\/99"/);
    assert.match(middle, /href="\/books\/b1\/zwischen-hoersaal-und-arbeitswelt\/101"/);
    assert.equal((middle.match(/class="reading-translation-toggle"/g) ?? []).length, 1);
    assert.match(middle, /\/media\/books\/zwischen-hoersaal-und-arbeitswelt\//);
    assert.doesNotMatch(middle, /href="\/books\/a[12]\//);
    const { getB1BookPage } = await vite.ssrLoadModule('/app/lib/b1-book-data.ts');
    for (let number=1;number<=200;number++) {
      const page=getB1BookPage(number);
      assert.match(page.audio.src,/^\/media\/books\//); assert.match(page.audio.timingSrc,/^\/media\/books\//);
      assert.equal(page.translations.length,4);
    }
    for (const page of ['0','201','-1','1.5','01','abc']) await assert.rejects(Page({params:Promise.resolve({page})}));
  } finally { await vite.close(); }
});
test('adding B1 bookmarks preserves both existing book records', async () => {
  const vite = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null } });
  try {
    const { updateBookBookmark, mergeBookBookmark, readBookBookmark } = await vite.ssrLoadModule('/app/lib/book-bookmark.ts');
    const a2='nicht-nur-ein-profil', b1='zwischen-hoersaal-und-arbeitswelt';
    const existing={ page:150, updatedAt:100, volumes:{[a2]:{page:20,updatedAt:200}}};
    const local=updateBookBookmark(existing,b1,50,300);
    assert.equal(local.page,150); assert.deepEqual(local.volumes[a2],existing.volumes[a2]);
    const remote={...existing,volumes:{...existing.volumes,[b1]:{page:40,updatedAt:400}}};
    const merged=mergeBookBookmark(local,remote);
    assert.equal(merged.page,150); assert.equal(merged.volumes[a2].page,20);
    assert.deepEqual(readBookBookmark({getItem:()=>JSON.stringify(merged)},b1),{page:40,updatedAt:400});
  } finally { await vite.close(); }
});
