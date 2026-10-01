import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const originals = read('content/reading/b1-reviews/original-editions.json');
const drafts = read('content/reading/b1-rewrite-drafts.json');
const support = read('content/reading/b1-reviews/reading-support.json');
const prior = new Map(['reading-path-data', 'reading-expanded-data']
  .flatMap(name => read(`app/lib/${name}.json`)).concat(originals).map(story => [story.id, story]));

const clean = token => token.toLocaleLowerCase('de-DE').replace(/[^\p{L}\p{N}]/gu, '');

test('every B1 replacement has vocabulary and hover support for its exact reviewed text', () => {
  assert.equal(originals.length, 200);
  assert.deepEqual(Object.keys(support).sort(), originals.map(s => s.id.replace(/-v1$/, '-v2')).sort());
  for (const original of originals) {
    const id = original.id.replace(/-v1$/, '-v2');
    const text = drafts[original.id].text;
    const entry = support[id];
    assert.equal(entry.sourceHash, createHash('sha256').update(text).digest('hex'), id);
    assert.equal(entry.words.length, original.words.length, id);
    assert.equal(entry.words.filter(w => !w.contextOnly).length, original.words.filter(w => !w.contextOnly).length, id);
    const sentences = text.split('\n\n').flatMap(readingSentences);
    for (const word of entry.words) {
      assert.ok(sentences.includes(word.example), `${id}: example must be an actual sentence`);
      assert.ok(word.example.toLowerCase().includes(word.form.toLowerCase()), `${id}: ${word.form}`);
      assert.ok(word.english.trim() && word.headwordEnglish.trim(), id);
    }
    for (const token of text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
      const meaning = entry.wordGlosses[clean(token)];
      assert.ok(meaning?.trim(), `${id}: ${token}`);
      assert.notEqual(meaning, 'name / place', id);
    }
  }
});

test('B1 reuse links refer to a word in both the current story and an earlier edition', () => {
  for (const original of originals) {
    const entry = support[original.id.replace(/-v1$/, '-v2')];
    assert.equal(entry.revisit.length, original.revisit.length, original.id);
    for (const link of entry.revisit) {
      const oldId = link.storyId.replace(/-v2$/, '-v1');
      const previous = prior.get(oldId);
      assert.ok(previous, link.storyId);
      assert.ok(previous.level !== 'B1' || previous.number < original.number, original.id);
      const previousText = drafts[oldId]?.text ?? previous.text;
      assert.ok(previousText.toLowerCase().includes(link.german.toLowerCase()), link.storyId);
      assert.ok(drafts[original.id].text.toLowerCase().includes(link.german.toLowerCase()), original.id);
      assert.equal(link.title, previous.title);
    }
  }
});

test('context review corrects misleading automatic lemma suggestions', () => {
  const glosses = read('content/reading/b1-reviews/word-glosses.reviewed.json');
  assert.match(glosses.erschien, /appeared; seemed/);
  assert.match(glosses.hob, /raised; lifted/);
  assert.match(glosses.eingegangenen, /received; incoming/);
  assert.match(glosses.tabletts, /trays/);
  assert.match(glosses.betriebs, /business/);
});
