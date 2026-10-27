import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { staticMediaResponse } from '../deploy/cloudflare/static-media-response.mjs';

const bytes = new TextEncoder().encode('0123456789abcdef');
const entry = { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), contentType: 'audio/mp4' };
const key = 'stories/test.m4a', url = 'https://example.test/media/' + key;
function fixture({ size = bytes.length, status = 200, omitLength = false } = {}) {
  const calls = []; let cancelled = false, readBytes = 0;
  const assets = { async fetch(request) {
    calls.push(request);
    const headers = { 'content-length': String(size), 'content-type': 'audio/mp4', etag: '"asset-fixture"' };
    if (omitLength) delete headers['content-length'];
    if (request.method === 'HEAD' || status !== 200) return new Response(null, { status, headers });
    let cursor = 0;
    return new Response(new ReadableStream({
      pull(controller) { if (cursor >= bytes.length) return controller.close(); const next = bytes.subarray(cursor, cursor + 2); cursor += next.length; readBytes += next.length; controller.enqueue(next); },
      cancel() { cancelled = true; },
    }), { headers }); // Deliberately ignores Range, as the static service does.
  } };
  return { assets, registry: { [key]: entry, '/audio/legacy.m4a': entry }, calls, cancelled: () => cancelled, readBytes: () => readBytes };
}
test('real ASSETS responses without Content-Length use trusted registry metadata', async () => {
  for (const path of [url, 'https://example.test/audio/legacy.m4a']) {
    const f = fixture({ omitLength: true });
    const head = await staticMediaResponse(new Request(path, { method: 'HEAD' }), f);
    assert.equal(head.status, 200); assert.equal(head.headers.get('content-length'), '16');
    const r = await staticMediaResponse(new Request(path, { headers: { range: 'bytes=0-1' } }), f);
    assert.equal(r.status, 206); assert.equal(r.headers.get('content-range'), 'bytes 0-1/16');
    assert.deepEqual(new Uint8Array(await r.arrayBuffer()), bytes.subarray(0, 2));
  }
});
test('static-backed audio supports Safari byte probes, seeks and suffix ranges', async () => {
  for (const [range, start, end] of [['bytes=0-1', 0, 1], ['bytes=4-7', 4, 7], ['bytes=-4', 12, 15], ['bytes=10-100', 10, 15]]) {
    const f = fixture(); const r = await staticMediaResponse(new Request(url, { headers: { range } }), f);
    assert.equal(r.status, 206); assert.equal(r.headers.get('content-range'), `bytes ${start}-${end}/${bytes.length}`);
    assert.equal(r.headers.get('content-length'), String(end - start + 1));
    assert.deepEqual(new Uint8Array(await r.arrayBuffer()), bytes.subarray(start, end + 1));
    assert.equal(r.headers.get('content-type'), 'audio/mp4');
  }
});
test('conditional requests, HEAD and invalid ranges retain HTTP semantics', async () => {
  const f = fixture(), etag = `"${entry.sha256}"`;
  const head = await staticMediaResponse(new Request(url, { method: 'HEAD' }), f);
  assert.equal(head.status, 200); assert.equal(head.body, null); assert.equal(head.headers.get('content-length'), '16');
  const cached = await staticMediaResponse(new Request(url, { headers: { 'if-none-match': 'W/' + etag } }), fixture());
  assert.equal(cached.status, 304); assert.equal(cached.body, null);
  const changed = await staticMediaResponse(new Request(url, { headers: { range: 'bytes=0-1', 'if-range': '"older"' } }), fixture());
  assert.equal(changed.status, 200); assert.deepEqual(new Uint8Array(await changed.arrayBuffer()), bytes);
  const outside = await staticMediaResponse(new Request(url, { headers: { range: 'bytes=100-' } }), fixture());
  assert.equal(outside.status, 416); assert.equal(outside.headers.get('content-range'), 'bytes */16');
});
test('asset requests never forward credentials, range headers or query strings', async () => {
  const f = fixture(); const r = await staticMediaResponse(new Request(url + '?private=fixture', { headers: { authorization: 'Bearer fixture', cookie: 'fixture=value', range: 'bytes=0-1' } }), f);
  await r.arrayBuffer();
  for (const call of f.calls) {
    assert.equal(call.headers.get('authorization'), null); assert.equal(call.headers.get('cookie'), null);
    assert.equal(call.headers.get('range'), null); assert.equal(new URL(call.url).search, '');
    assert.equal(call.headers.get('accept-encoding'), 'identity');
  }
});
test('unknown, missing and inconsistent assets fail closed; legacy audio stays supported', async () => {
  assert.equal((await staticMediaResponse(new Request('https://example.test/media/unknown'), fixture())).status, 404);
  assert.equal((await staticMediaResponse(new Request(url, { method: 'PUT' }), fixture())).status, 405);
  assert.equal((await staticMediaResponse(new Request(url), fixture({ status: 404 }))).status, 404);
  assert.equal((await staticMediaResponse(new Request(url), fixture({ size: 99 }))).status, 503);
  const legacy = await staticMediaResponse(new Request('https://example.test/audio/legacy.m4a', { headers: { range: 'bytes=0-1' } }), fixture());
  assert.equal(legacy.status, 206); assert.deepEqual(new Uint8Array(await legacy.arrayBuffer()), bytes.subarray(0, 2));
});
test('small audio probes cancel the remaining source instead of buffering the recording', async () => {
  const f = fixture(); const r = await staticMediaResponse(new Request(url, { headers: { range: 'bytes=0-1' } }), f);
  await r.arrayBuffer(); assert.equal(f.cancelled(), true); assert.ok(f.readBytes() < bytes.length);
});
