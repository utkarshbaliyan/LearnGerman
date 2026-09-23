import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

const original = JSON.parse(readFileSync(new URL('../app/lib/reading-path-data.json', import.meta.url)));
const added = JSON.parse(readFileSync(new URL('../app/lib/reading-expanded-data.json', import.meta.url)));

test('expanded scenes meet level/topic targets without recycled prose or lost original stories', async () => {
 const vite = await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,ws:false}});
 try {
  const {READING_STORIES,READING_SECTIONS,readingSummary,getChapterReading} = await vite.ssrLoadModule('/app/lib/reading-path.ts');
  const {filterReadingStories} = await vite.ssrLoadModule('/app/lib/reading-library.ts');
  const {mergeStoryProgress,markStory} = await vite.ssrLoadModule('/app/lib/story-progress.ts');
  assert.equal(added.length,382);
  assert.equal(new Set(READING_STORIES.map(s=>s.text)).size,454);
  for(const old of original) assert.deepEqual(READING_STORIES.find(s=>s.id===old.id),old);
  const means=[];
  for(const [level,total] of [['A1',104],['A2',150],['B1',200]]) {
   const all=READING_STORIES.filter(s=>s.level===level);
   assert.equal(all.length,total);
   assert.deepEqual(all.map(s=>s.number),Array.from({length:total},(_,i)=>i+1));
   assert.equal(all.filter(s=>readingSummary(s).hasAudio).length,24);
   for(const topic of ['home','school','health','travel','work','cafe','family','animals','nature','shopping']) assert.ok(all.filter(s=>s.number>24&&s.topics.includes(topic)).length>=4,`${level}: ${topic}`);
   assert.equal(getChapterReading(level,25),undefined,'library scenes must not create course chapters');
   const expansion=all.filter(s=>s.number>24);
   means.push(expansion.reduce((sum,s)=>sum+s.text.split(/\s+/).length,0)/expansion.length);
   for(const story of expansion) {
    assert.ok(READING_SECTIONS[level][story.section-1]);
    assert.equal(story.courseChapter,null);
    assert.ok(story.words.length>=3&&story.words.length<=4);
    assert.ok(story.text.split(/\s+/).length>=40);
    assert.doesNotMatch(story.text,/~|Die Hauptperson|eine Geschichte, die später unter dem Titel/);
    assert.equal(story.questions.length,2);
    for(const q of story.questions) {
     assert.equal(new Set(q.options).size,3);
     assert.equal(q.options[q.answer],q.explanation);
     assert.ok(story.english.includes(q.explanation));
    }
   }
  }
  assert.ok(means[0]<means[1]&&means[1]<means[2]);
  // Catch renamed copies and repeated filler paragraphs, not just identical IDs.
  const shingles=added.map(s=>{
   const words=s.text.toLowerCase().replace(/[^\p{L}\s]/gu,'').split(/\s+/);
   return new Set(words.slice(0,-5).map((_,i)=>words.slice(i,i+6).join(' ')));
  });
  for(let i=0;i<shingles.length;i++) for(let j=i+1;j<shingles.length;j++) {
   const common=[...shingles[i]].filter(s=>shingles[j].has(s)).length;
   assert.ok(common / Math.min(shingles[i].size,shingles[j].size)<0.35,`${added[i].id} overlaps ${added[j].id}`);
  }
  const summaries=READING_STORIES.map(readingSummary);
  assert.ok(filterReadingStories(summaries,'A1','all','house').some(s=>s.topics.includes('home')));
  assert.ok(filterReadingStories(summaries,'A2','all','HOSPITAL').some(s=>s.topics.includes('health')));
  assert.deepEqual(filterReadingStories(summaries,'B1','cafe','café'),filterReadingStories(summaries,'B1','cafe','cafe'));
  assert.equal(filterReadingStories(summaries,'A1','all','',true).length,24);
  assert.equal(filterReadingStories(summaries,'A1','all','zzzz-no-match').length,0);
  assert.ok(filterReadingStories(summaries,'B1','home','genitive').length>0);
  let progress=markStory({entries:{}},'reading-b1-200-v1',true,200);
  progress=mergeStoryProgress(progress,markStory({entries:{}},'reading-a1-01-v1',true,100));
  assert.equal(progress.entries['reading-b1-200-v1'].completed,true);
  assert.equal(progress.entries['reading-a1-01-v1'].completed,true);
  progress=mergeStoryProgress(markStory(progress,'reading-b1-200-v1',false,300),progress);
  assert.equal(progress.entries['reading-b1-200-v1'].completed,false);
 } finally {await vite.close();}
});
