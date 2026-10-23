import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

test('password recovery uses the existing callback with PKCE, distinguishes recovery links and only revokes sessions after a successful update', async () => {
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false, watch: null } });
  const values = new Map(), calls = [];
  const client = createClient('https://auth.example.test', 'public-test-key', { global: { fetch: async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) }); return Response.json({});
  } }, auth: { flowType: 'pkce', autoRefreshToken: false, detectSessionInUrl: false, storage: { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) } } });
  try {
    const { requestRecovery, recoveryCallback, updateRecoveredPassword } = await vite.ssrLoadModule('/app/lib/password-recovery.ts');
    await requestRecovery(client.auth, 'learner@example.test', 'https://site.example.test/auth/confirm');
    const url = new URL(calls[0].url);
    assert.equal(url.pathname, '/auth/v1/recover');
    assert.equal(url.searchParams.get('redirect_to'), 'https://site.example.test/auth/confirm?intent=recovery');
    assert.equal(calls[0].body.email, 'learner@example.test');
    assert.equal(calls[0].body.code_challenge_method, 's256');
    assert.ok(calls[0].body.code_challenge.length > 40);
    assert.equal(recoveryCallback('?intent=recovery&code=single-use', ''), true);
    assert.equal(recoveryCallback('?type=recovery&token_hash=hash', ''), true);
    assert.equal(recoveryCallback('', '#access_token=old&refresh_token=issued&type=recovery'), true);
    assert.equal(recoveryCallback('?code=google-login', ''), false);
    let updates = 0, signouts = 0, updateFails = false, signoutFails = false;
    const auth = { updateUser: async () => { updates++; return { error: updateFails ? new Error('expired') : null }; }, signOut: async options => { signouts++; assert.equal(options.scope, 'global'); return { error: signoutFails ? new Error('network') : null }; } };
    await assert.rejects(updateRecoveredPassword(auth, 'abcdefgh', 'different'));
    await assert.rejects(updateRecoveredPassword(auth, 'short', 'short'));
    assert.equal(updates, 0);
    updateFails = true;
    await assert.rejects(updateRecoveredPassword(auth, 'abcdefgh', 'abcdefgh'), /expired/);
    assert.equal(signouts, 0, 'a rejected password change cannot be reported as successful');
    updateFails = false;
    assert.equal((await updateRecoveredPassword(auth, 'abcdefgh', 'abcdefgh')).sessionsRevoked, true);
    signoutFails = true;
    assert.equal((await updateRecoveredPassword(auth, 'abcdefgh', 'abcdefgh')).sessionsRevoked, false, 'partial success is explicit');
  } finally { await client.auth.stopAutoRefresh(); await vite.close(); }
});
