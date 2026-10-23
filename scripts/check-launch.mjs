// Read-only smoke check. Never uses a learner token, modifies records or calls AI.
const target = new URL(process.argv[2] ?? 'https://d19k6l47v6hw3.cloudfront.net');
if (target.username || target.password || target.search || target.hash || target.pathname !== '/' || (target.protocol !== 'https:' && !['127.0.0.1','localhost'].includes(target.hostname))) throw new Error('Provide only an HTTPS origin, or a local development origin.');
const paths = ['/api/health','/account','/auth/reset-password','/privacy','/support','/api/account','/api/progress','/api/account/export'];
const results = await Promise.all(paths.map(async path => {
  try {
    const response = await fetch(new URL(path, target), { signal: AbortSignal.timeout(20_000), redirect: 'error' });
    const text = await response.text();
    const protectedApi = ['/api/account','/api/progress','/api/account/export'].includes(path);
    const expected = protectedApi ? 401 : 200;
    const cacheSafe = !protectedApi || /private, no-store/.test(response.headers.get('cache-control') ?? '');
    const healthy = path !== '/api/health' || JSON.parse(text).status === 'ok';
    return { path, status: response.status, pass: response.status === expected && cacheSafe && healthy && !/(sb_secret_|sk-proj-|gsk_)[A-Za-z0-9_-]{10,}/.test(text) };
  } catch { return { path, pass: false, error: 'unreachable or invalid response' }; }
}));
try {
  const response = await fetch(new URL('/api/account/delete', target), { method: 'POST', signal: AbortSignal.timeout(20_000) });
  await response.body?.cancel();
  results.push({ path: '/api/account/delete', status: response.status, pass: response.status === 401 });
} catch { results.push({ path: '/api/account/delete', pass: false, error: 'unreachable' }); }
console.log(JSON.stringify({ origin: target.origin, passed: results.every(r => r.pass), results }, null, 2));
if (results.some(r => !r.pass)) process.exitCode = 1;
