import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

test('Active Learning has a complete versioned course, account-owned progress and beginner-friendly checks', async () => {
 const sqlite = new DatabaseSync(':memory:'); sqlite.exec(readFileSync('drizzle/0002_legal_nehzno.sql','utf8'));
 globalThis.__activeDb = { prepare(sql) { return {bind(...params) { return {
  async first() { return sqlite.prepare(sql).get(...params) ?? null; }, async all() { return {results:sqlite.prepare(sql).all(...params)}; },
  async run() { return {meta:{changes:Number(sqlite.prepare(sql).run(...params).changes)}}; }
 }; }}; }};
 const vite = await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false},plugins:[{name:'active-fixtures',enforce:'pre',transform(code,id) {
  if (/\/app\/api\/(tutor\/writing|tutor\/speaking\/drill|active-learning\/progress)\/route.ts$/.test(id)) return code.replace(/import \{ getD1 \} from ['"]@\/db['"];?/, 'const getD1 = async () => globalThis.__activeDb;').replace(/import \{ getAuthenticatedUser \} from ['"]@\/app\/lib\/supabase-auth['"];?/, "const getAuthenticatedUser = async r => r.headers.get('x-test-user') ? {id:r.headers.get('x-test-user')} : null;");
 }}]});
 const oldFetch=globalThis.fetch, oldKey=process.env.GROQ_API_KEY; process.env.GROQ_API_KEY='test-key'; let calls=0;
 globalThis.fetch=async (url,init) => {
  calls++;
  if (String(url).endsWith('/audio/transcriptions')) return Response.json({text:'Ich bin Bo.'});
  const input=JSON.parse(init.body);
  if (Array.isArray(input.messages[1].content)) return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({text:'Bo',readable:true,uncertain:false})}}]});
  assert.match(JSON.stringify(input.messages),/Active Learning/);
  assert.doesNotMatch(input.messages[1].content,/FORGED RUBRIC/);
  return Response.json({choices:[{message:{content:JSON.stringify({overallScore:90,corrections:[],constructionEvidence:[],responseDevelopment:{sufficient:true,explanation:"The answer covers the task.",nextQuestions:[]}})}}]});
 };
 try {
  const {activeLessons,activeReviews,activeTasks,activeTask} = await vite.ssrLoadModule('/app/lib/active-learning.ts');
  const {getWritingTask} = await vite.ssrLoadModule('/app/lib/writing-task.ts');
  const {getSpeakingMission} = await vite.ssrLoadModule('/app/lib/speaking-missions.ts');
  const {reviewDueAt} = await vite.ssrLoadModule('/app/lib/active-progress.ts');
  assert.equal(activeLessons.length,144);assert.equal(activeReviews.length,36);assert.equal(new Set(activeTasks.map(x=>x.id)).size,181);
  for(const level of ['A1','A2','B1']) assert.equal(activeLessons.filter(x=>x.level===level).length,48);
  for(const task of activeTasks) {assert.ok(getWritingTask(task.id));assert.ok(getSpeakingMission(task.id));assert.ok(task.question.length>8);assert.ok(task.example.length>8);assert.ok(task.writing_prompt.length>15);}
  const taskId=activeLessons[0].id;
  assert.deepEqual(activeTask(taskId).questions,['Wie heißt du?']);assert.equal(activeTask(taskId).writingSize,'One short sentence');assert.equal(activeTask('active-a1-m99-l01-v1'),null);
  const writing=await vite.ssrLoadModule('/app/api/tutor/writing/route.ts'), speaking=await vite.ssrLoadModule('/app/api/tutor/speaking/drill/route.ts'), summary=await vite.ssrLoadModule('/app/api/active-learning/progress/route.ts');
  const getProgress=user=>summary.GET(new Request('http://local/api/active-learning/progress',{headers:user?{'x-test-user':user}:{}}));
  const post=data=>writing.POST(new Request('http://local/api/tutor/writing',{method:'POST',headers:{'content-type':'application/json','x-test-user':'alice','x-writing-owner':'alice'},body:JSON.stringify({taskId,...data})}));
  assert.equal((await getProgress()).status,401);
  let res=await post({action:'draft',version:0,answer:'Bo'});assert.equal(res.status,200);let saved=await res.json();
  assert.deepEqual((await (await getProgress('alice')).json()).progress,{},'Drafts do not complete tasks');
  const request={action:'check',version:saved.version,answer:'Bo',requestId:'active-request-0001',rubric:'FORGED RUBRIC'};
  res=await post(request);assert.equal(res.status,200);saved=await res.json();assert.equal(saved.session.attempts[0].revealed,true);assert.equal(saved.session.attempts[0].assistance,"hint","Starter teaching is guided practice");
  assert.equal((await post(request)).status,200);assert.equal(calls,1,'Network retry does not double charge');
  let progress=(await (await getProgress('alice')).json()).progress;assert.equal(progress[taskId].writing.checked,true);assert.equal(progress[taskId].speaking,undefined);
  assert.deepEqual((await (await getProgress('bob')).json()).progress,{});
  const form=new FormData();for(const[k,v] of Object.entries({taskId,version:0,questionIndex:0,requestId:'active-speaking-0001',consent:'true'}))form.set(k,String(v));form.set('audio',new File([new Uint8Array(200)],'answer.webm',{type:'audio/webm'}));
  res=await speaking.POST(new Request('http://local/api/tutor/speaking/drill',{method:'POST',headers:{'x-test-user':'alice','x-tutor-owner':'alice'},body:form}));assert.equal(res.status,200);
  progress=(await (await getProgress('alice')).json()).progress;assert.equal(progress[taskId].speaking.checked,true);assert.equal(calls,3);
  assert.equal(reviewDueAt(activeReviews[0].id,progress),null);
  const start=Date.UTC(2026,8,1);
  for(const lesson of activeLessons.slice(0,4)) progress[lesson.id]={writing:{checked:true,firstCheckedAt:new Date(start).toISOString(),updatedAt:new Date(start+999).toISOString()},speaking:{checked:true,firstCheckedAt:new Date(start).toISOString(),updatedAt:new Date(start+999).toISOString()}};
  assert.equal(reviewDueAt(activeReviews[0].id,progress),start+7*86400000,'Retried practice does not postpone the first delayed check');
  res=await post({action:'delete',version:saved.version});assert.equal(res.status,200);progress=(await (await getProgress('alice')).json()).progress;assert.equal(progress[taskId].writing,undefined);assert.equal(progress[taskId].speaking.checked,true,'Deleting writing leaves speaking intact');
  res=await post({taskId:'active-a1-m01-check-v1',action:'check',version:0,answer:'Hallo, ich heiße Bo. Ich wohne in Bonn.',requestId:'starter-check-00001'});
  assert.equal(res.status,200);const fresh=await res.json();
  assert.equal(fresh.session.attempts[0].assistance,'independent');
  assert.equal((await (await getProgress('alice')).json()).progress['active-a1-m01-check-v1'].writing.checked,true);
  const b1=activeLessons.find(row=>row.level==='B1').id;
  res=await post({taskId:b1,action:'check',version:0,answer:'Ich war in Berlin.',requestId:'active-b1-brief-0001'});assert.equal(res.status,200);let b1record=await res.json();
  assert.equal(b1record.session.attempts[0].feedback.development.sufficient,false,'One-line B1 does not pass even if provider over-praises it');
  assert.ok(b1record.session.attempts[0].feedback.development.nextQuestions.length);
  assert.equal((await (await getProgress('alice')).json()).progress[b1].writing.checked,false);
  const developed='Letzten Sommer bin ich mit meiner Schwester nach Berlin gefahren. Wir haben dort drei Tage verbracht und ein interessantes Museum besucht. Besonders gut hat mir der gemeinsame Spaziergang gefallen, weil wir endlich Zeit zum Reden hatten. Beim nächsten Mal möchte ich länger bleiben und auch Freunde besuchen.';
  res=await post({taskId:b1,action:'check',version:b1record.version,answer:developed,requestId:'active-b1-full-00001'});b1record=await res.json();assert.equal(res.status,200);
  assert.equal((await (await getProgress('alice')).json()).progress[b1].writing.checked,true);
  res=await post({taskId:b1,action:'check',version:b1record.version,answer:'Es war schön.',requestId:'active-b1-brief-0002'});assert.equal(res.status,200);
  assert.equal((await (await getProgress('alice')).json()).progress[b1].writing.checked,false,'Latest insufficient response cannot borrow an earlier passing result');
  const photo=new FormData();for(const[k,v] of Object.entries({taskId,version:(await (await writing.GET(new Request(`http://local/api/tutor/writing?taskId=${taskId}`,{headers:{'x-test-user':'alice'}}))).json()).version,requestId:'active-photo-00001',consent:'true'}))photo.set(k,String(v));photo.set('photo',new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKbcAAAAASUVORK5CYII=','base64')],'assignment.png',{type:'image/png'}));
  res=await writing.POST(new Request('http://local/api/tutor/writing',{method:'POST',headers:{'x-test-user':'alice','x-writing-owner':'alice'},body:photo}));assert.equal(res.status,200);saved=await res.json();
  res=await post({action:'confirm-photo',version:saved.version,photoId:'active-photo-00001',answer:'Bo'});assert.equal(res.status,200);assert.equal((await res.json()).session.draft,'Bo','Short beginner photo text is accepted');
 } finally {globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey;delete globalThis.__activeDb;await vite.close();sqlite.close();}
});
