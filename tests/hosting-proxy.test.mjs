import assert from 'node:assert/strict';
import test from 'node:test';
import {proxyToAws} from '../app/lib/hosting-proxy.mjs';
const aws='https://d19k6l47v6hw3.cloudfront.net',legacy='https://leselaut-german.professor-ut7.chatgpt.site';

test('legacy hosting proxy preserves authenticated saves, drops platform credentials and keeps private cache headers',async()=>{
  const request=new Request(legacy+'/api/progress?scope=grammar',{method:'PUT',headers:{authorization:'Bearer test-learner',cookie:'private-cookie',
    'oai-sites-authorization':'private-platform-token','cf-access-jwt-assertion':'platform-assertion',origin:legacy,'x-progress-owner':'learner'},body:'{"data":"ä"}'});
  const response=await proxyToAws(request,aws,async forwarded=>{
    assert.equal(forwarded.url,aws+'/api/progress?scope=grammar');assert.equal(forwarded.headers.get('authorization'),'Bearer test-learner');
    for(const name of ['cookie','oai-sites-authorization','cf-access-jwt-assertion'])assert.equal(forwarded.headers.get(name),null);
    assert.equal(forwarded.headers.get('x-progress-owner'),'learner');assert.equal(forwarded.headers.get('origin'),aws);
    assert.equal(await forwarded.text(),'{"data":"ä"}');assert.equal(forwarded.redirect,'manual');
    return Response.json({saved:true},{headers:{'cache-control':'private, no-store'}});
  });
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.deepEqual(await response.json(),{saved:true});
});
test('legacy navigation keeps its original origin and media range headers',async()=>{
  const request=new Request(legacy+'/review',{headers:{range:'bytes=0-99','if-range':'"etag"'}});
  const response=await proxyToAws(request,aws,async forwarded=>{
    assert.equal(forwarded.headers.get('range'),'bytes=0-99');assert.equal(forwarded.headers.get('if-range'),'"etag"');
    return new Response(null,{status:307,headers:{location:aws+'/?view=review#cards'}});
  });
  assert.equal(response.headers.get('location'),legacy+'/?view=review#cards');
});
test('proxy rejects unexpected destinations and fails closed without exposing diagnostics',async()=>{
  const request=new Request(legacy+'/api/progress');let calls=0;
  const wrong=await proxyToAws(request,'https://attacker.example',async()=>{calls++;});assert.equal(wrong.status,503);assert.equal(calls,0);
  const down=await proxyToAws(request,aws,async()=>{throw new Error('private-infrastructure-detail');});
  assert.equal(down.status,503);assert.equal(down.headers.get('cache-control'),'no-store');assert.doesNotMatch(await down.text(),/private-infrastructure/);
});
