import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, rmSync, writeFileSync, cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {drizzle} from 'drizzle-orm/d1';
import {sql} from 'drizzle-orm';
import {openSqlite} from '../deploy/aws/sqlite.mjs';
import {applyMigrations} from '../deploy/aws/migrate.mjs';
import {mediaBucket} from '../deploy/aws/s3.mjs';

test('AWS SQLite preserves migrations, D1 results, transactions, CAS and atomic daily quotas', async t => {
  const root = mkdtempSync(join(tmpdir(), 'leselaut-aws-'));
  t.after(() => rmSync(root, {recursive:true, force:true}));
  const filename = join(root, 'learners.sqlite');
  applyMigrations(filename, 'drizzle');
  applyMigrations(filename, 'drizzle');
  const db = openSqlite(filename);
  t.after(() => db.close());
  await db.prepare('INSERT INTO users(id,email,display_name,username) VALUES(?,?,?,?)').bind('alice','alice@example.test','Alice','alice').run();
  const orm = drizzle(db);
  assert.deepEqual(await orm.all(sql`SELECT id FROM users`), [{id:'alice'}]);
  const quota = 'INSERT INTO tutor_quotas(user_id,day,used) VALUES(?,?,1) ON CONFLICT(user_id,day) DO UPDATE SET used=used+1 WHERE used < 20 RETURNING used';
  const results = await Promise.all(Array.from({length:100}, () => db.prepare(quota).bind('alice','2026-10-23').first()));
  assert.equal(results.filter(Boolean).length,20);
  assert.deepEqual(await db.prepare('SELECT used FROM tutor_quotas').raw({columnNames:true}), [['used'],[20]]);
  await assert.rejects(db.batch([
    db.prepare('INSERT INTO tutor_quotas(user_id,day,used) VALUES(?,?,?)').bind('bob','2026-10-23',1),
    db.prepare('INSERT INTO users(id,email,display_name,username) VALUES(?,?,?,?)').bind('bob','bob@example.test','Bob','alice'),
  ]));
  assert.equal(await db.prepare('SELECT used FROM tutor_quotas WHERE user_id=?').bind('bob').first(),null);
  await db.prepare('INSERT INTO user_progress(user_id,scope,data) VALUES(?,?,?)').bind('alice','grammar','{}').run();
  const update = "UPDATE user_progress SET data=? WHERE user_id='alice' AND scope='grammar' AND data='{}'";
  const edits = await Promise.all(['one','two'].map(data => db.prepare(update).bind(data).run()));
  assert.equal(edits.reduce((n,r)=>n+r.meta.changes,0),1);
  assert.equal(await db.prepare('SELECT count(*) AS n FROM users').first('n'),1);
  const migrations = join(root,'drizzle'); cpSync('drizzle',migrations,{recursive:true});
  // Use an actual applied filename so changed migrations fail closed.
  const applied = db.sqlite.prepare('SELECT name FROM _leselaut_migrations ORDER BY name LIMIT 1').get().name;
  writeFileSync(join(migrations,applied),'-- altered migration');
  assert.throws(()=>applyMigrations(filename,migrations),/Applied migration changed/);
});

test('AWS S3 adapter preserves ranges, object checksums and conditional immutable writes', async () => {
  const calls=[];
  const client={async send(command){
    calls.push(command);
    if(command.constructor.name==='GetObjectCommand')return {ContentLength:2,ETag:'"etag"',Metadata:{sha256:'hash'},Body:{transformToWebStream:()=>new Response('ab').body}};
    return {ContentLength:10,ETag:'"etag"',Metadata:{sha256:'hash'}};
  }};
  const bucket=mediaBucket('test-bucket',client);
  assert.deepEqual(await bucket.head('media'),{size:10,httpEtag:'"etag"',customMetadata:{sha256:'hash'}});
  assert.equal(await new Response((await bucket.get('media',{range:{offset:2,length:2}})).body).text(),'ab');
  assert.equal(calls[1].input.Range,'bytes=2-3');
  await bucket.put('media',new Uint8Array([1]),{onlyIf:new Headers({'If-None-Match':'*'}),sha256:new Uint8Array([2]),customMetadata:{sha256:'hash'}});
  assert.equal(calls[2].input.IfNoneMatch,'*'); assert.equal(calls[2].input.ChecksumSHA256,'Ag==');
  const missing=mediaBucket('test-bucket',{send:async()=>{throw {$metadata:{httpStatusCode:404}};}});
  assert.equal(await missing.head('missing'),null); assert.equal(await missing.get('missing'),null);
  const raced=mediaBucket('test-bucket',{send:async()=>{throw {$metadata:{httpStatusCode:412}};}});
  assert.equal(await raced.put('media','data'),null);
  const denied=mediaBucket('test-bucket',{send:async()=>{throw new Error('denied');}});
  await assert.rejects(denied.head('media'),/denied/);
});
