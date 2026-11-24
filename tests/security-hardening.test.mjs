import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import headers from '../deploy/security-headers.json' with { type: 'json' };

test('browser defenses permit Supabase, Turnstile, audio blobs and runtime inline scripts while blocking framing and plugins', () => {
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.match(headers['Strict-Transport-Security'], /max-age=31536000/);
  const csp = headers['Content-Security-Policy'];
  for (const value of ["frame-ancestors 'none'", "object-src 'none'", 'https://challenges.cloudflare.com', 'https://npnzojbbwwdtujuurkmx.supabase.co', "media-src 'self' blob:"]) assert.ok(csp.includes(value));
  assert.ok(!csp.includes('unsafe-eval'));
});

test('CAPTCHA config fails closed when required; signup, sign-in and recovery send one token to Supabase', async () => {
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false, watch: null } });
  const calls = [];
  const client = createClient('https://auth.example.test', 'public-test-key', {
    global: { fetch: async (url, init) => {
      calls.push({ url: new URL(url), body: JSON.parse(init.body) });
      return Response.json(String(url).includes('/signup') ? { id: 'test-user', email: 'learner@example.test' } : {}, { status: String(url).includes('/token') ? 400 : 200 });
    } },
    auth: { flowType: 'pkce', autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  try {
    const { captchaConfig, submitEmailAuth } = await vite.ssrLoadModule('/app/lib/auth-captcha.ts');
    assert.deepEqual(captchaConfig({}), { enabled: false, siteKey: null });
    assert.throws(() => captchaConfig({ LESELAUT_TURNSTILE_REQUIRED: '1' }));
    assert.throws(() => captchaConfig({ LESELAUT_TURNSTILE_SITE_KEY: 'invalid' }));
    const captcha = captchaConfig({ LESELAUT_TURNSTILE_SITE_KEY: '0x4AAAAA-test-sitekey' });
    const input = { email: 'learner@example.test', password: 'test-password', username: 'learner', callback: 'https://site.example.test/auth/confirm', captcha, token: 'fresh-test-token' };
    await assert.rejects(submitEmailAuth(client.auth, { ...input, mode: 'signup', token: '' }), /security check/);
    assert.equal(calls.length, 0);
    for (const mode of ['signup', 'signin', 'recover']) await submitEmailAuth(client.auth, { ...input, mode }).catch(() => {});
    assert.equal(calls.length, 3);
    assert.deepEqual(calls.map(call => call.url.pathname), ['/auth/v1/signup', '/auth/v1/token', '/auth/v1/recover']);
    for (const call of calls) assert.equal(call.body.gotrue_meta_security.captcha_token, 'fresh-test-token');
    assert.equal(calls[0].body.data.username, 'learner');
    assert.equal(calls[2].url.searchParams.get('redirect_to'), 'https://site.example.test/auth/confirm?intent=recovery');
    assert.ok(calls[2].body.code_challenge.length > 40);
  } finally { await client.auth.stopAutoRefresh(); await vite.close(); }
});

test('progress mergers drop prototype-polluting keys and handle Object.prototype property names safely', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false, watch: null } });
  try {
    const { mergeProgress } = await vite.ssrLoadModule('/app/lib/progress-merge.ts');
    const { markStory, mergeStoryProgress } = await vite.ssrLoadModule('/app/lib/story-progress.ts');
    const shared = await vite.ssrLoadModule('/app/api/tutor/_shared.ts');
    assert.equal('rateLimited' in shared, false, 'spoofable IP header rate limiter must stay removed');

    const evilCourse = JSON.parse('{"chapters":{"__proto__":{"completed":true,"checkpointScore":99},"constructor":{"completed":true},"prototype":{"completed":true},"a1-01":{"skillScores":{"__proto__":10,"toString":75,"reading":80}}}}');
    const mergedCourse = mergeProgress('course', evilCourse, {});
    assert.equal(({}).completed, undefined);
    assert.equal(Object.getPrototypeOf(mergedCourse.chapters), Object.prototype);
    assert.deepEqual(Object.keys(mergedCourse.chapters), ['a1-01']);
    assert.equal(mergedCourse.chapters['a1-01'].skillScores.toString, 75);
    assert.equal(mergedCourse.chapters['a1-01'].skillScores.reading, 80);
    assert.equal(Object.hasOwn(mergedCourse.chapters['a1-01'].skillScores, '__proto__'), false);

    const evilGrammar = JSON.parse('{"completed":["g1"],"scores":{"__proto__":5,"toString":90},"sets":{"__proto__":{"a":1},"constructor":{"a":2},"g1":{"__proto__":3,"valueOf":88}}}');
    const mergedGrammar = mergeProgress('grammar', evilGrammar, {});
    assert.equal(Object.getPrototypeOf(mergedGrammar.sets), Object.prototype);
    assert.deepEqual(Object.keys(mergedGrammar.sets), ['g1']);
    assert.equal(mergedGrammar.scores.toString, 90);
    assert.equal(mergedGrammar.sets.g1.valueOf, 88);
    assert.equal(Object.hasOwn(mergedGrammar.scores, '__proto__'), false);

    const evilStories = JSON.parse('{"entries":{"__proto__":{"completed":true,"updatedAt":100},"constructor":{"completed":true,"updatedAt":100},"toString":{"completed":true,"updatedAt":100},"reading-a1-01-v1":{"completed":true,"updatedAt":100}}}');
    const mergedStories = mergeStoryProgress(evilStories, {});
    assert.equal(Object.getPrototypeOf(mergedStories.entries), Object.prototype);
    assert.equal(Object.hasOwn(mergedStories.entries, '__proto__'), false);
    assert.equal(Object.hasOwn(mergedStories.entries, 'constructor'), false);
    assert.equal(mergedStories.entries['reading-a1-01-v1'].completed, true);
    assert.equal(mergedStories.entries.toString.completed, true);
    const unchanged = markStory(mergedStories, '__proto__', true, 200);
    assert.equal(unchanged, mergedStories);
  } finally {
    await vite.close();
  }
});
