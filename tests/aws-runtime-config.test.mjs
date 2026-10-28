import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';

const script=fileURLToPath(new URL('../deploy/aws/configure-runtime.mjs',import.meta.url));

async function configure(t,{previous,local='',settings={},args=[]}={}) {
  const directory=await mkdtemp(join(tmpdir(),'leselaut-runtime-test-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  await mkdir(join(directory,'deploy/aws'),{recursive:true});
  await writeFile(join(directory,'deploy/aws/deployment.json'),JSON.stringify({region:'ap-south-1',MediaBucket:'fixture-media'}));
  await writeFile(join(directory,'.env.local'),local,{mode:0o600});
  const requests=[];
  const server=createServer(async(request,response)=>{
    let body='';for await(const chunk of request)body+=chunk;
    const operation=request.headers['x-amz-target']?.split('.').at(-1);
    requests.push({operation,input:JSON.parse(body)});
    response.setHeader('content-type','application/x-amz-json-1.1');
    if(operation==='GetParameter'){
      if(previous===undefined){response.statusCode=400;response.end(JSON.stringify({__type:'ParameterNotFound',message:'fixture'}));}
      else response.end(JSON.stringify({Parameter:{Value:previous,Version:4}}));
    }else if(operation==='PutParameter')response.end(JSON.stringify({Version:5,Tier:'Standard'}));
    else {response.statusCode=400;response.end('{}');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const endpoint=`http://127.0.0.1:${server.address().port}`;
  const child=spawn(process.execPath,[script,...args],{cwd:directory,env:{...process.env,
    AWS_ACCESS_KEY_ID:'fixture-access-key',AWS_SECRET_ACCESS_KEY:'fixture-secret-key',AWS_SESSION_TOKEN:'',
    AWS_ENDPOINT_URL:endpoint,AWS_ENDPOINT_URL_SSM:endpoint,AWS_EC2_METADATA_DISABLED:'true',AWS_MAX_ATTEMPTS:'1'}});
  let output='';child.stdout.on('data',value=>{output+=value;});child.stderr.on('data',value=>{output+=value;});
  child.stdin.end(JSON.stringify(settings));
  const status=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve);});
  assert.doesNotMatch(output,/fixture-new-server-secret|fixture-revoked-ai-key/,'runtime values must never reach diagnostics');
  return {status,output,requests};
}

test('disabled AI config removes revoked credentials while replacing the server key and preserving production flags',async t=>{
  const result=await configure(t,{previous:'LESELAUT_AI_ENABLED="0"\nLESELAUT_RUM_ENABLED="0"\nLESELAUT_AI_DAILY_CALL_LIMIT="200"\nOPENAI_API_KEY="fixture-revoked-ai-key"\nGROQ_API_KEY="fixture-revoked-ai-key"\nSUPABASE_SECRET_KEY="fixture-old-server-secret"\n',
    local:'SUPABASE_SECRET_KEY="fixture-new-server-secret"\n',args:['--enable-writes']});
  assert.equal(result.status,0,result.output);
  const writes=result.requests.filter(x=>x.operation==='PutParameter');assert.equal(writes.length,1);
  assert.equal(writes[0].input.Type,'SecureString');assert.equal(writes[0].input.Overwrite,true);
  const values=parseEnv(writes[0].input.Value);
  assert.equal(values.OPENAI_API_KEY,undefined);assert.equal(values.GROQ_API_KEY,undefined);
  assert.equal(values.SUPABASE_SECRET_KEY,'fixture-new-server-secret');
  assert.equal(values.LESELAUT_AI_ENABLED,'0');assert.equal(values.LESELAUT_RUM_ENABLED,'0');
  assert.equal(values.LESELAUT_READ_ONLY,'0');assert.equal(values.LESELAUT_AI_DAILY_CALL_LIMIT,'200');
});

test('new runtime configuration defaults AI and monitoring off without requiring provider credentials',async t=>{
  const result=await configure(t);assert.equal(result.status,0,result.output);
  const values=parseEnv(result.requests.find(x=>x.operation==='PutParameter').input.Value);
  assert.equal(values.LESELAUT_AI_ENABLED,'0');assert.equal(values.LESELAUT_RUM_ENABLED,'0');
  assert.equal(values.LESELAUT_READ_ONLY,'1');assert.equal(values.OPENAI_API_KEY,undefined);
});

test('explicit AI activation without local provider credentials cannot write the runtime',async t=>{
  const result=await configure(t,{settings:{LESELAUT_AI_ENABLED:'1'}});
  assert.equal(result.status,1);assert.equal(result.requests.filter(x=>x.operation==='PutParameter').length,0);
});
