import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';

const directory = 'content/books/nicht-nur-ein-profil';
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const digest = value => createHash('sha256').update(value).digest('hex');

test('A2 romance contains exactly 200 authored pages and 800 source-matched English paragraphs', () => {
  const book = json(`${directory}/book.json`), english = json(`${directory}/translations.json`);
  const manuscript = readFileSync(`${directory}/manuscript.psv`, 'utf8').trim().split('\n');
  assert.equal(book.id, 'nicht-nur-ein-profil'); assert.equal(book.level, 'A2');
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
    assert.ok(words >= 65 && words <= 140, `Page ${page.number}: short reading unit`);
    for (const sentence of page.paragraphs.flatMap(readingSentences))
      assert.ok(sentence.split(/\s+/).length <= 25, `Page ${page.number}: sentence length guard`);
  }
  assert.equal(new Set(paragraphs).size, 800, 'No repeated paragraphs to pad the page count');
});

test('every A2 book word has a contextual hover meaning and every quote an evidenced character voice', () => {
  const book = json(`${directory}/book.json`), glosses = json(`${directory}/glosses.json`), plans = json(`${directory}/dialogue-voices.json`);
  assert.equal(Object.keys(plans).length, 200);
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
      assert.equal(assignment.voice, ['Ben', 'Pavel', 'Martin'].includes(assignment.speaker) ? 'male' : 'female');
    }
    assert.ok(plan.segments.filter(s => s.speaker === 'Narrator').every(s => s.voice === 'female'));
  }
  assert.deepEqual(plans['100'].assignments.map(a => a.speaker), ['Lea']);
  assert.deepEqual(plans['196'].assignments.map(a => a.voice), ['male', 'female']);
  assert.match(glosses.date, /romantic/); assert.match(glosses.weiterdaten, /dating/);
});

test('A2 shelf shows only its cover and the contents and page reader stay inside the selected book', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
  try {
    const { default: Shelf } = await vite.ssrLoadModule('/app/books/page.tsx');
    const shelf = renderToStaticMarkup(React.createElement(Shelf));
    assert.match(shelf, /href="\/books\/a2\/nicht-nur-ein-profil"/);
    assert.equal((shelf.match(/class="book-shelf-item"/g) ?? []).length, 2);
    assert.doesNotMatch(shelf, /Der zweite Teller|Ein Platz für zwei|Ben steht in seiner Küche/);
    const { default: Contents } = await vite.ssrLoadModule('/app/books/a2/nicht-nur-ein-profil/page.tsx');
    const contents = renderToStaticMarkup(React.createElement(Contents));
    for (const number of [1, 21, 41, 61, 81, 101, 121, 141, 161, 181])
      assert.match(contents, new RegExp(`href="/books/a2/nicht-nur-ein-profil/${number}"`));
    assert.doesNotMatch(contents, /href="\/books\/a1\//);
    const { default: Page } = await vite.ssrLoadModule('/app/books/a2/nicht-nur-ein-profil/[page]/page.tsx');
    const middle = renderToStaticMarkup(await Page({ params: Promise.resolve({ page: '100' }) }));
    assert.match(middle, /Page 100 of 200/); assert.match(middle, /href="\/books\/a2\/nicht-nur-ein-profil\/99"/);
    assert.match(middle, /href="\/books\/a2\/nicht-nur-ein-profil\/101"/);
    assert.equal((middle.match(/class="reading-translation-toggle"/g) ?? []).length, 1);
    assert.doesNotMatch(middle, /href="\/books\/a1\//);
    for (const page of ['0', '201', '-1', '1.5', '01', 'abc'])
      await assert.rejects(Page({ params: Promise.resolve({ page }) }));
  } finally { await vite.close(); }
});

test('all 200 A2 book recordings match the final source and voices with complete word timings', () => {
  const book = json(`${directory}/book.json`), manifest = json(`${directory}/audio-manifest.json`), plans = json(`${directory}/dialogue-voices.json`);
  assert.equal(Object.keys(manifest).length, 200);
  for (const page of book.pages) {
    const text = page.paragraphs.join('\n\n'), entry = manifest[page.number], plan = plans[page.number];
    const serialized = '[' + plan.segments.map(s => '[' + JSON.stringify(s.voice) + ', ' + JSON.stringify(s.text) + ']').join(', ') + ']';
    const name = `p${String(page.number).padStart(3, '0')}-page-${digest(text).slice(0, 12)}-${digest(serialized).slice(0, 8)}-qwen-dialogue-opus16`;
    assert.equal(entry.textHash, digest(text));
    assert.equal(entry.src, `/audio/books/nicht-nur-ein-profil/${name}.webm`);
    assert.equal(entry.timingSrc, `/audio/books/nicht-nur-ein-profil/${name}.json`);
    const timing = json(`public${entry.timingSrc}`), audio = `public${entry.src}`;
    assert.equal(timing.textHash, entry.textHash); assert.equal(timing.duration, entry.duration);
    assert.equal(timing.starts.length, entry.wordCount); assert.equal(entry.wordCount, text.split(/\s+/).length);
    assert.ok(timing.starts.every((s, i) => Number.isFinite(s) && s >= 0 && s < entry.duration && (i === 0 || s > timing.starts[i - 1])));
    assert.equal(readFileSync(audio).subarray(0, 4).toString('hex'), '1a45dfa3'); assert.ok(statSync(audio).size > 10000);
  }
});
