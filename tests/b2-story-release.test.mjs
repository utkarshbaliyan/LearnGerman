import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {dialogueSegments} from '../scripts/lib/story-dialogue.mjs';
import {germanWordCount} from '../scripts/lib/b2-story-quality.mjs';
import {allowedStoryMedia} from '../app/lib/story-object-media.mjs';

const read = path => JSON.parse(readFileSync(new URL('../'+path, import.meta.url), 'utf8'));
const hash = data => createHash('sha256').update(data).digest('hex');

test('all 200 B2 stories preserve reviewed text, translations and distinct identities', () => {
  const stories = read('app/lib/reading-b2-data.json'), previous = [...read('app/lib/reading-path-data.json'), ...read('app/lib/reading-expanded-data.json')];
  const progress = read('content/reading/b2/manuscripts/progress.json');
  assert.equal(stories.length,200);
  assert.equal(new Set([...previous,...stories].map(s=>s.id)).size,654);
  const earlierTitles=new Set(previous.map(s=>s.title.toLocaleLowerCase('de')));
  assert.equal(new Set(stories.map(s=>s.title.toLocaleLowerCase('de'))).size,200);
  assert.ok(stories.every(s=>!earlierTitles.has(s.title.toLocaleLowerCase('de'))));
  assert.equal(new Set([...previous,...stories].map(s=>s.text)).size,654);
  assert.deepEqual(stories.map(s=>s.number),Array.from({length:200},(_,i)=>i+1));
  for(let section=1;section<=20;section++) assert.equal(stories.filter(s=>s.section===section).length,10);
  for(const story of stories) {
    const manuscript=read(`content/reading/b2/manuscripts/${story.id}.json`);
    assert.equal(story.level,'B2');assert.equal(story.courseChapter,null);
    assert.ok(germanWordCount(story.text)>=900 && germanWordCount(story.text)<=1000);
    assert.equal(story.text,manuscript.text);assert.equal(story.english,manuscript.english);
    assert.equal(hash(story.text),progress.reviews[story.id].sourceHash);
    assert.deepEqual(story.words,manuscript.vocabulary);assert.deepEqual(story.questions,manuscript.questions);
    assert.equal(story.questions.length,4);assert.equal(new Set(story.questions.map(q=>q.prompt)).size,4);
    assert.equal(story.grammar[0],manuscript.grammarFocus);
  }
});

test('every B2 narration pins the reviewed speaker plan, timings and byte-verified R2 objects', () => {
  const stories=read('app/lib/reading-b2-data.json'), audio=read('content/reading/b2/audio-manifest.json');
  const registry=read('content/reading/b2/media-registry.json'), stored=read('content/reading/b2/media-verification.json'), reports=read('content/reading/b2/audio-validation.json');
  assert.equal(Object.keys(audio).length,200);assert.equal(Object.keys(registry).length,400);
  assert.equal(stored.stage,'all-objects-verified');assert.deepEqual(Object.keys(stored.objects).sort(),Object.keys(registry).sort());
  const heard=new Set();
  for(const story of stories) {
    const manuscript=read(`content/reading/b2/manuscripts/${story.id}.json`), segments=dialogueSegments(story.text,manuscript.speakerAssignments);
    const serialized='['+segments.map(s=>'['+JSON.stringify(s.voice)+', '+JSON.stringify(s.text)+']').join(', ')+']';
    const name=`${story.id}-${hash(story.text).slice(0,12)}-${hash(serialized).slice(0,8)}-qwen-dialogue-opus16`;
    const asset=audio[story.id], timing=read(`content/reading/b2/timings/${story.id}.json`), report=reports[story.id];
    assert.equal(asset.textHash,hash(story.text));assert.equal(timing.textHash,asset.textHash);
    assert.equal(report.textHash,asset.textHash);assert.equal(report.planHash,hash(serialized));
    assert.ok(report.coverage>=.9 && report.excess<=.12);report.voices.forEach(v=>heard.add(v));
    assert.equal(asset.wordCount,story.text.split(/\s+/).filter(w=>/[A-Za-zÄÖÜäöüßÉé0-9]/.test(w)).length);
    assert.equal(timing.starts.length,asset.wordCount);assert.equal(timing.duration,asset.duration);
    assert.ok(timing.starts.every((n,i)=>Number.isFinite(n)&&n>=0&&n<asset.duration&&(i===0||n>timing.starts[i-1])));
    for(const [path,ext] of [[asset.src,'webm'],[asset.timingSrc,'json']]) {
      assert.ok(path.startsWith(`/media/stories/b2/${name}-`) && path.endsWith('.'+ext));
      const key=path.slice('/media/'.length), entry=registry[key];
      assert.equal(allowedStoryMedia(path.split('/').at(-1),registry)?.key,key);
      assert.deepEqual(stored.objects[key],{bytes:entry.bytes,sha256:entry.sha256});
      if(ext==='json') {
        // The generator's JSON layout is retained so timings are byte-verifiable.
        const timingBytes=readFileSync(new URL(`../content/reading/b2/timings/${story.id}.json`,import.meta.url));
        assert.equal(hash(timingBytes),entry.sha256);assert.equal(timingBytes.length,entry.bytes);
      }
    }
  }
  assert.deepEqual([...heard].sort(),['female','male']);
});

test('B2 filtering, narrator controls, next-story routing and saved progress work with the existing library', async () => {
  const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,ws:false}});
  try {
    const {READING_STORIES,READING_LEVELS,readingSummary}=await vite.ssrLoadModule('/app/lib/reading-path.ts');
    const {filterReadingStories}=await vite.ssrLoadModule('/app/lib/reading-library.ts');
    const {getReadingContent}=await vite.ssrLoadModule('/app/lib/reading-content.ts');
    const {ReadingAudio,ReadingNarrationProvider}=await vite.ssrLoadModule('/app/components/reading-narration.tsx');
    const {markStory,mergeStoryProgress}=await vite.ssrLoadModule('/app/lib/story-progress.ts');
    assert.deepEqual(READING_LEVELS,['A1','A2','B1','B2']);assert.equal(READING_STORIES.length,654);
    const summaries=READING_STORIES.map(readingSummary);assert.equal(filterReadingStories(summaries,'B2','all','').length,200);
    assert.ok(filterReadingStories(summaries,'B2','home','house').length>0);
    assert.ok(filterReadingStories(summaries,'B2','all','concessive').length>0);
    assert.ok(summaries.filter(s=>s.level==='B2').every(s=>s.hasAudio));
    const content=getReadingContent('reading-b2-01-v1');assert.ok(content.audio && content.sentenceTranslations && Object.keys(content.glosses).length);
    assert.equal(content.glosses.flachen,'flat / low');assert.equal(content.glosses.rollen,'roll');
    assert.equal(content.glosses.streifen,'strip / stripe / brush against');assert.equal(content.glosses.wagen,'car / carriage / dare');
    const html=renderToStaticMarkup(React.createElement(ReadingNarrationProvider,null,React.createElement(ReadingAudio,{storyId:content.story.id,asset:content.audio})));
    assert.match(html,/<audio[^>]+controls=""/);assert.match(html,/\/media\/stories\/b2\//);assert.match(html,/<option value="1" selected="">/);
    const old=markStory({entries:{}},'reading-b1-200-v2',true,100);
    const merged=mergeStoryProgress(markStory(old,'reading-b2-01-v1',true,200),old);
    assert.equal(merged.entries['reading-b1-200-v2'].completed,true);assert.equal(merged.entries['reading-b2-01-v1'].completed,true);
  } finally {await vite.close();}
});
