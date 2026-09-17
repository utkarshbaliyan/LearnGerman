import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const json = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

test('narration renders accessible native controls, available speeds and slower A1 playback', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
  try {
    const { ReadingAudio, ReadingNarrationProvider } = await vite.ssrLoadModule('/app/components/reading-narration.tsx');
    for (const level of ['a1', 'a2', 'b1']) {
      const html = renderToStaticMarkup(React.createElement(ReadingNarrationProvider, null, React.createElement(ReadingAudio, { storyId: `reading-${level}-02-v1` })));
      assert.match(html, /<audio[^>]+controls=""[^>]+aria-label="German story narration"/);
      assert.match(html, /<select aria-label="Narration speed">/);
      assert.match(html, new RegExp(`<option value="${level === 'a1' ? '0.85' : '1'}" selected="">`));
      for (const rate of [.75, .85, 1, 1.15, 1.25, 1.5]) assert.ok(html.includes(`value="${rate}"`));
      assert.match(html, /Restart/);
      assert.doesNotMatch(html, /<select[^>]+disabled/);
    }
  } finally { await vite.close(); }
});

test('every graded story has a current recording and one validated timing per visible word', async () => {
  const stories = await json('../app/lib/reading-path-data.json');
  const manifest = await json('../app/lib/reading-audio-manifest.json');
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false } });
  try {
    const { narrationTokens, validNarrationTiming } = await vite.ssrLoadModule('/app/lib/reading-narration.ts');
    assert.equal(Object.keys(manifest).length, 72);
    for (const story of stories) {
      const asset = manifest[story.id];
      assert.ok(asset, story.id);
      assert.equal(asset.textHash, createHash('sha256').update(story.text).digest('hex'), `${story.id}: exact current text`);
      assert.match(asset.src, /^\/audio\/reading\/reading-[a-z0-9-]+\.m4a$/);
      const timing = await json(`../public${asset.timingSrc}`);
      assert.ok(validNarrationTiming(timing, asset), `${story.id}: finite, increasing timings within recording`);
      const paragraphs = narrationTokens(story.text);
      assert.equal(paragraphs.map(p => p.map(t => t.text).join('')).join('\n\n'), story.text, 'display preserves text');
      assert.deepEqual(paragraphs.flat().filter(t => t.wordIndex !== null).map(t => t.wordIndex), Array.from({ length: asset.wordCount }, (_, i) => i));
      const audio = new URL(`../public${asset.src}`, import.meta.url);
      assert.ok((await stat(audio)).size > 10000, `${story.id}: nonempty recording`);
      assert.equal((await readFile(audio)).subarray(4, 8).toString(), 'ftyp', 'portable MPEG-4 audio');
    }
  } finally { await vite.close(); }
});

test('spoken-word lookup handles boundaries and seeks independently of playback speed', async () => {
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false } });
  try {
    const { narrationTokens, spokenWordAt, validNarrationTiming } = await vite.ssrLoadModule('/app/lib/reading-narration.ts');
    const starts = [.1, .4, 1, 2.5];
    assert.equal(spokenWordAt(starts, 0, 3), -1);
    assert.equal(spokenWordAt(starts, .4, 3), 1);
    assert.equal(spokenWordAt(starts, 2, 3), 2);
    assert.equal(spokenWordAt(starts, .2, 3), 0, 'backwards seek');
    assert.equal(spokenWordAt(starts, 2.7, 3), 3, 'forwards seek');
    assert.equal(spokenWordAt(starts, 3, 3), -1, 'end clears highlight');
    assert.equal(spokenWordAt(starts, 0, 3), -1, 'restart resets position');
    assert.equal(spokenWordAt(starts, Number.NaN, 3), -1);
    assert.equal(spokenWordAt([], .5, 3), -1);
    // Playback rate changes media.currentTime, not the stored word timings.
    for (const rate of [.75, .85, 1, 1.15, 1.25, 1.5]) assert.equal(spokenWordAt(starts, rate * (1.2 / rate), 3), 2);
    const tokens = narrationTokens('„Hallo!“ — 12:30 Uhr.\n\nE-Mail: schön!').flat();
    assert.deepEqual(tokens.filter(t => t.wordIndex !== null).map(t => t.text), ['„Hallo!“', '12:30', 'Uhr.', 'E-Mail:', 'schön!']);
    const asset = { textHash: 'current', wordCount: 4, duration: 3 };
    assert.equal(validNarrationTiming({ textHash: 'current', starts, duration: 3 }, asset), true);
    for (const invalid of [null, {}, { textHash: 'old', starts, duration: 3 }, { textHash: 'current', starts: [.1, .4, .3, 2], duration: 3 }, { textHash: 'current', starts: [.1], duration: 3 }]) assert.equal(validNarrationTiming(invalid, asset), false);
  } finally { await vite.close(); }
});
