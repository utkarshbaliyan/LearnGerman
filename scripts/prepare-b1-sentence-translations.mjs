import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';
import { chooseSentenceTranslations } from './lib/select-sentence-translations.mjs';

const directory = 'content/reading/b1-reviews';
const read = name => JSON.parse(readFileSync(`${directory}/${name}`, 'utf8'));
const drafts = JSON.parse(readFileSync('content/reading/b1-rewrite-drafts.json', 'utf8'));
const reference = read('sentence-translations.draft.json');
const context = read('paragraph-translations.draft.json');
const edits = read('sentence-translation-edits.reviewed.json');
const reviews = read('translation-reviews.json');
const used = new Set();
const output = {};
for (const [oldId, draft] of Object.entries(drafts)) {
  assert.equal(draft.reviewStatus, 'editorially-accepted', oldId);
  const id = oldId.replace(/-v1$/, '-v2');
  const paragraphs = draft.text.split('\n\n');
  const lines = paragraphs.map(readingSentences);
  assert.deepEqual(reference[id]?.paragraphs.map(p => p.source), paragraphs, `${id}: stale sentence translation`);
  assert.deepEqual(reference[id].paragraphs.map(p => p.sentences.map(s => s.de)), lines, `${id}: stale German lines`);
  assert.deepEqual(context[id]?.paragraphs.map(p => p.source), paragraphs, `${id}: stale paragraph translation`);
  output[id] = { paragraphs: paragraphs.map((source, index) => {
    const baseline = reference[id].paragraphs[index].sentences.map(s => s.en);
    assert.ok(baseline.every(s => s?.trim()), `${id}: missing English`);
    const selected = chooseSentenceTranslations(context[id].paragraphs[index].contextEnglish, baseline);
    return { source, sentences: lines[index].map((de, i) => {
      let en = edits[id]?.[de] ?? selected[i];
      if (edits[id]?.[de]) used.add(`${id}:${de}`);
      let opening = !(de.includes('“') && (!de.includes('„') || de.indexOf('“') < de.indexOf('„')));
      en = en.replaceAll('"', () => { const quote = opening ? '“' : '”'; opening = !opening; return quote; });
      if (de.startsWith('„') && !en.startsWith('“')) en = `“${en}`;
      if (de.endsWith('“') && !en.endsWith('”')) en += '”';
      return { de, en };
    }) };
  }) };
  if (reviews[id]) {
    assert.equal(reviews[id].sourceHash, createHash('sha256').update(draft.text).digest('hex'), `${id}: stale English review`);
    assert.equal(reviews[id].sentenceCount, lines.flat().length, `${id}: incomplete English review`);
  }
}
for (const [id, changes] of Object.entries(edits)) for (const de of Object.keys(changes))
  assert.ok(used.has(`${id}:${de}`), `${id}: stale English correction: ${de}`);
if (process.argv.includes('--require-complete')) {
  assert.equal(Object.keys(drafts).length, 200, 'The B1 replacement must contain all 200 stories');
  assert.deepEqual(Object.keys(reviews).sort(), Object.keys(output).sort(),
    'Publication requires a matching English review for every B1 story');
}
writeFileSync(`${directory}/sentence-translations.json`, JSON.stringify(output) + '\n');
console.log(`Prepared ${Object.keys(output).length} translations; ${Object.keys(reviews).length} reviewed; ${used.size} corrections`);
