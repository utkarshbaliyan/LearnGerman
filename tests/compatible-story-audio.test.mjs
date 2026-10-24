import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {allowedCompatibleStoryMedia,compatibleStoryMediaResponse} from '../app/lib/compatible-story-media.mjs';

const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
test('all story recordings have source-pinned AAC alternatives with matching durations',()=>{
  const sources={...read('app/lib/reading-audio-manifest.json'),...read('content/reading/b2/audio-manifest.json')};
  const compatible=read('content/reading/compatible/audio-manifest.json'),registry=read('content/reading/compatible/media-registry.json');
  assert.deepEqual(Object.keys(compatible).sort(),Object.keys(sources).sort());
  assert.equal(Object.keys(registry).length,Object.keys(sources).length);
  for(const [id,source]of Object.entries(sources)){
    const converted=compatible[id];
    assert.equal(converted.textHash,source.textHash,id);
    assert.equal(converted.sourceSrc,source.src,id);
    assert.match(converted.sourceSha256,/^[a-f0-9]{64}$/);
    assert.ok(Math.abs(converted.duration-source.duration)<=.15,`${id}: full recording duration`);
    const key=converted.src.replace(/^\/media\//,''),allowed=allowedCompatibleStoryMedia(key.split('/').at(-1),registry);
    assert.equal(allowed?.key,key,`${id}: immutable, registered audio/mp4 object`);
  }
});

test('compatible audio supports Safari byte probes, tail ranges, seeks and integrity failures',async()=>{
  const bytes=Buffer.from('complete AAC recording fixture'),sha256=createHash('sha256').update(bytes).digest('hex');
  const asset=`reading-a1-09-v1-364420892b32-aac48-${sha256.slice(0,12)}.m4a`,key='stories/compatible/'+asset;
  const entry={bytes:bytes.length,sha256,contentType:'audio/mp4'},registry={[key]:entry};let hash=sha256;
  const bucket={head:async()=>({size:bytes.length,customMetadata:{sha256:hash},httpEtag:'"aac"'}),get:async(_key,{range}={})=>({body:range?bytes.subarray(range.offset,range.offset+range.length):bytes})};
  const serve=(method='GET',headers={})=>compatibleStoryMediaResponse(new Request('https://example.test/media/'+key,{method,headers}),asset,{bucket,registry});
  for(const [range,start,end]of [['bytes=0-1',0,1],['bytes=10-19',10,19],[`bytes=-4`,bytes.length-4,bytes.length-1]]){
    const response=await serve('GET',{range});assert.equal(response.status,206);
    assert.equal(response.headers.get('content-type'),'audio/mp4');assert.equal(response.headers.get('accept-ranges'),'bytes');
    assert.equal(response.headers.get('content-range'),`bytes ${start}-${end}/${bytes.length}`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(start,end+1));
  }
  const head=await serve('HEAD');assert.equal(head.headers.get('content-length'),String(bytes.length));assert.equal(await head.text(),'');
  assert.equal((await serve('GET',{range:'bytes=999-'})).status,416);
  assert.equal((await serve('GET',{'if-none-match':'"aac"'})).status,304);
  assert.equal((await serve('PUT')).status,503,'this read-only route has no configured upload credential');
  hash='wrong';assert.equal((await serve()).status,503);
  for(const invalid of ['../secret',asset.replace(sha256.slice(0,12),'0'.repeat(12)),asset.replace('.m4a','.webm')])assert.equal(allowedCompatibleStoryMedia(invalid,registry),null);
});
