import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
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
  const health=await(await fetch(`${base}/api/health`)).json();
  assert.equal(health.release,process.env.GITHUB_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),'AWS build must embed the checked commit');
  for(const path of ['/','/stories','/stories/reading-a1-01-v1','/grammar','/vocabulary','/books','/books/b1/zwischen-hoersaal-und-arbeitswelt/1','/account','/auth/reset-password','/privacy','/support']){
    const response=await fetch(base+path);assert.equal(response.status,200,path);
    assert.match(await response.text(),/LeseLaut/,path);
  }
  for(const path of ['/', '/stories', '/stories/a1', '/stories/a2', '/stories/b1', '/stories/b2', '/course', '/grammar/reference', '/grammar/lessons', '/grammar/lessons/a1-4-1', '/grammar/lessons/c1-1-1', '/books/a1/der-schluessel-im-blauen-korb/1']) {
    const response=await fetch(base+path), html=await response.text();
    assert.equal(response.status,200,path);
    const canonicals=[...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(canonicals,[`https://leselaut.com${path}`],`canonical ${path}`);
    assert.match(html,/<meta property="og:image" content="https:\/\/leselaut\.com\/social-card\.png"/,`preview ${path}`);
    assert.doesNotMatch(html,/<meta name="robots" content="[^"]*noindex/,`public ${path}`);
    if(path==='/stories') for(const level of ['a1','a2','b1','b2']) assert.match(html,new RegExp(`href="/stories/${level}"`));
    if(path==='/') assert.match(html,/<h1[^>]*>Learn German, one story at a time\.<\/h1>/);
  }
  for(const path of ['/account','/auth/confirm','/auth/reset-password','/active-learning','/practice/tutor']) {
    const html=await(await fetch(base+path)).text();
    assert.match(html,/<meta name="robots" content="[^"]*noindex/,`private ${path}`);
  }
  const sitemap=await fetch(base+'/sitemap.xml');assert.equal(sitemap.status,200);assert.match(sitemap.headers.get('content-type'),/xml/);
  const xml=await sitemap.text();assert.ok([...xml.matchAll(/<loc>/g)].length>700);assert.doesNotMatch(xml,/<loc>[^<]*(?:account|auth\/|cloudfront|chatgpt|\?)/);
  const robots=await fetch(base+'/robots.txt');assert.equal(robots.status,200);assert.match(await robots.text(),/Sitemap: https:\/\/leselaut.com\/sitemap.xml/);
  for(const [path,location] of [['/course/a1/chapter-1','/stories/reading-a1-01-v1'],['/stories?level=B2','/stories/b2']]) {
    const response=await fetch(base+path,{redirect:'manual'});assert.equal(response.status,308,path);assert.equal(response.headers.get('location'),'https://leselaut.com'+location);
  }
  assert.equal((await fetch(base+'/course/a1/no-such-chapter',{redirect:'manual'})).status,404);
  for(const path of ['/api/account','/api/progress','/api/account/export']){
    const response=await fetch(base+path);assert.equal(response.status,401,path);
    assert.match(response.headers.get('cache-control'),/private, no-store/);
  }
  assert.equal((await fetch(base+'/api/internal/migration',{method:'POST'})).status,404);
  assert.equal((await fetch(base+'/api/account/delete',{method:'POST'})).status,401);
  console.log('AWS standalone smoke passed: database readiness, public pages, SEO metadata, sitemap, redirects, protected APIs and disabled export.');
}catch(error){console.error(logs.replace(/(?:sk-|gsk_)[A-Za-z0-9_-]+/g,'[redacted]'));throw error;}
finally{
  child.kill('SIGTERM');await new Promise(r=>{if(child.exitCode!==null)r();else child.once('exit',r);});
  rmSync(directory,{recursive:true,force:true});
}
