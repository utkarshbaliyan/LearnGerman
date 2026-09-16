import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

test('graded stories have complete vocabulary support, meaningful questions and course coverage', async () => {
 const vite = await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false}});
 try {
  const {READING_STORIES:stories, getReadingStory, readingWordCount} = await vite.ssrLoadModule('/app/lib/reading-path.ts');
  const {readingGlosses} = await vite.ssrLoadModule('/app/lib/reading-content.ts');
  const {cleanWord} = await vite.ssrLoadModule('/app/curriculum/index.ts');
  const {getCourseChapter} = await vite.ssrLoadModule('/app/course/course-data.ts');
  const ids = new Set(stories.map(story=>story.id));
  assert.equal(ids.size,72);
  assert.equal(getReadingStory('reading-a1-25-v1'),undefined);
  assert.equal(getReadingStory('a1-1'),undefined);
  assert.ok(readingWordCount(stories[0].text)<=35);
  for(const level of ['A1','A2','B1']) {
   const group=stories.filter(s=>s.level===level);assert.equal(group.length,24);
   const means=[1,2,3,4].map(section=>{
    const part=group.filter(s=>s.section===section);assert.equal(part.length,6);
    return part.reduce((sum,s)=>sum+readingWordCount(s.text),0)/6;
   });
   for(let i=1;i<means.length;i++)assert.ok(means[i]>means[i-1],`${level} section progression`);
  }
  for(const story of stories){
   const chapter=getCourseChapter(story.level,story.number);
   assert.equal(chapter.story.id,story.id);assert.equal(chapter.story.text,story.text);
   assert.equal(chapter.story.audioReady,false,'old recording cannot represent new text');
   assert.equal(chapter.vocabulary.length,story.words.filter(word=>!word.contextOnly).length);
   assert.equal(story.questions.length,2);assert.notEqual(story.questions[0].prompt,story.questions[1].prompt);
   assert.notEqual(chapter.listening[0].prompt,chapter.reading[0].prompt);
   for(const q of story.questions){assert.equal(new Set(q.options).size,3);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);assert.ok(q.explanation.length>15);}
   for(const word of story.words){assert.ok(story.text.includes(word.example),`${story.id}: source example`);assert.ok(word.example.toLowerCase().includes(word.form.toLowerCase()),`${story.id}: ${word.german}`);}
   for(const link of story.revisit){assert.ok(ids.has(link.storyId));assert.ok(stories.findIndex(s=>s.id===link.storyId)<stories.indexOf(story));assert.ok(story.text.toLowerCase().includes(link.german.toLowerCase()));}
   const glosses=readingGlosses(story);
   for(const token of story.text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu)||[]){assert.ok(glosses[cleanWord(token)],`${story.id}: ${token}`);assert.notEqual(glosses[cleanWord(token)],'name / place');}
   assert.doesNotMatch(story.text,/Die Hauptperson|mit eine Sprechübung|Am Ende kann die Hauptperson/);
  }
  for(const s of stories.filter(s=>s.level==='A1'&&s.number<=6))assert.doesNotMatch(s.text,/\b(weil|dass|obwohl|nachdem|während)\b/);
  const coverage=JSON.parse(await readFile(new URL('../docs/reading/topic-coverage.json',import.meta.url),'utf8'));
  assert.equal(coverage.length,36);
  for(const row of coverage){assert.ok(row.storyIds.length);for(const id of row.storyIds){assert.ok(ids.has(id));assert.equal(getReadingStory(id).level,row.level);}}
 } finally {await vite.close();}
});

test('new story editions retain old progress without inheriting old results', async()=>{
 const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false}});
 try{
  const {mergeProgress}=await vite.ssrLoadModule('/app/lib/progress-merge.ts');
  const {readingEditionComplete,readingEditionId}=await vite.ssrLoadModule('/app/lib/reading-progress.ts');
  const {markStory,mergeStoryProgress}=await vite.ssrLoadModule('/app/lib/story-progress.ts');
  const id=readingEditionId('A1',1), date='2026-09-16T10:00:00Z';
  const perfect={score:100,checkedAt:date,usedText:true};
  const old={chapters:{'a1-1-1':{completed:true,checkpointScore:100,skillScores:{reading:100,listening:100},comprehensionChecks:{reading:perfect,listening:perfect}}}};
  let merged=mergeProgress('course',old,{});
  assert.equal(merged.chapters['a1-1-1'].completed,true);
  assert.equal(readingEditionComplete(merged.chapters['a1-1-1'].readingEditions[id]),false);
  const newEdition={reading:perfect,listening:{...perfect,usedText:false},checkpoint:perfect,completedAt:date};
  const local={chapters:{'a1-1-1':{readingEditions:{[id]:newEdition}}}};
  merged=mergeProgress('course',local,old);
  assert.equal(readingEditionComplete(merged.chapters['a1-1-1'].readingEditions[id]),true);
  const newer={chapters:{'a1-1-1':{readingEditions:{[id]:{reading:{score:0,checkedAt:'2026-09-16T11:00:00Z',usedText:true}}}}}};
  const later=mergeProgress('course',newer,merged);
  assert.equal(later.chapters['a1-1-1'].readingEditions[id].reading.score,0);
  assert.equal(readingEditionComplete(later.chapters['a1-1-1'].readingEditions[id]),false);
  assert.equal(later.chapters['a1-1-1'].readingEditions[id].listening.score,100);
  assert.deepEqual(mergeProgress('course',merged,newer),later);
  const saved=mergeStoryProgress(markStory({entries:{}},id,true,10),['legacy-story']);
  assert.equal(saved.entries[id].completed,true);assert.equal(saved.entries['legacy-story'].completed,true);
 }finally{await vite.close();}
});
