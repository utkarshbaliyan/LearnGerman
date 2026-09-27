import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const load = async name => JSON.parse(await readFile(new URL(`../app/lib/${name}.json`, import.meta.url), 'utf8'));
const spokenTokens = text => text.split(/\s+/).filter(part => /[A-Za-zÄÖÜäöüßÉé0-9]/.test(part));

test('every A1 story has a complete, source-matched English line per German sentence', async () => {
  const [core, expanded, translations] = await Promise.all([
    load('reading-path-data'), load('reading-expanded-data'), load('a1-sentence-translations'),
  ]);
  const a1 = [...core, ...expanded].filter(story => story.level === 'A1');
  assert.equal(a1.length, 104);
  assert.deepEqual(Object.keys(translations).sort(), a1.map(story => story.id).sort());
  let sentenceCount = 0;
  for (const story of a1) {
    const paragraphs = story.text.split('\n\n');
    const translated = translations[story.id]?.paragraphs;
    assert.equal(translated?.length, paragraphs.length, story.id);
    const originalSpoken = spokenTokens(story.text);
    const translatedSpoken = [];
    for (const [index, paragraph] of translated.entries()) {
      assert.equal(paragraph.source, paragraphs[index], `${story.id}: stale paragraph`);
      assert.deepEqual(paragraph.sentences.map(sentence => sentence.de),
        [...new Intl.Segmenter('de', { granularity: 'sentence' }).segment(paragraph.source)].map(part => part.segment.trim()),
        `${story.id}: wrong sentence split`);
      for (const sentence of paragraph.sentences) {
        assert.ok(sentence.de.trim() && sentence.en.trim(), story.id);
        if (sentence.de !== 'Emma') assert.notEqual(sentence.de, sentence.en, story.id);
        translatedSpoken.push(...spokenTokens(sentence.de));
        sentenceCount++;
      }
    }
    assert.deepEqual(translatedSpoken, originalSpoken, `${story.id}: narration word order`);
  }
  assert.equal(sentenceCount, 1660);
});
