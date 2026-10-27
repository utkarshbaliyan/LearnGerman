import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'vite';
import { localD1 } from './helpers/local-d1.mjs';

test('Cloudflare transfer requires an expiring owner proof and restores all learner tables atomically in read-only staging', { timeout: 120_000 }, async () => {
  const local = await localD1();
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false, watch: null } });
  const keys = ['LESELAUT_TRANSFER_SHA256','LESELAUT_TRANSFER_EXPIRES','LESELAUT_READ_ONLY'];
  const before = Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  try {
    for (const name of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort()) {
      for (const sql of readFileSync(`drizzle/${name}`,'utf8').split('--> statement-breakpoint').filter(sql=>sql.trim())) await local.db.prepare(sql).run();
    }
    const { transferResponse, transferDigest } = await vite.ssrLoadModule('/deploy/cloudflare/transfer.mjs');
    const token = 'a'.repeat(64);
    const request = (op, value, proof=token) => new Request(`https://site.example/api/internal/transfer?op=${op}`, {
      method: value === undefined ? 'GET' : 'POST', headers: { 'x-leselaut-transfer': proof, 'content-type': 'application/json' },
      ...(value === undefined ? {} : { body: JSON.stringify(value) }),
    });
    delete process.env.LESELAUT_TRANSFER_SHA256;
    assert.equal((await transferResponse(request('export'), {DB:local.db})).status,404);
    process.env.LESELAUT_TRANSFER_SHA256=createHash('sha256').update(token).digest('hex');
    process.env.LESELAUT_TRANSFER_EXPIRES=new Date(Date.now()+60000).toISOString();
    assert.equal((await transferResponse(request('export',undefined,'b'.repeat(64)), {DB:local.db})).status,404);
    const tables = {
      users:[{id:'test-user',email:'learner@example.test',display_name:'Learner',created_at:'2026-01-01',updated_at:'2026-01-01',username:'learner'}],
      user_progress:[{user_id:'test-user',scope:'grammar',data:'{"completed":["test-lesson"]}',updated_at:'2026-01-01'}],
      tutor_sessions:[],tutor_quotas:[], account_deletions:[{user_id:'deleted-user',status:'complete',created_at:'2026-01-01'}],ai_provider_usage:[{day:'2026-01-01',calls:0}],
    };
    const snapshot={version:2,tables};
    process.env.LESELAUT_READ_ONLY='0';
    assert.equal((await transferResponse(request('restore',snapshot),{DB:local.db})).status,409);
    process.env.LESELAUT_READ_ONLY='1';
    assert.equal((await transferResponse(request('restore',{version:2,tables:{'users; DROP TABLE users':[]}}),{DB:local.db})).status,400);
    const response=await transferResponse(request('restore',snapshot),{DB:local.db});
    assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);
    const result=await response.json();
    assert.equal(result.sha256,await transferDigest(tables));
    assert.deepEqual(result.counts,{users:1,user_progress:1,tutor_sessions:0,tutor_quotas:0,account_deletions:1,ai_provider_usage:1});
    const bad={version:2,tables:{...tables,users:[tables.users[0],tables.users[0]]}};
    assert.equal((await transferResponse(request('restore',bad),{DB:local.db})).status,503,'duplicate identities roll back the entire transaction');
    const exported=await(await transferResponse(request('export'),{DB:local.db})).json();
    assert.equal(await transferDigest(exported.tables),result.sha256,'failed replacement preserves the prior database');
    await assert.rejects(local.db.prepare("INSERT INTO users(id,email,display_name,username) VALUES(?,?,?,?)").bind('deleted-user','gone@example.test','Gone','gone').run(),/account_deleted/);
    assert.equal((await transferResponse(request('media&key=unregistered-object'),{DB:local.db})).status,404);
    process.env.LESELAUT_TRANSFER_EXPIRES=new Date(Date.now()-1000).toISOString();
    assert.equal((await transferResponse(request('export'),{DB:local.db})).status,404);
  } finally {
    for (const key of keys) if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];
    await vite.close();await local.dispose();
  }
});
