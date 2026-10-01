import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const directory = 'content/reading/b1-reviews/';
const drafts = read('content/reading/b1-rewrite-drafts.json');
const translations = read(`${directory}sentence-translations.json`);
const reviews = read(`${directory}translation-reviews.json`);
const edits = read(`${directory}sentence-translation-edits.reviewed.json`);

// Draft completeness and editorial acceptance are separate checks. A complete
// machine translation must not be mistaken for a completed English review.
test('B1 English paragraphs and sentences match every current German rewrite', () => {
  const ids = Object.keys(drafts).map(id => id.replace(/-v1$/, '-v2')).sort();
  assert.equal(ids.length, 200);
  assert.deepEqual(Object.keys(translations).sort(), ids);
  for (const [oldId, draft] of Object.entries(drafts)) {
    const id = oldId.replace(/-v1$/, '-v2');
    const paragraphs = draft.text.split('\n\n');
    assert.deepEqual(translations[id].paragraphs.map(p => p.source), paragraphs, id);
    for (const [i, paragraph] of translations[id].paragraphs.entries()) {
      assert.deepEqual(paragraph.sentences.map(s => s.de), readingSentences(paragraphs[i]), id);
      assert.ok(paragraph.sentences.every(s => s.en?.trim()), `${id}: missing English`);
    }
  }
});

test('English reviews and contextual corrections are bound to the exact German source', () => {
  for (const [id, review] of Object.entries(reviews)) {
    const draft = drafts[id.replace(/-v2$/, '-v1')];
    assert.ok(draft, `${id}: unknown English review`);
    assert.equal(review.sourceHash, createHash('sha256').update(draft.text).digest('hex'), id);
    assert.equal(review.sentenceCount, translations[id].paragraphs.flatMap(p => p.sentences).length, id);
  }
  for (const [id, changes] of Object.entries(edits)) {
    const lines = new Map(translations[id].paragraphs.flatMap(p => p.sentences).map(s => [s.de, s.en]));
    for (const [de, en] of Object.entries(changes)) {
      assert.ok(lines.has(de), `${id}: correction no longer matches German`);
      assert.equal(lines.get(de), en, `${id}: contextual correction was lost`);
    }
  }
});

test('reviewed English keeps contextual meanings for bookings, bicycles and plants', () => {
  const lines = id => translations[id].paragraphs.flatMap(p => p.sentences);
  const find = (id, de) => lines(id).find(s => s.de.includes(de))?.en;
  assert.match(find('reading-b1-08-v2', 'Ausdruck für die Fahrt'), /printout/i);
  assert.match(find('reading-b1-09-v2', 'dessen Schaltung'), /gears/i);
  assert.match(find('reading-b1-10-v2', 'trotz aller Mühe eingegangen'), /died/i);
  assert.match(find('reading-b1-11-v2', 'lockeren Knopf'), /sew on a loose button/i);
});

test('reviewed English preserves negatives and avoids unrelated language fragments', () => {
  const sentence = (id, part) => translations[id].paragraphs.flatMap(p => p.sentences)
    .find(s => s.de.includes(part))?.en;
  assert.match(sentence('reading-b1-88-v2', 'nicht erst dann wieder stattfinden'),
    /not have to wait.*before the induction continued/i);
  assert.match(sentence('reading-b1-91-v2', 'keine offene Datei mehr beenden'),
    /no longer.*unfinished file/i);
  assert.match(sentence('reading-b1-78-v2', 'wie die Schale auf dem Tisch stand'), /bowl/i);
  for (const id of Object.keys(reviews)) {
    for (const { en } of translations[id].paragraphs.flatMap(p => p.sentences)) {
      assert.doesNotMatch(en, /\p{Script=Han}/u, `${id}: unrelated language fragment`);
    }
  }
});

test('publication rejects a B1 collection with any missing English review', () => {
  const result = spawnSync(process.execPath, ['scripts/prepare-b1-sentence-translations.mjs', '--require-complete'],
    { cwd: root, encoding: 'utf8', timeout: 120000 });
  assert.ifError(result.error);
  if (Object.keys(reviews).length < 200) {
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Publication requires a matching English review/);
  } else {
    assert.equal(result.status, 0, result.stderr);
  }
});
