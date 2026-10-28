import test from 'node:test';
import assert from 'node:assert/strict';
import { secureResponse } from '../deploy/security-response.mjs';

test('response hardening preserves streaming bodies and application response headers', async () => {
  const original = new Response('response fixture', { status: 503, headers: { 'cache-control': 'private, no-store', 'retry-after': '60', 'set-cookie': 'fixture=value; Secure; HttpOnly' } });
  const secured = secureResponse(original);
  assert.equal(secured.status, 503); assert.equal(await secured.text(), 'response fixture');
  assert.equal(secured.headers.get('cache-control'), 'private, no-store');
  assert.equal(secured.headers.get('retry-after'), '60');
  assert.equal(secured.headers.get('set-cookie'), 'fixture=value; Secure; HttpOnly');
  assert.equal(secured.headers.get('x-frame-options'), 'DENY');
  assert.match(secured.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(secured.headers.get('strict-transport-security'), 'max-age=31536000');
});
test('test deployments are excluded from indexing while normal responses retain their policy', () => {
  assert.equal(secureResponse(new Response(), true).headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(secureResponse(new Response()).headers.get('x-robots-tag'), null);
});
test('security wrapping preserves empty cache-validation responses', () => {
  const response = secureResponse(new Response(null, { status: 304, headers: { etag: 'fixture' } }));
  assert.equal(response.status, 304); assert.equal(response.body, null); assert.equal(response.headers.get('etag'), 'fixture');
});
