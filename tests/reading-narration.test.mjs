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
    const { getReadingContent } = await vite.ssrLoadModule('/app/lib/reading-content.ts');
    const manifest = await json('../app/lib/reading-audio-manifest.json');
    for (const level of ['a1', 'a2', 'b1']) {
      const editions = await json('../app/lib/reading-editions.json');
      const storyId = `reading-${level}-02-v${editions[level.toUpperCase()]}`;
      const asset=getReadingContent(storyId).audio;
      assert.equal(asset.src,manifest[storyId].src,'the original recording remains available');
      const html = renderToStaticMarkup(React.createElement(ReadingNarrationProvider, null, React.createElement(ReadingAudio, { storyId, asset })));
      assert.match(html, /<audio[^>]+controls=""[^>]+aria-label="German story narration"/);
      assert.match(html, /<select aria-label="Narration speed">/);
      assert.match(html, new RegExp(`<option value="${level === 'a1' ? '0.85' : '1'}" selected="">`));
      for (const rate of [.75, .85, 1, 1.15, 1.25, 1.5]) assert.ok(html.includes(`value="${rate}"`));
      assert.match(html, /Restart/);
      assert.ok(html.indexOf('type="audio/mp4"')<html.indexOf('type="audio/webm"'),'Safari-compatible AAC is offered before the original WebM');
      assert.ok(html.includes(asset.compatibleSrc));
      assert.doesNotMatch(html, /<select[^>]+disabled/);
    }
  } finally { await vite.close(); }
});

test('spoken-word highlighting changes only the old and new word and clears on unmount', async () => {
  const vite=await createServer({configFile:false,server:{middlewareMode:true,ws:false,watch:null}});
  try{
    const {createNarrationHighlighter}=await vite.ssrLoadModule('/app/lib/reading-narration.ts');
    const first=new Set(),second=new Set(),replacement=new Set();let queries=0;
    const element=classes=>({classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)}});
    const nodes=[element(first),element(second)];
    const highlighter=createNarrationHighlighter();
    highlighter.registerText({querySelector:selector=>{queries++;return nodes[Number(selector.match(/"(\d+)"/)[1])];}});
    highlighter.setActiveWord(0);assert.ok(first.has('reading-spoken-word'));
    for(let frame=0;frame<60;frame++)highlighter.setActiveWord(0);
    assert.equal(queries,1,'animation frames for the same word do not touch the story DOM');
    highlighter.setActiveWord(1);assert.equal(first.size,0);assert.ok(second.has('reading-spoken-word'));
    highlighter.registerText({querySelector:()=>element(replacement)});
    assert.equal(second.size,0);assert.ok(replacement.has('reading-spoken-word'),'a replacement passage receives the current highlight');
    highlighter.registerText(null);assert.equal(replacement.size,0);
    highlighter.setActiveWord(-1);
  }finally{await vite.close();}
});

test('every graded story has a current recording and one validated timing per visible word', async () => {
  const stories = [...await json('../app/lib/reading-path-data.json'), ...await json('../app/lib/reading-expanded-data.json')];
  const manifest = await json('../app/lib/reading-audio-manifest.json');
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false } });
  try {
    const { narrationTokens, validNarrationTiming } = await vite.ssrLoadModule('/app/lib/reading-narration.ts');
    assert.equal(Object.keys(manifest).length, 454);
    for (const story of stories) {
      const asset = manifest[story.id];
      assert.ok(asset, story.id);
      assert.equal(asset.textHash, createHash('sha256').update(story.text).digest('hex'), `${story.id}: exact current text`);
      assert.match(asset.src, /^\/audio\/reading\/reading-[a-z0-9-]+\.(?:webm|m4a)$/);
      const timing = await json(`../public${asset.timingSrc}`);
      assert.ok(validNarrationTiming(timing, asset), `${story.id}: finite, increasing timings within recording`);
      const paragraphs = narrationTokens(story.text);
      assert.equal(paragraphs.map(p => p.map(t => t.text).join('')).join('\n\n'), story.text, 'display preserves text');
      assert.deepEqual(paragraphs.flat().filter(t => t.wordIndex !== null).map(t => t.wordIndex), Array.from({ length: asset.wordCount }, (_, i) => i));
      const audio = new URL(`../public${asset.src}`, import.meta.url);
      assert.ok((await stat(audio)).size > 10000, `${story.id}: nonempty recording`);
      const header = (await readFile(audio)).subarray(0, 8);
      if (asset.src.endsWith('.webm')) assert.equal(header.subarray(0, 4).toString('hex'), '1a45dfa3', 'WebM audio');
      else assert.equal(header.subarray(4, 8).toString(), 'ftyp', 'AAC audio');
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
