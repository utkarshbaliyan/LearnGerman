import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { allowedStoryArt, storyArtResponse } from '../app/lib/story-art-media.mjs';

const bytes = Buffer.from('illustration'), sha256 = createHash('sha256').update(bytes).digest('hex');
const storyId = 'reading-b1-01-v2', asset = `${storyId}-${sha256.slice(0,12)}.webp`;
const key = `illustrations/stories/${asset}`;
const entry = { storyId, localFilename: `${storyId}-watercolor.webp`, bytes: bytes.length, sha256, contentType: 'image/webp' };
const registry = { [key]: entry };

test('story art accepts exact registered story IDs and image checksums only', () => {
  assert.deepEqual(allowedStoryArt(asset, registry), { key, entry });
  for (const value of ['../secret', asset.replace('-01-', '-001-'), asset.replace('-01-', '-00-'), asset.replace('-01-', '-201-'), asset.replace('.webp', '.svg'), asset.replace('.webp', '.png')]) assert.equal(allowedStoryArt(value, registry), null);
  for (const override of [{storyId:'reading-b1-02-v2'}, {localFilename:'../secret'}, {sha256:'0'.repeat(64)}, {bytes:9*1024**2}, {contentType:'text/html'}]) assert.equal(allowedStoryArt(asset,{[key]:{...entry,...override}}),null);
});

test('story art verifies signed uploads, preserves immutable images and isolates other media', async () => {
  let stored = null, writes = 0;
  const bucket = {
    async head(k) { assert.equal(k,key); return stored && {size:stored.length, customMetadata:{sha256},httpEtag:'"art"'}; },
    async get() { return {body:stored}; },
    async put(k,value,options) { assert.equal(k,key); assert.equal(options.onlyIf.get('if-none-match'),'*'); stored=Buffer.from(value); writes++; return this.head(k); },
  };
  const secret='test-story-art-signing-secret', now=1800000000000, expiry='1800000100';
  const sign=namespace=>createHmac('sha256',secret).update(`PUT\n${namespace}\n${expiry}\n${bytes.length}\n${sha256}`).digest('base64url');
  const request=(method,namespace=key,body=bytes)=>new Request(`https://example.test/media/${key}`,{method,body:method==='PUT'?body:undefined,headers:{'content-type':'image/webp','x-media-expiry':expiry,'x-media-signature':sign(namespace)}});
  const serve=request=>storyArtResponse(request,asset,{registry,bucket,uploadSecret:secret,now});
  assert.equal((await serve(request('PUT',key.replace('illustrations/stories/','stories/b2/')))).status,403);
  assert.equal((await serve(request('PUT',key,Buffer.from('wrong')))).status,400);
  assert.equal((await serve(request('PUT'))).status,204);
  assert.equal((await serve(request('PUT'))).status,204); assert.equal(writes,1);
  const response=await serve(request('GET')); assert.equal(response.status,200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
  assert.equal(response.headers.get('x-media-sha256'),sha256);
});
