import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'vite';
import { openSqlite } from '../deploy/aws/sqlite.mjs';

function fixture() {
  const db = openSqlite(':memory:');
  for (const name of readdirSync('drizzle').filter(n => n.endsWith('.sql')).sort()) db.sqlite.exec(readFileSync(`drizzle/${name}`, 'utf8'));
  return db;
}
function server() {
  return createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false, watch: null }, plugins: [{
    name: 'launch-fixtures', enforce: 'pre', transform(_code, id) {
      if (id.endsWith('/db/index.ts')) return 'export const getD1 = async () => globalThis.__launchDb;';
      if (id.endsWith('/app/lib/supabase-auth.ts')) return `export async function getAuthenticatedUser(r, options) {
        if (!options?.includeDeleting) throw new Error('Deletion must allow authenticated retries');
        const id=r.headers.get('x-test-user'); return id ? {id,email:id+'@example.test',authenticatedAt:Date.now()/1000-Number(r.headers.get('x-login-age')??0)} : null;
      }`;
    },
  }] });
}

test('shared provider gate allows exactly 200 concurrent calls, counts failed attempts, persists across module reloads and fails closed', async () => {
  const db = fixture(), vite = await server();
  globalThis.__launchDb = db;
  const oldFetch = globalThis.fetch, oldLimit = process.env.LESELAUT_AI_DAILY_CALL_LIMIT, oldEnabled = process.env.LESELAUT_AI_ENABLED;
  delete process.env.LESELAUT_AI_DAILY_CALL_LIMIT; delete process.env.LESELAUT_AI_ENABLED;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('', { status: 503 }); };
  try {
    const { providerFetch } = await vite.ssrLoadModule('/app/api/tutor/_usage.ts');
    const results = await Promise.allSettled(Array.from({ length: 250 }, () => providerFetch('https://provider.example.test', { method: 'POST' })));
    assert.equal(calls, 200);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 200);
    assert.ok(results.filter(r => r.status === 'rejected').every(r => r.reason.status === 429));
    assert.equal((await db.prepare('SELECT calls FROM ai_provider_usage').first()).calls, 200);
    vite.moduleGraph.invalidateAll();
    const reloaded = await vite.ssrLoadModule('/app/api/tutor/_usage.ts');
    await assert.rejects(reloaded.providerFetch('https://provider.example.test', {}), e => e.status === 429);
    assert.equal(calls, 200, 'module or process restarts must not reset the allowance');
    await db.prepare('UPDATE ai_provider_usage SET day = ?').bind('2000-01-01').run();
    assert.equal((await providerFetch('https://provider.example.test', {})).status, 503, 'a new UTC day has a separate allowance');
    for (const limit of ['0', '-1', 'bad', '999999999999999999999999']) {
      process.env.LESELAUT_AI_DAILY_CALL_LIMIT = limit;
      await assert.rejects(providerFetch('https://provider.example.test', {}), e => e.status === 429);
    }
    process.env.LESELAUT_AI_DAILY_CALL_LIMIT = '200'; process.env.LESELAUT_AI_ENABLED = '0';
    await assert.rejects(providerFetch('https://provider.example.test', {}), e => e.status === 429);
    assert.equal(calls, 201, 'disabled or invalid limits never contact a provider');
    delete process.env.LESELAUT_AI_ENABLED;
    globalThis.__launchDb = { prepare() { throw new Error('private database failure'); } };
    await assert.rejects(providerFetch('https://provider.example.test', {}));
    assert.equal(calls, 201, 'a broken quota database must never permit unmetered calls');
    for (const name of ['app/api/tutor/_shared.ts','app/api/tutor/_photo.ts','app/api/tutor/_dialogue.ts','app/api/active-learning/translation/_ai.ts']) {
      assert.doesNotMatch(readFileSync(name, 'utf8'), /await fetch\(/, `${name} must use the metered transport`);
    }
  } finally {
    globalThis.fetch = oldFetch;
    if (oldLimit === undefined) delete process.env.LESELAUT_AI_DAILY_CALL_LIMIT; else process.env.LESELAUT_AI_DAILY_CALL_LIMIT = oldLimit;
    if (oldEnabled === undefined) delete process.env.LESELAUT_AI_ENABLED; else process.env.LESELAUT_AI_ENABLED = oldEnabled;
    await vite.close(); db.close(); delete globalThis.__launchDb;
  }
});

test('account deletion requires a recent verified identity and confirmation, isolates owners, survives provider failure and rejects stale writes', async () => {
  const db = fixture(), vite = await server(); globalThis.__launchDb = db;
  const oldSecret = process.env.SUPABASE_SECRET_KEY, oldFetch = globalThis.fetch, oldError = console.error;
  let providerCalls = 0, fail = false; const logs = [];
  console.error = value => logs.push(value);
  globalThis.fetch = async (url, init) => {
    providerCalls++; assert.match(url, /\/auth\/v1\/admin\/users\/(alice|charlie)$/);
    assert.equal(init.method, 'DELETE'); assert.equal(init.headers.apikey, 'server-test-secret');
    return Response.json({}, { status: fail ? 503 : 200 });
  };
  function seed(id) {
    db.sqlite.prepare('INSERT INTO users(id,email,display_name) VALUES(?,?,?)').run(id, `${id}@example.test`, id);
    db.sqlite.prepare('INSERT INTO user_progress(user_id,scope,data) VALUES(?,?,?)').run(id, 'grammar', '{}');
    db.sqlite.prepare('INSERT INTO tutor_sessions VALUES(?,?,?,?,?)').run(id, 'task', '{"draft":"private"}', 1, '2026-10-23');
    db.sqlite.prepare('INSERT INTO tutor_quotas(user_id,day,used,generated,checked) VALUES(?,?,?,?,?)').run(id, '2026-10-23', 7, 4, 3);
  }
  for (const id of ['alice', 'bob', 'charlie']) seed(id);
  try {
    const { POST } = await vite.ssrLoadModule('/app/api/account/delete/route.ts');
    const request = (id, body = {}, headers = {}) => new Request('https://site.example.test/api/account/delete', { method: 'POST', headers: { 'content-type': 'application/json', ...(id ? { 'x-test-user': id } : {}), ...headers }, body: JSON.stringify({ confirmation: 'DELETE', email: `${id}@example.test`, userId: 'bob', ...body }) });
    assert.equal((await POST(request())).status, 401);
    assert.equal((await POST(request('alice', { confirmation: 'delete' }))).status, 400);
    assert.equal((await POST(request('alice', { email: 'bob@example.test' }))).status, 400);
    assert.equal((await POST(request('alice', {}, { origin: 'https://evil.example.test' }))).status, 403);
    delete process.env.SUPABASE_SECRET_KEY;
    assert.equal((await POST(request('alice'))).status, 503);
    const proxied = new Request('http://site.example.test/api/account/delete', { method: 'POST', headers: { 'x-test-user': 'alice', origin: 'https://site.example.test', 'x-forwarded-proto': 'https', 'content-type': 'application/json' }, body: JSON.stringify({ confirmation: 'DELETE', email: 'alice@example.test' }) });
    assert.equal((await POST(proxied)).status, 503, 'TLS termination must not reject a legitimate deletion request');
    assert.equal((await POST(request('alice', {}, { origin: 'https://leselaut-german.professor-ut7.chatgpt.site' }))).status, 503, 'the compatibility proxy must remain supported');
    assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM account_deletions').get().n, 0, 'missing configuration cannot partially delete an account');
    process.env.SUPABASE_SECRET_KEY = 'server-test-secret';
    assert.equal((await POST(request('alice', {}, { 'x-login-age': '601' }))).status, 403);
    assert.equal(providerCalls, 0);
    const deleted = await POST(request('alice'));
    assert.equal(deleted.status, 200); assert.equal((await deleted.json()).status, 'complete');
    for (const [table, column] of [['users','id'],['user_progress','user_id'],['tutor_sessions','user_id'],['tutor_quotas','user_id']]) {
      assert.equal(db.sqlite.prepare(`SELECT count(*) AS n FROM ${table} WHERE ${column} = ?`).get('alice').n, 0);
      assert.equal(db.sqlite.prepare(`SELECT count(*) AS n FROM ${table} WHERE ${column} = ?`).get('bob').n, 1, 'a client-supplied ID cannot delete another learner');
    }
    assert.throws(() => seed('alice'), /account_deleted/);
    assert.throws(() => db.sqlite.prepare('INSERT INTO tutor_sessions VALUES(?,?,?,?,?)').run('alice','late','{}',1,'now'), /account_deleted/);
    assert.throws(() => db.sqlite.prepare('INSERT INTO tutor_quotas(user_id,day,used) VALUES(?,?,1)').run('alice','2026-10-24'), /account_deleted/);
    fail = true;
    const pending = await POST(request('charlie'));
    assert.equal(pending.status, 202); assert.equal((await pending.json()).status, 'pending');
    assert.equal(db.sqlite.prepare('SELECT status FROM account_deletions WHERE user_id=?').get('charlie').status, 'pending');
    assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM tutor_sessions WHERE user_id=?').get('charlie').n, 0);
    fail = false;
    assert.equal((await POST(request('charlie', {}, { 'x-login-age': '700' }))).status, 200, 'a durable pending deletion can be retried');
    assert.equal(db.sqlite.prepare('SELECT status FROM account_deletions WHERE user_id=?').get('charlie').status, 'complete');
    assert.deepEqual(logs, ['{"event":"account_deletion_pending"}']);
    assert.match(deleted.headers.get('cache-control'), /private, no-store/);
  } finally {
    globalThis.fetch = oldFetch; console.error = oldError;
    if (oldSecret === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldSecret;
    await vite.close(); db.close(); delete globalThis.__launchDb;
  }
});

test('deletion transaction rolls back on a purge failure and does not call the identity provider', async () => {
  const db = fixture(), vite = await server(); globalThis.__launchDb = db;
  const oldFetch = globalThis.fetch; let calls = 0; globalThis.fetch = async () => { calls++; return Response.json({}); };
  db.sqlite.exec("CREATE TRIGGER fail_purge BEFORE DELETE ON tutor_sessions BEGIN SELECT RAISE(ABORT, 'simulated'); END;");
  db.sqlite.prepare('INSERT INTO tutor_sessions VALUES(?,?,?,?,?)').run('alice','task','{}',1,'now');
  try {
    const { deleteAccount } = await vite.ssrLoadModule('/app/lib/account-deletion.ts');
    await assert.rejects(deleteAccount(db, 'alice', 'server-test-secret'));
    assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM account_deletions').get().n, 0);
    assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM tutor_sessions').get().n, 1);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = oldFetch; await vite.close(); db.close(); delete globalThis.__launchDb; }
});
