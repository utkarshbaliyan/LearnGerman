import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'vite';

test('six reception samples have distinct transfer tasks, valid evidence and exact audio assets',async()=>{
 const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false}});
 try{
  const {RECEPTION_LESSONS:lessons,getReceptionAudio}=await vite.ssrLoadModule('/app/lib/reception.ts');
  const {RECEPTION_CATALOG:catalog}=await vite.ssrLoadModule('/app/lib/reception-catalog.ts');
  const {getCourseChapter}=await vite.ssrLoadModule('/app/course/course-data.ts');
  const {receptionScore,receptionAnswered}=await vite.ssrLoadModule('/app/lib/reception-progress.ts');
  assert.equal(lessons.length,6);const ids=new Set();let audioCount=0;
  for(const level of ['A1','A2','B1'])assert.equal(lessons.filter(l=>l.level===level).length,2);
  for(const lesson of lessons){
   assert.ok(catalog.some(l=>l.id===lesson.id));assert.equal(getCourseChapter(lesson.level,lesson.chapter).receptionLessonId,lesson.id);
   assert.deepEqual(lesson.guided.map(a=>a.skill),['reading','listening']);assert.deepEqual(lesson.transfer.map(a=>a.skill),['reading','listening']);
   for(let i=0;i<2;i++)assert.notDeepEqual(lesson.guided[i].segments,lesson.transfer[i].segments);
   for(const a of [...lesson.guided,...lesson.transfer]){
    assert.ok(!ids.has(a.id));ids.add(a.id);assert.ok(a.questions.length>=2);assert.ok(a.help.length>10);
    const correct=Object.fromEntries(a.questions.map((q,i)=>[i,q.answers]));
    assert.equal(receptionScore(a,correct),100);assert.equal(receptionAnswered(a,correct),true);assert.equal(receptionAnswered(a,{}),false);
    for(const q of a.questions){
     assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.explanation.length>15);assert.ok(q.evidence.length>0);
     for(const e of q.evidence)assert.ok(a.segments[e]?.text.length>0);
     for(const answer of q.answers)assert.ok(Number.isInteger(answer)&&answer>=0&&answer<q.options.length);
     if(q.kind==='match')assert.equal(q.labels.length,q.answers.length);
     if(q.kind==='sequence')assert.equal(new Set(q.answers).size,q.answers.length);
    }
    if(a.skill==='listening'){
     audioCount++;const audio=getReceptionAudio(a.id);assert.ok(audio.synthetic);assert.equal(audio.starts.length,a.segments.length);assert.ok(audio.duration>5);assert.equal(audio.starts[0],0);
     for(let i=1;i<audio.starts.length;i++)assert.ok(audio.starts[i]>audio.starts[i-1]);assert.ok(audio.starts.at(-1)<audio.duration);
     assert.equal(audio.textHash,createHash('sha256').update(a.segments.map(s=>s.text).join('\n')).digest('hex'));
     const file=await readFile(`public${audio.src}`);assert.ok(file.length>2000);assert.equal(file.toString('ascii',4,8),'ftyp');
    }
   }
  }
  assert.equal(ids.size,24);assert.equal(audioCount,12);
 }finally{await vite.close();}
});

test('reception evidence retains support and first checks, merges concurrent retries and schedules later tasks',async()=>{
 const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false}});
 try{
  const p=await vite.ssrLoadModule('/app/lib/reception-progress.ts');const {mergeProgress}=await vite.ssrLoadModule('/app/lib/progress-merge.ts');
  const read='reception-a1-01-v1-reading-guided',listen='reception-a1-01-v1-listening-guided';
  const first='2026-09-16T10:00:00Z',later='2026-09-17T10:00:00Z';
  const attempt=(id,time,score=100)=>({id,checkedAt:time,score,audioComplete:true,playbackStarts:1});
  let state=p.supportReception({},read,first);state=p.mergeReceptionProgress(JSON.parse(JSON.stringify(state)),{});
  state=p.recordReceptionAttempt(state,read,attempt('one',first));assert.equal(state[read].attempts[0].supportUsed,true);
  assert.equal(p.receptionResultLabel(state[read].attempts[0],'reading'),'With support');assert.equal(p.receptionDueAt(state,[read,listen]),undefined);
  state=p.recordReceptionAttempt(state,listen,attempt('two',later));
  assert.equal(p.receptionDueAt(state,[read,listen]),Date.parse(later)+7*86400000);
  const repeated=p.recordReceptionAttempt(state,listen,attempt('three','2026-09-18T10:00:00Z',33));
  assert.equal(repeated[listen].attempts[0].score,100);assert.equal(repeated[listen].attempts.at(-1).score,33);
  assert.equal(p.receptionResultLabel(repeated[listen].attempts.at(-1),'listening'),'Repeat practice');
  const concurrent=p.recordReceptionAttempt(state,listen,attempt('four','2026-09-18T11:00:00Z',67));
  assert.deepEqual(p.mergeReceptionProgress(repeated,concurrent),p.mergeReceptionProgress(concurrent,repeated));
  assert.equal(p.mergeReceptionProgress(repeated,concurrent)[listen].attempts.length,3);
  const invalid={[read]:{supportUsed:false,attempts:[{...attempt('bad',first),supportUsed:false,repeated:false,score:Infinity}]}};
  assert.equal(p.mergeReceptionProgress(invalid,{})[read].attempts.length,0);
  let many=state;for(let i=0;i<35;i++)many=p.recordReceptionAttempt(many,listen,attempt(`extra-${i}`,new Date(Date.parse(later)+(i+1)*60000).toISOString()));
  assert.equal(many[listen].attempts.length,20);assert.equal(many[listen].attempts[0].id,'two');
  const stored=mergeProgress('course',{chapters:{'a1-1-1':{reception:repeated}}},{chapters:{'a1-1-1':{completed:true,skillScores:{reading:100},reception:concurrent}}});
  assert.equal(stored.chapters['a1-1-1'].completed,true);assert.equal(stored.chapters['a1-1-1'].skillScores.reading,100);
  assert.equal(stored.chapters['a1-1-1'].reception[listen].attempts.at(-1).score,67);
 }finally{await vite.close();}
});
