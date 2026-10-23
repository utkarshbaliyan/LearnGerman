import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {applyMigrations} from '../deploy/aws/migrate.mjs';

const directory=mkdtempSync(join(tmpdir(),'leselaut-node-smoke-'));
const database=join(directory,'learners.sqlite');
applyMigrations(database,'drizzle');
const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));
const port=probe.address().port;await new Promise(r=>probe.close(r));
const child=spawn(process.execPath,['server.js'],{cwd:resolve('dist/standalone'),env:{...process.env,
  HOST:'127.0.0.1',PORT:String(port),LESELAUT_SQLITE_PATH:database,LESELAUT_MEDIA_BUCKET:'smoke-test-no-network'},stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',c=>logs+=c);child.stderr.on('data',c=>logs+=c);
const base=`http://127.0.0.1:${port}`;
try{
  let ready=false;
  for(let i=0;i<60;i++){
    if(child.exitCode!==null)throw new Error('Standalone server exited before readiness.');
    try{if((await fetch(`${base}/api/health`)).status===200){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,500));
  }
  assert.ok(ready,'Standalone AWS server must connect to its SQLite database.');
  for(const path of ['/','/stories','/stories/reading-a1-01-v1','/grammar','/vocabulary','/books','/books/b1/zwischen-hoersaal-und-arbeitswelt/1']){
    const response=await fetch(base+path);assert.equal(response.status,200,path);
    assert.match(await response.text(),/LeseLaut/,path);
  }
  for(const path of ['/api/account','/api/progress','/api/account/export']){
    const response=await fetch(base+path);assert.equal(response.status,401,path);
    assert.match(response.headers.get('cache-control'),/private, no-store/);
  }
  assert.equal((await fetch(base+'/api/internal/migration',{method:'POST'})).status,404);
  console.log('AWS standalone smoke passed: database readiness, seven pages, protected APIs and disabled export.');
}catch(error){console.error(logs.replace(/(?:sk-|gsk_)[A-Za-z0-9_-]+/g,'[redacted]'));throw error;}
finally{
  child.kill('SIGTERM');await new Promise(r=>{if(child.exitCode!==null)r();else child.once('exit',r);});
  rmSync(directory,{recursive:true,force:true});
}
