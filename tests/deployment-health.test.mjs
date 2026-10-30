import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyPublic,verifyWithRetry} from '../scripts/verify-public.mjs';
const release='b'.repeat(40);
const homepage='<title>LeseLaut</title><script id="leselaut-analytics-boundary" src="/analytics-boundary.js"></script><script src="/assets/app.js"></script>';
const homepageHeaders={'x-frame-options':'DENY','x-content-type-options':'nosniff','content-security-policy':"frame-ancestors 'none'",'referrer-policy':'strict-origin'};
function fixture(change) {
  const responses=new Map([
    ['/api/health',()=>Response.json({status:'ok',release},{headers:{'cache-control':'no-store'}})],
    ['/',()=>new Response(homepage,{headers:homepageHeaders})],
    ['/assets/app.js',()=>new Response(null,{headers:{'content-type':'text/javascript'}})],
    ['/analytics-boundary.js',()=>new Response(null,{headers:{'content-type':'text/javascript'}})],
    ['/account',()=>new Response('Sign in')],
    ['/api/auth/config',()=>Response.json({enabled:false})],
    ['/api/account',()=>new Response(null,{status:401,headers:{'cache-control':'private, no-store'}})],
    ['/api/progress',()=>new Response(null,{status:401,headers:{'cache-control':'private, no-store'}})],
    ['/api/telemetry/config',()=>Response.json({enabled:false})],
    ['/audio/reception/reception-a1-01-v1-listening-guided.m4a',()=>new Response(new Uint8Array(32),{status:206,headers:{'content-type':'audio/mp4','content-range':'bytes 0-31/1024'}})],
  ]);
  responses.set('/media/books/zwischen-hoersaal-und-arbeitswelt/p001-page-50210d2788be-e23a3341-qwen-dialogue-opus16-814f62d9954c.webm',responses.get('/audio/reception/reception-a1-01-v1-listening-guided.m4a'));
  change?.(responses);
  return async (url,options)=>{
    assert.equal(new URL(url).origin,'https://fixture.test');
    assert.ok(!options.method||options.method==='HEAD','Probes only read production');
    assert.ok(responses.has(new URL(url).pathname),`Unexpected request ${url}`);
    return responses.get(new URL(url).pathname)();
  };
}
test('public verification covers release identity, assets, auth boundary, disabled monitoring and audio ranges',async()=>{
  await verifyPublic('https://fixture.test',release,{request:fixture()});
});
for(const [header,message] of [
  ['x-frame-options','Homepage framing protection'],
  ['x-content-type-options','Homepage content sniffing protection'],
  ['content-security-policy','Homepage CSP framing protection'],
  ['referrer-policy','Private paths must not leak in referrers'],
])test(`public verification rejects a homepage missing ${header}`,async()=>{
  const headers={...homepageHeaders};delete headers[header];
  await assert.rejects(verifyPublic('https://fixture.test',release,{request:fixture(map=>map.set('/',()=>new Response(homepage,{headers})))}),new RegExp(message));
});
for(const [name,path,response] of [
  ['old release','/api/health',()=>Response.json({status:'ok',release:'a'.repeat(40)},{headers:{'cache-control':'no-store'}})],
  ['database unavailable','/api/health',()=>new Response(null,{status:503})],
  ['missing built asset','/assets/app.js',()=>new Response(null,{status:404})],
  ['missing privacy guard asset','/analytics-boundary.js',()=>new Response(null,{status:404})],
  ['missing privacy guard','/',()=>new Response('<title>LeseLaut</title><script src="/assets/app.js"></script>',{headers:homepageHeaders})],
  ['injected beacon before consent','/',()=>new Response(homepage+'<script src="https://static.cloudflareinsights.com/beacon.min.js"></script>',{headers:homepageHeaders})],
  ['broken sign-in page','/account',()=>new Response(null,{status:500})],
  ['unprotected progress','/api/progress',()=>new Response(null,{status:200})],
  ['paid monitoring enabled','/api/telemetry/config',()=>Response.json({enabled:true})],
  ['audio range ignored','/audio/reception/reception-a1-01-v1-listening-guided.m4a',()=>new Response(new Uint8Array(1024))],
])test(`public verification rejects ${name}`,async()=>{
  await assert.rejects(verifyPublic('https://fixture.test',release,{request:fixture(map=>map.set(path,response))}));
});
test('transient network failure retries, persistent failure remains a failure',async()=>{
  let calls=0;
  const good=fixture();
  await verifyWithRetry('https://fixture.test',release,{healthOnly:true,delayMs:0,request:async(...args)=>{
    if(++calls===1)throw new Error('connection reset');
    return good(...args);
  }});
  assert.equal(calls,2);
  await assert.rejects(verifyWithRetry('https://fixture.test',release,{attempts:2,delayMs:0,request:async()=>{throw new Error('offline');}}),/offline/);
});
