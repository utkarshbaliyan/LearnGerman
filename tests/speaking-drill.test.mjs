import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
test("single-question audio checks give immediate corrections with safe retries and account quotas", async () => {
  const sqlite=new DatabaseSync(":memory:"); sqlite.exec(readFileSync("drizzle/0002_legal_nehzno.sql","utf8"));
  globalThis.__drillDb={prepare(sql){return {bind(...params){return {async first(){return sqlite.prepare(sql).get(...params)??null;},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...params).changes)}};}};}};}};
  const vite=await createServer({configFile:false,resolve:{alias:{"@":process.cwd()}},server:{middlewareMode:true,ws:false},plugins:[{name:"drill-fixtures",enforce:"pre",transform(code,id){if(id.endsWith("/speaking/drill/route.ts")) return code.replace('import { getD1 } from "@/db";', 'const getD1=async()=>globalThis.__drillDb;').replace('import { getAuthenticatedUser } from "@/app/lib/supabase-auth";', 'const getAuthenticatedUser=async r=>r.headers.get("x-test-user")?{id:r.headers.get("x-test-user")}:null;');}}]});
  const oldFetch=globalThis.fetch,oldKey=process.env.GROQ_API_KEY;process.env.GROQ_API_KEY="test-key";let calls=0,fail=false;
  globalThis.fetch=async(url,init)=>{calls++; if(fail)return Response.json({}, {status:503}); if(String(url).endsWith("/audio/transcriptions"))return Response.json({text:"Ich bist Ada."}); const input=JSON.parse(init.body);assert.match(input.messages[1].content,/Answer this one question/);return Response.json({choices:[{message:{content:JSON.stringify({overallScore:70,corrections:[{original:"Ich bist",corrected:"Ich bin",explanation:"Use bin with ich.",category:"verb-agreement",patternId:"verb-agreement",hint:"Check ich.",kind:"error",severity:"major",confidence:.98}],constructionEvidence:[]})}}]});};
  try{
    const api=await vite.ssrLoadModule("/app/api/tutor/speaking/drill/route.ts");let sequence=0;const id=()=>`drill-request-${String(++sequence).padStart(8,"0")}`;
    const post=(user,body)=>api.POST(new Request("http://localhost/api",{method:"POST",headers:{"content-type":"application/json","x-test-user":user,"x-tutor-owner":user},body:JSON.stringify({taskId:"a1-1-1",...body})}));
    const upload=(user,version,requestId,questionIndex=0,consent="true")=>{const form=new FormData();for(const[k,v]of Object.entries({taskId:"a1-1-1",version,requestId,questionIndex,consent}))form.set(k,String(v));form.set("audio",new File([new Uint8Array(200)],"answer.webm",{type:"audio/webm;codecs=opus"}));return api.POST(new Request("http://localhost/api",{method:"POST",headers:{"x-test-user":user,"x-tutor-owner":user},body:form}));};
    assert.equal((await api.POST(new Request("http://localhost/api",{method:"POST"}))).status,401);
    assert.equal((await upload("alice",0,id(),0,"false")).status,400);
    assert.equal((await upload("alice",0,id(),99)).status,400);assert.equal(calls,0);
    const requestId=id();let response=await upload("alice",0,requestId);assert.equal(response.status,200);let saved=await response.json();
    assert.equal(calls,2);assert.equal(saved.session.attempts[0].feedback.issues[0].corrected,"Ich bin");assert.equal(saved.session.attempts[0].transcriptConfirmed,false);
    assert.equal((await upload("alice",0,requestId)).status,200);assert.equal(calls,2,"Idempotent retry does not charge twice");
    assert.equal((await upload("alice",0,id())).status,409);
    response=await upload("alice",saved.version,id());saved=await response.json();assert.equal(saved.session.attempts[1].assistance,"correction");
    response=await post("alice",{action:"correct-transcript",version:saved.version,attemptId:saved.session.attempts[1].id,answer:"Ich bin Ada.",requestId:id()});assert.equal(response.status,200);saved=await response.json();assert.equal(saved.session.attempts.at(-1).transcriptConfirmed,true);
    assert.equal((await post("bob",{action:"correct-transcript",version:0,attemptId:requestId,answer:"Ich bin Ada.",requestId:id()})).status,400);
    fail=true;response=await upload("alice",saved.version,id());assert.equal(response.status,502);saved=await response.json();assert.equal(saved.session.attempts.at(-1).status,"failed");fail=false;
    sqlite.prepare("UPDATE tutor_quotas SET used=20 WHERE user_id='alice'").run();assert.equal((await upload("alice",saved.version,id())).status,429);
    const {deriveTutorMemory}=await vite.ssrLoadModule("/app/lib/tutor-memory.ts");assert.equal(deriveTutorMemory([{taskId:"speaking-drill:a1-1-1",attempt:saved.session.attempts[0]}],"A1").patterns.length,0,"Unconfirmed recognition cannot create a recurring learner error");
  }finally{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey;delete globalThis.__drillDb;await vite.close();sqlite.close();}
});
