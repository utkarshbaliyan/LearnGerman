import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';

const load = async name => JSON.parse(await readFile(new URL(`../app/lib/${name}.json`, import.meta.url), 'utf8'));
const spokenTokens = text => text.split(/\s+/).filter(part => /[A-Za-zÄÖÜäöüßÉé0-9]/.test(part));

test('every A1, A2, B1 and B2 story has complete sentence translations without changing narration word order', async () => {
  const [core, expanded, a1, later] = await Promise.all([
    load('reading-path-data'), load('reading-expanded-data'),
    load('a1-sentence-translations'), load('a2-b1-sentence-translations'),
  ]);
  const b2 = await load('reading-b2-data');
  const b2Translations = await load('b2-sentence-translations');
  const stories = [...core, ...expanded, ...b2];
  const translations = { ...a1, ...later, ...b2Translations };
  assert.equal(stories.length, 654);
  assert.deepEqual(Object.keys(translations).sort(), stories.map(story => story.id).sort());
  let count = 0;
  for (const story of stories) {
    const paragraphs = story.text.split('\n\n');
    const translated = translations[story.id].paragraphs;
    assert.equal(translated.length, paragraphs.length, story.id);
    const translatedSpoken = [];
    for (const [index, paragraph] of translated.entries()) {
      assert.equal(paragraph.source, paragraphs[index], `${story.id}: stale source`);
      assert.deepEqual(paragraph.sentences.map(s => s.de),
        readingSentences(paragraph.source), `${story.id}: alignment`);
      for (const sentence of paragraph.sentences) {
        assert.ok(sentence.en.trim(), `${story.id}: missing English`);
        translatedSpoken.push(...spokenTokens(sentence.de));
        count++;
      }
    }
    assert.deepEqual(translatedSpoken, spokenTokens(story.text), `${story.id}: audio word order`);
  }
  assert.equal(count, stories.reduce((total, story) => total + story.text.split('\n\n').flatMap(readingSentences).length, 0));
});

test('German dates and numbered floors stay in one sentence while room numbers end sentences', () => {
  assert.deepEqual(readingSentences('Am 3. Oktober komme ich. Ich wohne im 18. Stock. Das Zimmer hat die Nummer 8. Wir gehen hinein.'),
    ['Am 3. Oktober komme ich.', 'Ich wohne im 18. Stock.', 'Das Zimmer hat die Nummer 8.', 'Wir gehen hinein.']);
});

test('translations load for all stories, reject stale sources and render one initially closed control per level', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
  try {
    const { READING_STORIES } = await vite.ssrLoadModule('/app/lib/reading-path.ts');
    const { getReadingSentenceTranslations } = await vite.ssrLoadModule('/app/lib/reading-sentence-translations.ts');
    const { ReadingText } = await vite.ssrLoadModule('/app/components/reading-experience.tsx');
    const { ReadingNarrationProvider } = await vite.ssrLoadModule('/app/components/reading-narration.tsx');
    for (const story of READING_STORIES) {
      assert.ok(getReadingSentenceTranslations(story), story.id);
    }
    assert.equal(getReadingSentenceTranslations({ ...READING_STORIES[0], text: 'A changed story.' }), null);
    for (const level of ['A1', 'A2', 'B1', 'B2']) {
      const story = READING_STORIES.find(s => s.level === level);
      const html = renderToStaticMarkup(React.createElement(ReadingNarrationProvider, null,
        React.createElement(ReadingText, { story, glosses: {}, sentenceTranslations: getReadingSentenceTranslations(story) })));
      assert.equal((html.match(/class="reading-translation-toggle"/g) ?? []).length, 1);
      assert.match(html, /aria-pressed="false"/);
      assert.match(html, /Show English translations/);
      assert.doesNotMatch(html, /class="reading-sentence-translation"|Need the gist in English/);
      const indices = [...html.matchAll(/data-reading-word="(\d+)"/g)].map(m => Number(m[1]));
      assert.deepEqual(indices, spokenTokens(story.text).map((_, index) => index), `${level}: visible audio indices`);
    }
  } finally { await vite.close(); }
});
