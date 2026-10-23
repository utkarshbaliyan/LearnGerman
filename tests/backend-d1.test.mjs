import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'vite';
import { localD1 } from './helpers/local-d1.mjs';

test('real local D1 serves 100 concurrent accounts without leaks, lost progress or excess quota', { timeout: 120_000 }, async () => {
  const local = await localD1();
  const { db, counts } = local;
  for (const name of readdirSync('drizzle').filter(n => n.endsWith('.sql')).sort()) {
    for (const sql of readFileSync(`drizzle/${name}`, 'utf8').split('--> statement-breakpoint').filter(s => s.trim())) await db.prepare(sql).run();
  }
  globalThis.__backendDb = db;
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null }, plugins: [{ name: 'isolated-backend-fixtures', enforce: 'pre', transform(_code, id) {
    if (id.endsWith('/app/lib/supabase-auth.ts')) return `export async function getAuthenticatedUser(r) {
      const id = r.headers.get('authorization')?.replace(/^Bearer /, '');
      return id?.startsWith('test-user-') ? { id, email: id+'@example.test', displayName: 'Shared Name', requestedUsername: 'learner' } : null;
    }`;
    if (id.endsWith('/db/index.ts')) return `import {drizzle} from 'drizzle-orm/d1'; export async function getD1(){return globalThis.__backendDb;} export async function getDb(){return drizzle(await getD1());}`;
  } }] });
  try {
    const progress = await vite.ssrLoadModule('/app/api/progress/route.ts');
    const account = await vite.ssrLoadModule('/app/api/account/route.ts');
    const exports = await vite.ssrLoadModule('/app/api/account/export/route.ts');
    const sessions = await vite.ssrLoadModule('/app/api/tutor/_sessions.ts');
    const health = await vite.ssrLoadModule('/app/api/health/route.ts');
    const request = (user, data, extra = {}) => new Request('http://test.local/api/progress?userId=test-user-999', { method: data === undefined ? 'GET' : 'PUT', headers: { ...(user ? { authorization: `Bearer ${user}` } : {}), 'content-type': 'application/json', ...extra }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    assert.equal((await progress.GET(request())).status, 401);
    assert.equal(counts.total >= 4, true);
    const before = counts.total;
    assert.equal((await progress.PUT(request('test-user-1', {scope:'invalid',data:{}}))).status, 400);
    assert.equal((await progress.PUT(request('test-user-1', {scope:'grammar',data:{}},{'x-progress-owner':'test-user-2'}))).status, 409);
    const oversized = new Request('http://test.local/api/progress', {method:'PUT',headers:{authorization:'Bearer test-user-1'},body:'x'.repeat(1_950_001)});
    assert.equal((await progress.PUT(oversized)).status, 413);
    assert.equal(counts.total, before, 'bad requests must not allocate profiles or query D1');

    const users = Array.from({length:100}, (_,i) => `test-user-${i}`);
    const profiles = await Promise.all(users.map(async user => {
      const response = await account.GET(request(user)); assert.equal(response.status,200);
      assert.match(response.headers.get('cache-control'),/private, no-store/);
      return (await response.json()).account;
    }));
    assert.equal(new Set(profiles.map(p => p.username)).size,100,'simultaneous identical names must allocate distinct usernames');
    assert.ok(profiles.every(p => p.username.length <= 24));
    const writesBefore = counts.writes;
    const latencies = []; let completed = 0;
    for (let round=0; round<5; round++) await Promise.all(users.map(async user => {
      const start=performance.now(), response=await progress.GET(request(user));
      assert.equal(response.status,200); assert.equal((await response.json()).userId,user);
      latencies.push(performance.now()-start); completed++;
    }));
    assert.equal(counts.writes,writesBefore,'500 reads must not rewrite any existing profile');
    await Promise.all(users.map(async (user,i) => {
      const start=performance.now(), response=await progress.PUT(request(user,{scope:'grammar',data:{completed:[`lesson-${i}`],scores:{},sets:{}}}));
      assert.equal(response.status,200); assert.equal((await response.json()).userId,user);
      latencies.push(performance.now()-start); completed++;
    }));
    const alice = await (await progress.GET(request(users[0]))).json();
    assert.deepEqual(alice.progress.grammar.completed,['lesson-0']);
    assert.equal(JSON.stringify(alice).includes('lesson-99'),false);
    const exported = await (await exports.GET(request(users[0]))).text();
    assert.equal(exported.includes('test-user-99'),false);

    // Ten browser tabs race on one scope. A client retries a bounded CAS conflict.
    let conflicts=0;
    await Promise.all(Array.from({length:10},(_,i) => (async()=>{
      for(let retry=0;retry<10;retry++){
        const response=await progress.PUT(request(users[0],{scope:'grammar',data:{completed:[`parallel-${i}`],scores:{},sets:{}}}));
        if(response.status===200)return;
        assert.equal(response.status,409);conflicts++;
        await new Promise(resolve=>setTimeout(resolve,5+retry*5));
      }
      assert.fail('concurrent progress did not converge');
    })()));
    const merged=await (await progress.GET(request(users[0]))).json();
    assert.equal(merged.progress.grammar.completed.length,11);

    const quota=await Promise.all(Array.from({length:100},()=>sessions.reserveTutorQuota(db,users[0])));
    assert.equal(quota.filter(Boolean).length,20);
    const double=await Promise.all(Array.from({length:30},()=>sessions.reserveTutorQuota(db,users[1],2)));
    assert.equal(double.filter(Boolean).length,10);
    await assert.rejects(()=>sessions.reserveTutorQuota(db,users[2],21),RangeError);
    assert.equal((await db.prepare('SELECT used FROM tutor_quotas WHERE user_id=?').bind(users[0]).first()).used,20);
    const day=new Date(Date.now()-86400000).toISOString().slice(0,10);
    await db.prepare('INSERT INTO tutor_quotas(user_id,day,used) VALUES(?,?,20)').bind(users[2],day).run();
    assert.ok(await sessions.reserveTutorQuota(db,users[2]),'a previous UTC day must not consume today’s allowance');

    const record=await sessions.readTutorSession(db,users[0],'test-task');
    assert.equal(await sessions.saveTutorSession(db,users[0],'test-task',record),true);
    const results=await Promise.all(['one','two'].map(draft=>sessions.saveTutorSession(db,users[0],'test-task',{version:1,session:{draft,attempts:[]}})));
    assert.equal(results.filter(Boolean).length,1,'stale tutor versions cannot overwrite the winning write');
    assert.equal((await sessions.readTutorSession(db,users[1],'test-task')).version,0,'another user cannot read the same task ID');
    const plan=await db.prepare('EXPLAIN QUERY PLAN SELECT task_id FROM tutor_sessions WHERE user_id=? ORDER BY updated_at DESC LIMIT 10').bind(users[0]).all();
    assert.match(JSON.stringify(plan.results),/tutor_sessions_user_updated_at/);
    assert.doesNotMatch(JSON.stringify(plan.results),/TEMP B-TREE/);
    assert.deepEqual((await db.prepare('PRAGMA foreign_key_check').all()).results,[]);
    assert.equal((await health.GET()).status,200);

    counts.fail=true;
    const originalError=console.error, logs=[]; console.error=value=>logs.push(value);
    try {
      for(const handler of [progress.GET,account.GET,exports.GET]){
        const response=await handler(request(users[0]));assert.equal(response.status,503);
        assert.match(response.headers.get('cache-control'),/no-store/);
        assert.equal((await response.text()).includes('test-sensitive'),false);
      }
      assert.equal((await health.GET()).status,503);
      assert.ok(logs.every(value=>!value.includes('test-sensitive')));
    }finally{console.error=originalError;counts.fail=false;}
    latencies.sort((a,b)=>a-b);
    console.log(JSON.stringify({fixture:'local workerd D1; test identities; no live users or AI calls',concurrentUsers:100,measuredRequests:completed,p50Ms:Math.round(latencies[Math.floor(latencies.length*.5)]),p95Ms:Math.round(latencies[Math.floor(latencies.length*.95)]),casConflictsRetried:conflicts}));
  }finally{await vite.close();await local.dispose();delete globalThis.__backendDb;}
});
