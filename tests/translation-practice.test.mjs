import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const root = process.cwd();
function server(plugins=[]) { return createServer({configFile:false,resolve:{alias:{'@':root}},server:{middlewareMode:true,ws:false},plugins}); }

test('translation validation accepts alternatives, rejects invented errors and maps numbered handwriting', async()=>{
 const vite=await server();try{
  const p=await vite.ssrLoadModule('/app/lib/translation-practice.ts');
  assert.deepEqual(p.TRANSLATION_LEVELS,['A1','A2','B1','B2','C1']);
  assert.deepEqual(p.generatedSentences({sentences:['I live in Berlin.']},'A1',1),['I live in Berlin.']);
  assert.throws(()=>p.generatedSentences({sentences:['Hello there.','Hello there!']},'A1',2));
  assert.throws(()=>p.generatedSentences({sentences:['one two three four five six seven eight nine ten eleven twelve thirteen.']},'A1',1));
  const correct={number:1,verdict:'correct',correctTranslation:'Ich wohne in Berlin.',explanation:'Both wohnen and leben work here.',corrections:[]};
  assert.equal(p.checkedTranslations({feedback:[correct]},['Ich lebe in Berlin.'])[0].verdict,'correct');
  assert.throws(()=>p.checkedTranslations({feedback:[{...correct,verdict:'needs_work',corrections:[{original:'forged',corrected:'bin',explanation:'Test',category:'grammar',kind:'error'}]}]},['Ich lebe in Berlin.']));
  assert.throws(()=>p.checkedTranslations({feedback:[{...correct,verdict:'needs_work',corrections:[]}]},['Ich lebe in Berlin.']));
  assert.throws(()=>p.checkedTranslations({feedback:[correct,correct]},['Ich lebe in Berlin.','Ich wohne hier.']));
  assert.deepEqual(p.photoAnswers('1. Ich wohne\nin Berlin.\n2. Sie kauft Brot.',2),['Ich wohne\nin Berlin.','Sie kauft Brot.']);
  assert.deepEqual(p.photoAnswers('Ich wohne in Berlin.',1),['Ich wohne in Berlin.']);
  assert.throws(()=>p.photoAnswers('1. Ich [unclear].\n2. Sie kauft Brot.',2));
  assert.throws(()=>p.photoAnswers('2. Sie kauft Brot.\n1. Ich wohne hier.',2));
  assert.throws(()=>p.photoAnswers('Unnumbered text\n1. Hallo.\n2. Guten Tag.',2));
 }finally{await vite.close();}
});

test('translation API saves account-owned exercises, checks, reviewed imports and idempotent quota reservations',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync('drizzle/0002_legal_nehzno.sql','utf8'));
 globalThis.__translationDb={prepare(sql){return{bind(...args){return{async first(){return db.prepare(sql).get(...args)??null;},async all(){return{results:db.prepare(sql).all(...args)};},async run(){return{meta:{changes:Number(db.prepare(sql).run(...args).changes)}};}};}};}};
 const vite=await server([{name:'translation-test-auth',enforce:'pre',transform(code,id){if(id.endsWith('/app/api/active-learning/translation/route.ts'))return code.replace("import { getD1 } from '@/db';","const getD1=async()=>globalThis.__translationDb;").replace("import { getAuthenticatedUser } from '@/app/lib/supabase-auth';","const getAuthenticatedUser=async r=>r.headers.get('x-test-user')?{id:r.headers.get('x-test-user')}:null;");}}]);
 const oldFetch=globalThis.fetch,oldKey=process.env.GROQ_API_KEY;process.env.GROQ_API_KEY='test-key';let calls=0,held=null,badFeedback=false;
 const seen=[];globalThis.fetch=async(url,init)=>{
  calls++;
  if(String(url).endsWith('/audio/transcriptions'))return Response.json({text:'Ich lebe in Berlin.'});
  const input=JSON.parse(init.body),data=input.messages[1].content;
  if(Array.isArray(data))return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({text:'1. Ich wohne in Berlin.\n2. Sie kauft Brot.',readable:true,uncertain:false})}}]});
  const task=JSON.parse(data);seen.push({instruction:input.messages[0].content,task});
  if(held){const gate=held;held=null;await gate;}
  let result;
  if(task.count)result={sentences:Array.from({length:task.count},(_,i)=>i===0?'I live in Berlin.':i===1?'She buys bread.':`We visit the museum on day ${i+1}.`)};
  else result={feedback:task.items.map(item=>({number:item.number,verdict:item.german==='Ich wohne in Berlin.'?'correct':item.german==='Ich lebe in Berlin.'?'correct':'needs_work',correctTranslation:item.number===1?'Ich wohne in Berlin.':'Sie kauft Brot.',explanation:item.german.startsWith('Ich')?'Your wording conveys the English meaning.':'Use the verb ending for sie.',corrections:item.german.startsWith('Ich')?[]:[{original:badFeedback?'invented source':item.german,corrected:'Sie kauft Brot.',explanation:'Singular sie takes kauft.',category:'grammar',kind:'error'}]}))};
  return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(result)}}]});
 };
 try{
  const api=await vite.ssrLoadModule('/app/api/active-learning/translation/route.ts');
  const post=(body,user='alice',owner=user)=>api.POST(new Request('http://local/api/active-learning/translation',{method:'POST',headers:{'content-type':'application/json',...(user?{'x-test-user':user,'x-translation-owner':owner}:{})},body:JSON.stringify(body)}));
  const get=(id,user='alice')=>api.GET(new Request('http://local/api/active-learning/translation'+(id?'?exerciseId='+id:''),{headers:user?{'x-test-user':user}:{}}));
  const quota=user=>db.prepare('SELECT used FROM tutor_quotas WHERE user_id=?').get(user)?.used??0;
  assert.equal((await post({action:'generate',level:'A1',count:2,requestId:'generate-first-0001'},null)).status,401);
  assert.equal((await get(null,null)).status,401);assert.equal(calls,0);
  for(const count of [0,13,1.5])assert.equal((await post({action:'generate',level:'A1',count,requestId:'invalid-count-0001'})).status,400);
  assert.equal((await post({action:'generate',level:'C2',count:1,requestId:'invalid-level-0001'})).status,400);assert.equal(calls,0);
  const legacy=JSON.stringify({draft:'preserve my old work',attempts:[]});db.prepare('INSERT INTO tutor_sessions(user_id,task_id,data,version,updated_at) VALUES(?,?,?,?,?)').run('alice','active-a1-m01-l01-v1',legacy,1,new Date().toISOString());
  const generated={action:'generate',level:'A1',count:2,requestId:'generate-first-0001'};
  let r=await post(generated);assert.equal(r.status,200);let rec=await r.json();const id=rec.exerciseId;
  assert.deepEqual(rec.session.sentences,['I live in Berlin.','She buys bread.']);assert.equal(quota('alice'),1);
  assert.equal((await post(generated)).status,200);assert.equal(calls,1);assert.equal(quota('alice'),1);
  assert.equal((await post({...generated,count:1})).status,409);
  assert.equal((await get(id,'bob')).status,404);assert.equal((await get(null,'bob')).status,200);assert.equal((await (await get(null,'bob')).json()).session,undefined);
  assert.equal((await post({action:'draft',exerciseId:id,version:rec.version,answers:['Ich lebe in Berlin.','Sie kaufen Brot.']},'alice','bob')).status,409);
  assert.equal((await post({action:'draft',exerciseId:id,version:0,answers:['Ich lebe in Berlin.','Sie kaufen Brot.']})).status,409);
  r=await post({action:'draft',exerciseId:id,version:rec.version,answers:['Ich lebe in Berlin.','Sie kaufen Brot.']});rec=await r.json();assert.equal(quota('alice'),1);
  const check={action:'check',exerciseId:id,version:rec.version,answers:rec.session.answers,requestId:'check-first-00001',level:'C1',sentences:['FORGED ENGLISH'],rubric:'FORGED RUBRIC'};
  r=await post(check);assert.equal(r.status,200);rec=await r.json();assert.equal(quota('alice'),2);assert.equal(rec.session.checks[0].feedback[0].verdict,'correct');assert.equal(rec.session.checks[0].feedback[1].verdict,'needs_work');
  assert.match(seen.at(-1).instruction,/CEFR A1/);assert.equal(seen.at(-1).task.items[0].english,'I live in Berlin.');assert.doesNotMatch(JSON.stringify(seen.at(-1)),/FORGED/);
  assert.equal((await post(check)).status,200);assert.equal(quota('alice'),2);assert.equal(calls,2);
  assert.equal((await post({...check,version:rec.version,requestId:'check-same-000002'})).status,200);assert.equal(calls,2,'Identical answers reuse feedback');
  assert.equal((await post({...check,answers:['Changed','Text']})).status,409);
  badFeedback=true;r=await post({...check,version:rec.version,answers:['Ich lebe in Berlin.','Sie kauf Brot.'],requestId:'check-invalid-001'});assert.equal(r.status,502);rec=await r.json();assert.equal(rec.session.checks.length,1);assert.equal(rec.session.operations.at(-1).status,'failed');badFeedback=false;
  const upload=async(action,requestId,file,extras={})=>{const form=new FormData();for(const[k,v]of Object.entries({action,exerciseId:id,version:rec.version,requestId,consent:'true',sentenceIndex:0,...extras}))form.set(k,String(v));form.set(action==='photo'?'photo':'audio',file);return api.POST(new Request('http://local/api/active-learning/translation',{method:'POST',headers:{'x-test-user':'alice','x-translation-owner':'alice'},body:form}));};
  const audio=new File([new Uint8Array(200)],'answer.webm',{type:'audio/webm'});
  assert.equal((await upload('speech','speech-consent-01',audio,{consent:'false'})).status,400);
  assert.equal((await upload('speech','speech-invalid-01',audio,{sentenceIndex:12})).status,400);
  r=await upload('speech','speech-valid-0001',audio);assert.equal(r.status,200);rec=await r.json();assert.equal(rec.session.operations.at(-1).text,'Ich lebe in Berlin.');assert.equal(rec.session.checks.length,1,'Transcription does not grade unreviewed audio');
  const before=calls;r=await upload('speech','speech-valid-0001',audio);assert.equal(r.status,200);assert.equal(calls,before);
  const photo=new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKbcAAAAASUVORK5CYII=','base64')],'answers.png',{type:'image/png'});
  assert.equal((await upload('photo','photo-bad-file-01',audio)).status,400);
  r=await upload('photo','photo-valid-0001',photo);assert.equal(r.status,200);rec=await r.json();assert.equal(rec.session.operations.at(-1).uncertain,false);assert.deepEqual(rec.session.answers,['Ich lebe in Berlin.','Sie kauf Brot.'],'Photo extraction cannot overwrite answers before confirmation');
  r=await post({action:'draft',exerciseId:id,version:rec.version,photoId:'photo-valid-0001',answers:['Ich wohne in Berlin.','Sie kauft Brot.']});assert.equal(r.status,200);rec=await r.json();assert.ok(rec.session.operations.at(-1).confirmedAt);
  assert.equal(db.prepare('SELECT data FROM tutor_sessions WHERE user_id=? AND task_id=?').get('alice','active-a1-m01-l01-v1').data,legacy);
  let release;held=new Promise(resolve=>release=resolve);const concurrent={action:'generate',level:'B2',count:1,requestId:'generate-pending-01'};const first=post(concurrent);
  while(!seen.some(x=>x.task.seed==='generate-pending-01'))await new Promise(r=>setTimeout(r,1));
  assert.equal((await post(concurrent)).status,409);release();assert.equal((await first).status,200);
  const staleId='translation-generate-stale-01';const stale={...rec.session,level:'B1',count:1,sentences:[],answers:[''],operations:[{id:'generate-stale-01',action:'generate',fingerprint:await (async()=>{const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({action:'generate',level:'B1',count:1})));return Buffer.from(bytes).toString('hex');})(),status:'pending',createdAt:new Date(Date.now()-150000).toISOString()}],checks:[]};db.prepare('INSERT INTO tutor_sessions(user_id,task_id,data,version,updated_at) VALUES(?,?,?,?,?)').run('alice',staleId,JSON.stringify(stale),1,new Date().toISOString());
  r=await post({action:'generate',level:'B1',count:1,requestId:'generate-stale-01'});assert.equal(r.status,502);assert.equal((await r.json()).session.operations[0].status,'failed');
  db.prepare('INSERT INTO tutor_quotas(user_id,day,used) VALUES(?,?,19)').run('limit',new Date().toISOString().slice(0,10));
  const limited=await Promise.all([post({action:'generate',level:'C1',count:12,requestId:'quota-last-one-01'},'limit'),post({action:'generate',level:'A2',count:1,requestId:'quota-overflow-01'},'limit')]);assert.deepEqual(limited.map(r=>r.status).sort(),[200,429]);assert.equal(quota('limit'),20);
  const latest=await (await get()).json();assert.ok(latest.recent.length);assert.equal(latest.recent.every(x=>x.exerciseId.startsWith('translation-')),true);
 }finally{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey;delete globalThis.__translationDb;await vite.close();db.close();}
});
