import test from 'node:test';
import assert from 'node:assert/strict';
import { stagingIdentityIsCurrent, stagingDeletionAllowed } from '../app/lib/staging-safety.mjs';
const request = new Request('https://example.test/api/account', { headers: { authorization: 'Bearer test-token' } });
const env = { LESELAUT_STAGING: '1', SUPABASE_SECRET_KEY: 'test-only-placeholder' };

test('normal deployment does not add an identity lookup', async () => {
  assert.equal(await stagingIdentityIsCurrent(request, 'user-1', {}, () => { throw new Error('must not fetch'); }), true);
});
test('staging denies identities without its server credential', async () => {
  assert.equal(await stagingIdentityIsCurrent(request, 'user-1', { LESELAUT_STAGING: '1' }), false);
});
test('staging rejects a revoked identity despite a previously verified token', async () => {
  assert.equal(await stagingIdentityIsCurrent(request, 'user-1', env, async () => new Response(null, { status: 401 })), false);
});
test('staging rejects an identity mismatch', async () => {
  assert.equal(await stagingIdentityIsCurrent(request, 'user-1', env, async () => Response.json({ id: 'user-2' })), false);
});
test('staging accepts only the matching current identity without caching or redirecting', async () => {
  assert.equal(await stagingIdentityIsCurrent(request, 'user-1', env, async (url, options) => {
    assert.equal(url, 'https://npnzojbbwwdtujuurkmx.supabase.co/auth/v1/user');
    assert.equal(options.redirect, 'error'); assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.authorization, 'Bearer test-token');
    return Response.json({ id: 'user-1' });
  }), true);
});
test('staging fails closed when identity validation is unavailable', async () => {
  assert.equal(await stagingIdentityIsCurrent(request, 'user-1', env, async () => { throw new Error('offline'); }), false);
});
test('staging deletion is limited to the explicitly designated test account', () => {
  assert.equal(stagingDeletionAllowed('real@example.test', env), false);
  const configured = { ...env, LESELAUT_STAGING_DELETE_EMAIL: 'test@example.test' };
  assert.equal(stagingDeletionAllowed('real@example.test', configured), false);
  assert.equal(stagingDeletionAllowed('TEST@example.test', configured), true);
  assert.equal(stagingDeletionAllowed('real@example.test', {}), true);
});
