import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

function storage() {
  const values = new Map();
  return { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}
async function fixture(run) {
  // Real browser/sockets keep the event loop alive. Mock stalled promises do
  // not; Node's AbortSignal.timeout alone is intentionally unreferenced.
  const keepAlive = setInterval(() => {}, 1000);
  const old = { storage: globalThis.localStorage, window: globalThis.window, fetch: globalThis.fetch };
  globalThis.localStorage = storage(); globalThis.window = new EventTarget();
  globalThis.__reliabilitySession = async () => ({ data: { session: { access_token: 'test-token', user: { id: 'alice' } } }, error: null });
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } },
    server: { middlewareMode: true, ws: false, watch: null }, plugins: [{ name: 'isolated-auth', enforce: 'pre', transform(_code, id) {
      if (id.endsWith('/app/lib/supabase-client.ts')) return 'export const supabase = { auth: { getSession: () => globalThis.__reliabilitySession() } };';
    } }] });
  const save = await vite.ssrLoadModule('/app/lib/cloud-progress-save.ts');
  await vite.ssrLoadModule('/app/lib/supabase-client.ts');
  try { await run(vite, save); }
  finally {
    clearInterval(keepAlive);
    save.setCloudAuthenticated(false); save.clearPendingProgress(); await vite.close();
    globalThis.localStorage = old.storage; globalThis.window = old.window; globalThis.fetch = old.fetch;
    delete globalThis.__reliabilitySession;
  }
}

test('stalled session reads and requests abort without sending a late request, and a later attempt succeeds', async () => fixture(async vite => {
  const { authenticatedFetch } = await vite.ssrLoadModule('/app/lib/authenticated-fetch.ts');
  let release, requests = 0;
  globalThis.__reliabilitySession = () => new Promise(resolve => { release = resolve; });
  globalThis.fetch = async () => { requests++; return Response.json({ ok: true }); };
  await assert.rejects(authenticatedFetch('/api/account', { signal: AbortSignal.timeout(30) }), error => error.name === 'TimeoutError');
  release({ data: { session: { access_token: 'late-token' } }, error: null });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(requests, 0, 'timing out auth must not send the request when the SDK eventually resolves');
  globalThis.__reliabilitySession = async () => ({ data: { session: { access_token: 'test-token' } }, error: null });
  globalThis.fetch = (_url, init) => new Promise((_resolve, reject) => {
    assert.equal(init.credentials, 'same-origin'); assert.equal(init.headers.get('authorization'), 'Bearer test-token');
    init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
  });
  await assert.rejects(authenticatedFetch('/api/progress', { signal: AbortSignal.timeout(30) }), error => error.name === 'TimeoutError');
  globalThis.fetch = async () => Response.json({ ok: true });
  assert.equal((await authenticatedFetch('/api/account')).status, 200);
  const cancelled = new AbortController(); cancelled.abort();
  await assert.rejects(authenticatedFetch('/api/account', { signal: cancelled.signal }), error => error.name === 'AbortError');
}));

test('offline, service failure and stalled sync keep local edits and recover with merged remote progress', async () => fixture(async (vite, save) => {
  const keys = await vite.ssrLoadModule('/app/lib/cloud-progress-keys.ts');
  const { synchronizeCloudProgress } = await vite.ssrLoadModule('/app/lib/cloud-progress.ts');
  localStorage.setItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY, 'alice'); save.setCloudAuthenticated(false);
  save.queueCloudProgress('stories', ['offline-story']);
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  await assert.rejects(synchronizeCloudProgress(), /offline/);
  save.setCloudAuthenticated(false);
  globalThis.fetch = async () => Response.json({ error: 'unavailable' }, { status: 503 });
  assert.equal((await synchronizeCloudProgress()).synced, false); save.setCloudAuthenticated(false);
  const timeout = AbortSignal.timeout;
  AbortSignal.timeout = ms => timeout(Math.min(ms, 30));
  try {
    globalThis.fetch = (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true }));
    await assert.rejects(synchronizeCloudProgress(), error => error.name === 'TimeoutError');
  } finally { AbortSignal.timeout = timeout; save.setCloudAuthenticated(false); }
  assert.deepEqual(JSON.parse(localStorage.getItem(keys.PROGRESS_STORAGE_KEYS.stories)), ['offline-story']);
  let remote = { stories: ['remote-story'] };
  const { mergeProgress } = await vite.ssrLoadModule('/app/lib/progress-merge.ts');
  globalThis.fetch = async (_url, init) => {
    if (!init.method) return Response.json({ userId: 'alice', progress: remote });
    assert.equal(init.headers.get('x-progress-owner'), 'alice');
    const { scope, data } = JSON.parse(init.body); remote[scope] = mergeProgress(scope, data, remote[scope]);
    return Response.json({ userId: 'alice', data: remote[scope] });
  };
  assert.equal((await synchronizeCloudProgress()).synced, true, 'a timed-out sync must release its shared promise');
  await save.flushCloudProgress('stories');
  const progress = JSON.parse(localStorage.getItem(keys.PROGRESS_STORAGE_KEYS.stories));
  for (const id of ['offline-story', 'remote-story']) {
    assert.equal(progress.entries[id].completed, true); assert.equal(remote.stories.entries[id].completed, true);
  }
}));

test('deletion removes both draft formats and prevents an in-flight sync from restoring account data', async () => fixture(async (vite, save) => {
  const keys = await vite.ssrLoadModule('/app/lib/cloud-progress-keys.ts');
  const { clearAccountStorage, accountWasDeleted } = await vite.ssrLoadModule('/app/lib/account-storage.ts');
  const { synchronizeCloudProgress } = await vite.ssrLoadModule('/app/lib/cloud-progress.ts');
  for (const key of Object.values(keys.PROGRESS_STORAGE_KEYS)) localStorage.setItem(key, '{}');
  localStorage.setItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY, 'alice');
  localStorage.setItem(keys.PROGRESS_STORAGE_KEYS.stories, '["unsynced-story"]');
  for (const key of ['leselaut-draft:alice:old', 'leselaut:translation-draft:v1:alice:new']) localStorage.setItem(key, 'private draft');
  localStorage.setItem('leselaut:translation-draft:v1:bob:other', 'other owner'); localStorage.setItem('leselaut:theme', 'dark');
  save.setCloudAuthenticated(false); save.queueCloudProgress('stories', ['unsynced-story']);
  let writes = 0;
  globalThis.fetch = async (_url, init) => {
    if (!init.method) return Response.json({ userId: 'alice', progress: {} });
    writes++; clearAccountStorage(localStorage, 'alice'); save.clearPendingProgress();
    return Response.json({ userId: 'alice', data: JSON.parse(init.body).data });
  };
  assert.equal((await synchronizeCloudProgress()).synced, false); assert.equal(writes, 1);
  assert.equal(accountWasDeleted(localStorage, 'alice'), true);
  for (const key of [...Object.values(keys.PROGRESS_STORAGE_KEYS), keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY, 'leselaut-draft:alice:old', 'leselaut:translation-draft:v1:alice:new']) assert.equal(localStorage.getItem(key), null, key);
  assert.equal(localStorage.getItem('leselaut:theme'), 'dark'); assert.equal(localStorage.getItem('leselaut:translation-draft:v1:bob:other'), 'other owner');
  assert.equal((await synchronizeCloudProgress()).synced, false); assert.equal(writes, 1, 'a deleted identity cannot replay queued progress');
}));

test('a late progress response after sign-out cannot restore the signed-out account cache', async () => fixture(async (vite, save) => {
  const keys = await vite.ssrLoadModule('/app/lib/cloud-progress-keys.ts');
  const { synchronizeCloudProgress } = await vite.ssrLoadModule('/app/lib/cloud-progress.ts');
  let release, entered;
  const started = new Promise(resolve => { entered = resolve; });
  localStorage.setItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY, 'alice');
  globalThis.fetch = async () => { entered(); return new Promise(resolve => { release = resolve; }); };
  const old = synchronizeCloudProgress(); await started;
  save.clearPendingProgress(); save.setCloudAuthenticated(false);
  localStorage.removeItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY);
  release(Response.json({ userId: 'alice', progress: { stories: ['private-alice-story'] } }));
  assert.equal((await old).synced, false);
  assert.equal(localStorage.getItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY), null);
  for (const key of Object.values(keys.PROGRESS_STORAGE_KEYS)) assert.equal(localStorage.getItem(key), null);
}));

test('account switching starts a fresh sync and ignores the previous account delayed response', async () => fixture(async (vite, save) => {
  const keys = await vite.ssrLoadModule('/app/lib/cloud-progress-keys.ts');
  const { synchronizeCloudProgress } = await vite.ssrLoadModule('/app/lib/cloud-progress.ts');
  const { mergeProgress } = await vite.ssrLoadModule('/app/lib/progress-merge.ts');
  let release, entered, first = true;
  const started = new Promise(resolve => { entered = resolve; });
  let bob = { stories: ['bob-remote'] };
  globalThis.fetch = async (_url, init) => {
    if (first) { first = false; entered(); return new Promise(resolve => { release = resolve; }); }
    if (!init.method) return Response.json({ userId: 'bob', progress: bob });
    assert.equal(init.headers.get('x-progress-owner'), 'bob');
    const { scope, data } = JSON.parse(init.body); bob[scope] = mergeProgress(scope, data, bob[scope]);
    return Response.json({ userId: 'bob', data: bob[scope] });
  };
  localStorage.setItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY, 'alice');
  const old = synchronizeCloudProgress(); await started;
  save.clearPendingProgress();
  localStorage.setItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY, 'bob');
  localStorage.setItem(keys.PROGRESS_STORAGE_KEYS.stories, '["bob-local"]');
  globalThis.__reliabilitySession = async () => ({ data: { session: { access_token: 'bob-token', user: { id: 'bob' } } }, error: null });
  assert.equal((await synchronizeCloudProgress()).synced, true, 'the new account must not inherit the old pending sync promise');
  release(Response.json({ userId: 'alice', progress: { stories: ['alice-private'] } }));
  assert.equal((await old).synced, false);
  assert.equal(localStorage.getItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY), 'bob');
  assert.deepEqual(Object.keys(JSON.parse(localStorage.getItem(keys.PROGRESS_STORAGE_KEYS.stories)).entries).sort(), ['bob-local', 'bob-remote']);
}));
