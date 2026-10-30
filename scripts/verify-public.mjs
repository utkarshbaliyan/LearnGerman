import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

// Read-only probes: never sign in, write learner data, or call an AI provider.
export async function verifyPublic(base, release, {healthOnly=false, request=fetch}={}) {
  const get = async (path, options={}) => request(new URL(path, base), {
    redirect:'error', signal:AbortSignal.timeout(8000), ...options,
  });
  const health = await get('/api/health');
  assert.equal(health.status,200,'Database readiness');
  assert.match(health.headers.get('cache-control')??'',/no-store/,'Uncached readiness');
  assert.deepEqual(await health.json(),{status:'ok',release},'Running commit must match the checked release');
  if(healthOnly)return;
  const home=await get('/');
  assert.equal(home.status,200,'Homepage');
  assert.equal(home.headers.get('x-frame-options'),'DENY','Homepage framing protection');
  assert.equal(home.headers.get('x-content-type-options'),'nosniff','Homepage content sniffing protection');
  assert.ok((home.headers.get('content-security-policy')??'').includes("frame-ancestors 'none'"),'Homepage CSP framing protection');
  assert.equal(home.headers.get('referrer-policy'),'strict-origin','Private paths must not leak in referrers');
  const html=await home.text();
  assert.match(html,/LeseLaut/,'Homepage content');
  assert.match(html,/<script[^>]+id="leselaut-analytics-boundary"/,'Consent navigation guard');
  assert.doesNotMatch(html,/<script[^>]+src=["']https:\/\/static\.cloudflareinsights\.com\//,'No beacon before browser consent');
  const boundary=await get('/analytics-boundary.js',{method:'HEAD'});
  assert.equal(boundary.status,200,'Analytics privacy guard asset');
  assert.match(boundary.headers.get('content-type')??'',/javascript/,'Privacy guard JavaScript MIME type');
  const asset=html.match(/(?:src|href)="(\/assets\/[^"?#]+\.js)(?:[?#][^"]*)?"/);
  assert.ok(asset,'Homepage must reference a built JavaScript asset');
  const js=await get(asset[1],{method:'HEAD'});
  assert.equal(js.status,200,'Homepage JavaScript');
  assert.match(js.headers.get('content-type')??'',/javascript/,'JavaScript MIME type');
  const account=await get('/account');
  assert.equal(account.status,200,'Sign-in page');
  await account.body?.cancel();
  const auth=await get('/api/auth/config');
  assert.equal(auth.status,200,'Authentication configuration');
  await auth.body?.cancel();
  for(const path of ['/api/account','/api/progress']) {
    const response=await get(path);
    assert.equal(response.status,401,`Authentication required: ${path}`);
    assert.match(response.headers.get('cache-control')??'',/private, no-store/,`Private response: ${path}`);
    await response.body?.cancel();
  }
  const telemetry=await get('/api/telemetry/config');
  assert.equal(telemetry.status,200,'Monitoring configuration');
  assert.equal((await telemetry.json()).enabled,false,'Paid browser monitoring must stay off');
  for(const path of [
    '/audio/reception/reception-a1-01-v1-listening-guided.m4a',
    '/media/books/zwischen-hoersaal-und-arbeitswelt/p001-page-50210d2788be-e23a3341-qwen-dialogue-opus16-814f62d9954c.webm',
  ]) {
    const audio=await get(path,{headers:{Range:'bytes=0-31'}});
    assert.equal(audio.status,206,'Audio seeking');
    assert.match(audio.headers.get('content-range')??'',/^bytes 0-31\/[0-9]+$/,'Audio byte range');
    assert.match(audio.headers.get('content-type')??'',/^(?:audio\/|application\/octet-stream$)/,'Audio MIME type');
    assert.equal((await audio.arrayBuffer()).byteLength,32,'Audio range length');
  }
}

export async function verifyWithRetry(base, release, {attempts=3,delayMs=3000,...options}={}) {
  for(let attempt=1;attempt<=attempts;attempt++) {
    try { await verifyPublic(base,release,options); return; }
    catch(error) {
      if(attempt===attempts)throw error;
      await new Promise(resolve=>setTimeout(resolve,delayMs));
    }
  }
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const [base,release,...flags]=process.argv.slice(2);
  if(!base||!/^[a-f0-9]{40}$/.test(release??''))throw new Error('Usage: verify-public.mjs URL COMMIT [--health-only]');
  const healthOnly=flags.includes('--health-only');
  try {
    await verifyWithRetry(base,release,{healthOnly,attempts:healthOnly?30:3,delayMs:2000});
    console.log(`Verified ${release} at ${new URL(base).origin}${healthOnly?' (database readiness)':' (readiness, pages, security headers, assets, auth boundary, monitoring off, audio)'}`);
  }catch(error) {
    // Deliberately omit response bodies and runtime configuration.
    console.error(`Health verification failed at ${new URL(base).origin}: ${error.message.split('\n')[0]}`);
    process.exitCode=1;
  }
}
