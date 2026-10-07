import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash, createHmac} from 'node:crypto';
import {allowedStoryMedia, storyMediaResponse} from '../app/lib/story-object-media.mjs';

const bytes = Buffer.from('B2 dialogue recording'), sha256 = createHash('sha256').update(bytes).digest('hex');
const localFilename = 'reading-b2-01-v1-123456789abc-12345678-qwen-dialogue-opus16.webm';
const asset = localFilename.replace('.webm', `-${sha256.slice(0,12)}.webm`), key = `stories/b2/${asset}`;
const entry = {bytes:bytes.length, sha256, localFilename, contentType:'audio/webm'}, registry = {[key]:entry};

test('B2 media allows only canonical IDs and content-hash-pinned release files', () => {
  assert.deepEqual(allowedStoryMedia(asset, registry), {key, entry});
  for (const filename of ['../secret', asset.replace('-01-', '-001-'), asset.replace('-01-', '-00-'), asset.replace('-01-', '-201-'), asset.replace('-v1-', '-v2-')]) assert.equal(allowedStoryMedia(filename, registry), null);
  assert.equal(allowedStoryMedia(asset, {[key]:{...entry, localFilename:'../secret'}}), null);
  assert.equal(allowedStoryMedia(asset, {[key]:{...entry, bytes:3*1024**2}}), null);
  assert.equal(allowedStoryMedia(asset, {[key]:{...entry, sha256:'0'.repeat(64)}}), null);
});

test('B2 streaming verifies metadata, ranges and signatures within its own namespace', async () => {
  let stored = bytes, hash = sha256, writes = 0;
  const bucket = {
    async head(k) {assert.equal(k,key);return stored && {size:stored.length, customMetadata:{sha256:hash}, httpEtag:'"b2"'};},
    async get(k, options) {assert.equal(k,key);return {body:options?.range ? stored.subarray(options.range.offset,options.range.offset+options.range.length) : stored};},
    async put(k, value, options) {assert.equal(k,key);assert.equal(options.onlyIf.get('if-none-match'),'*');stored=Buffer.from(value);hash=options.customMetadata.sha256;writes++;return this.head(k);},
  };
  const secret='test-only-b2-secret', now=1800000000000, expiry='1800000100';
  const serve=(request, extra={})=>storyMediaResponse(request,asset,{bucket,registry,uploadSecret:secret,now,...extra});
  const request=(method='GET',headers={},body)=>new Request(`https://example.test/media/${key}`,{method,headers,body});
  const response=await serve(request('GET',{range:'bytes=0-1'}));
  assert.equal(response.status,206);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(0,2));
  assert.equal((await serve(request('HEAD'))).headers.get('content-length'),String(bytes.length));
  assert.equal((await serve(request('PUT',{'content-type':'audio/webm'},bytes))).status,403);
  const sign=namespace=>createHmac('sha256',secret).update(`PUT\n${namespace}\n${expiry}\n${bytes.length}\n${sha256}`).digest('base64url');
  const headers=namespace=>({'content-type':'audio/webm','x-media-expiry':expiry,'x-media-signature':sign(namespace)});
  assert.equal((await serve(request('PUT',headers(key.replace('stories/b2/','books/zwischen-hoersaal-und-arbeitswelt/')),bytes))).status,403);
  stored=null;
  assert.equal((await serve(request('PUT',headers(key),bytes))).status,204);assert.equal(writes,1);
  assert.equal((await serve(request('PUT',headers(key),bytes))).status,204);assert.equal(writes,1);
  hash='corrupt';assert.equal((await serve(request())).status,503);
});
