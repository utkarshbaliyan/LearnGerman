import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,copyFileSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const publicHeaders=JSON.parse(readFileSync('deploy/security-headers.json','utf8'));
for(const scenario of ['superseded','ssm-failure','missing-homepage-headers','missing-analytics-guard','success'])test(`deployment orchestration: ${scenario}`,async t=>{
  const root=mkdtempSync(join(tmpdir(),'leselaut-deploy-test-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  for(const dir of ['scripts','deploy/aws','bin'])mkdirSync(join(root,dir),{recursive:true});
  for(const file of ['deploy-aws.mjs','verify-public.mjs'])copyFileSync(`scripts/${file}`,join(root,'scripts',file));
  const release='b'.repeat(40), states=[], calls=[];
  const server=createServer(async(req,res)=>{
    calls.push(req.url);
    let body='';for await(const chunk of req)body+=chunk;
    const json=(value,status=200,headers={})=>{res.writeHead(status,{'content-type':'application/json',...headers});res.end(JSON.stringify(value));};
    if(req.url.endsWith('/git/ref/heads/main'))return json({object:{sha:scenario==='superseded'?'a'.repeat(40):release}});
    if(req.url.endsWith('/deployments')){
      assert.deepEqual(JSON.parse(body).required_contexts,['check-and-deploy']);
      assert.equal(JSON.parse(body).ref,release);
      return json({id:17});
    }
    if(req.url.endsWith('/statuses')){states.push(JSON.parse(body).state);return json({id:states.length});}
    if(req.url==='/api/health')return json({status:'ok',release},200,{'cache-control':'no-store'});
    if(req.url==='/'){
      const headers={'content-type':'text/html; charset=utf-8'};
      if(scenario!=='missing-homepage-headers')Object.assign(headers,publicHeaders);
      res.writeHead(200,headers);return res.end('<title>LeseLaut</title><script src="/assets/app.js"></script>'+(scenario==='missing-analytics-guard'?'':'<script id="leselaut-analytics-boundary" src="/analytics-boundary.js"></script>'));
    }
    if(['/assets/app.js','/analytics-boundary.js'].includes(req.url)){res.writeHead(200,{'content-type':'text/javascript'});return res.end();}
    if(req.url==='/account')return res.end('Sign in');
    if(req.url==='/api/auth/config'||req.url==='/api/telemetry/config')return json({enabled:false});
    if(['/api/account','/api/progress'].includes(req.url))return json({},401,{'cache-control':'private, no-store'});
    if(req.url.startsWith('/audio/')||req.url.startsWith('/media/')){res.writeHead(206,{'content-type':'audio/mp4','content-range':'bytes 0-31/1024'});return res.end(Buffer.alloc(32));}
    res.writeHead(404);res.end();
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const base=`http://127.0.0.1:${server.address().port}`;
  writeFileSync(join(root,'deploy/aws/deployment.json'),JSON.stringify({region:'test',ProductionUrl:base,SiteUrl:base,ArtifactBucket:'test',DeployDocument:'test',InstanceId:'test'}));
  writeFileSync(join(root,'bin/aws'),`#!/bin/bash\nif [[ "$1 $2" == 'ssm send-command' ]]; then echo '{"Command":{"CommandId":"fixture-command"}}'; elif [[ "$1 $2" == 'ssm get-command-invocation' ]]; then echo '{"Status":"${scenario==='ssm-failure'?'Failed':'Success'}"}'; fi\n`,{mode:0o755});
  const child=spawn(process.execPath,['scripts/deploy-aws.mjs'],{cwd:root,env:{...process.env,
    PATH:`${join(root,'bin')}:${process.env.PATH}`,GITHUB_SHA:release,GITHUB_REPOSITORY:'fixture/repo',GITHUB_RUN_ID:'1',
    GITHUB_API_URL:base,GH_TOKEN:'fixture-secret-must-not-be-printed',LESELAUT_RELEASE_ARCHIVE:'checked.tgz',
    GITHUB_STEP_SUMMARY:join(root,'summary.md')},stdio:['ignore','pipe','pipe']});
  let logs='';child.stdout.on('data',chunk=>logs+=chunk);child.stderr.on('data',chunk=>logs+=chunk);
  const code=await new Promise(resolve=>child.once('exit',resolve));
  assert.doesNotMatch(logs,/fixture-secret-must-not-be-printed/);
  assert.equal(code,['ssm-failure','missing-homepage-headers','missing-analytics-guard'].includes(scenario)?1:0,logs);
  assert.deepEqual(states,scenario==='superseded'?[]:['in_progress',scenario==='success'?'success':'failure']);
  if(scenario==='superseded'){assert.equal(calls.length,1);assert.match(logs,/No deployment started/);}
  if(scenario==='ssm-failure'){assert.ok(!calls.includes('/api/health'));assert.match(logs,/fixture-command/);}
  if(scenario==='missing-homepage-headers'){assert.ok(calls.includes('/api/health'));assert.match(logs,/Homepage framing protection/);}
  if(scenario==='missing-analytics-guard'){assert.match(logs,/Consent navigation guard/);}
  if(scenario==='success')assert.match(logs,/Production verified/);
});
