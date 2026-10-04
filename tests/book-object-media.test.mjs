import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { bookMediaResponse, allowedMedia } from '../app/lib/book-object-media.mjs';
const localFilename = 'p001-page-123456789abc-12345678-qwen-dialogue-opus16.webm';
const bytes = Buffer.from('sample recording');
const sha256 = createHash('sha256').update(bytes).digest('hex');
const asset = localFilename.replace('.webm', `-${sha256.slice(0,12)}.webm`);
const key = `books/zwischen-hoersaal-und-arbeitswelt/${asset}`;
const registry = { [key]: { bytes: bytes.length, sha256, contentType: 'audio/webm', localFilename } };
function storage(present = true) {
  let data = present ? bytes : null;
  let metadata = present ? sha256 : null;
  let writes = 0;
  return {
    get writes() { return writes; },
    corrupt() { metadata = 'bad'; },
    async head() { return data && { size: data.length, customMetadata: { sha256: metadata }, httpEtag: '"etag"' }; },
    async get(_, options) {
      const selected = options?.range ? data.subarray(options.range.offset, options.range.offset + options.range.length) : data;
      return { body: new ReadableStream({ start(controller) { controller.enqueue(selected); controller.close(); } }) };
    },
    async put(_, content, options) {
      assert.equal(options.onlyIf.get('if-none-match'), '*');
      writes++; data = Buffer.from(content); metadata = options.customMetadata.sha256;
      return this.head();
    },
  };
}
const request = (method = 'GET', headers = {}, body) => new Request(`https://example.test/media/${asset}`, { method, headers, body });
const serve = (req, bucket = storage(), extra = {}) => bookMediaResponse(req, asset, { bucket, registry, ...extra });
test('book objects serve verified bytes, cache validators and HEAD without a body', async () => {
  let response = await serve(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-media-sha256'), sha256);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  response = await serve(request('HEAD', { range: 'bytes=0-2' }));
  assert.equal(response.status, 200); assert.equal(await response.text(), '');
  assert.equal(response.headers.get('content-length'), String(bytes.length));
  response = await serve(request('GET', { 'if-none-match': 'W/"etag"' }));
  assert.equal(response.status, 304); assert.equal(await response.text(), '');
});
test('recordings support bounded, suffix, open and unsatisfiable ranges', async () => {
  for (const [range, expected] of [['bytes=0-2', bytes.subarray(0, 3)], ['bytes=-4', bytes.subarray(-4)], ['bytes=4-', bytes.subarray(4)], ['bytes=4-999', bytes.subarray(4)]]) {
    const response = await serve(request('GET', { range }));
    assert.equal(response.status, 206); assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected);
  }
  assert.equal((await serve(request('GET', { range: 'bytes=999-' }))).status, 416);
  assert.equal((await serve(request('GET', { range: 'bytes=0-1,4-5' }))).status, 200);
  assert.equal((await serve(request('GET', { range: 'bytes=0-1', 'if-range': '"old"' }))).status, 200);
  assert.equal((await serve(request('GET', { range: 'bytes=0-1', 'if-range': '"etag"' }))).status, 206);
});
test('the exact release allowlist rejects arbitrary paths and corrupt stored metadata', async () => {
  assert.equal(allowedMedia('../secret', registry), null);
  assert.equal(allowedMedia(asset, { [key]: { ...registry[key], localFilename: '../private' } }), null);
  assert.equal(allowedMedia(asset, { [key]: { ...registry[key], sha256: '0'.repeat(64) } }), null);
  assert.equal(allowedMedia(asset.replace('p001', 'p201'), registry), null);
  const bucket = storage(); bucket.corrupt();
  assert.equal((await serve(request(), bucket)).status, 503);
  assert.equal((await serve(request(), undefined, { bucket: undefined })).status, 503);
  assert.equal((await serve(request('DELETE'))).status, 405);
});
const secret = 'test-only-upload-secret';
const now = 1800000000000;
function signed(body = bytes, expiry = '1800000100') {
  const signature = createHmac('sha256', secret).update(`PUT\n${key}\n${expiry}\n${bytes.length}\n${sha256}`).digest('base64url');
  return request('PUT', { 'content-type': 'audio/webm', 'x-media-expiry': expiry, 'x-media-signature': signature }, body);
}
test('uploads require a live signature, exact bytes and immutable conditional writes', async () => {
  const bucket = storage(false), options = { uploadSecret: secret, now };
  assert.equal((await serve(request('PUT', { 'content-type': 'audio/webm' }, bytes), bucket, options)).status, 403);
  assert.equal((await serve(signed(bytes, '1799999999'), bucket, options)).status, 403);
  assert.equal((await serve(signed(bytes, '1800001000'), bucket, options)).status, 403);
  assert.equal((await serve(signed(Buffer.alloc(bytes.length)), bucket, options)).status, 422);
  assert.equal((await serve(signed(Buffer.alloc(bytes.length + 1)), bucket, options)).status, 413);
  assert.equal((await serve(signed(Buffer.alloc(bytes.length - 1)), bucket, options)).status, 400);
  assert.equal((await serve(signed(), bucket, options)).status, 204);
  assert.equal(bucket.writes, 1);
  assert.equal((await serve(signed(), bucket, options)).status, 204);
  assert.equal(bucket.writes, 1);
  bucket.corrupt();
  assert.equal((await serve(signed(), bucket, options)).status, 409);
  assert.equal((await serve(signed(), bucket, { now })).status, 503);
});
