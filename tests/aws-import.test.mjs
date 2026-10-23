import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {DatabaseSync,backup} from 'node:sqlite';
import {applyMigrations} from '../deploy/aws/migrate.mjs';
import {importSnapshot} from '../deploy/aws/import-snapshot.mjs';
import {execFileSync} from 'node:child_process';

test('AWS snapshot import preserves every column, refuses live overwrites and restores a consistent backup',async t=>{
  const root=mkdtempSync(join(tmpdir(),'leselaut-import-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  const source=join(root,'source.sqlite'),target=join(root,'target.sqlite');
  applyMigrations(source,'drizzle');applyMigrations(target,'drizzle');
  const original=new DatabaseSync(source);
  original.prepare('INSERT INTO users(id,email,display_name,username) VALUES(?,?,?,?)').run('supabase-subject','learner@example.test','Grüße','learner');
  original.prepare('INSERT INTO user_progress(user_id,scope,data) VALUES(?,?,?)').run('supabase-subject','stories',JSON.stringify({completed:['reading-b1-01-v1'],saved:'ä'.repeat(10000)}));
  original.prepare('INSERT INTO tutor_sessions VALUES(?,?,?,?,?)').run('supabase-subject','task','{"draft":"Öffnen"}',7,'2026-10-23');
  original.prepare('INSERT INTO tutor_quotas VALUES(?,?,?)').run('supabase-subject','2026-10-23',19);
  const names=['users','user_progress','tutor_sessions','tutor_quotas'];
  const snapshot={version:1,tables:Object.fromEntries(names.map(name=>[name,original.prepare(`SELECT * FROM ${name}`).all().map(r=>({...r}))]))};original.close();
  const result=importSnapshot(target,snapshot);assert.deepEqual(Object.values(result.counts),[1,1,1,1]);
  assert.throws(()=>importSnapshot(target,snapshot),/populated learner database/);
  const db=new DatabaseSync(target);for(const name of names)assert.deepEqual(db.prepare(`SELECT * FROM ${name}`).all().map(r=>({...r})),snapshot.tables[name]);
  const restored=join(root,'restored.sqlite');await backup(db,restored);db.close();
  const recovery=new DatabaseSync(restored);for(const name of names)assert.deepEqual(recovery.prepare(`SELECT * FROM ${name}`).all().map(r=>({...r})),snapshot.tables[name]);recovery.close();
  const bad=structuredClone(snapshot);bad.tables.users[0].unexpected='field';
  const empty=join(root,'bad.sqlite');applyMigrations(empty,'drizzle');assert.throws(()=>importSnapshot(empty,bad),/Unexpected schema/);
  const rolledBack=new DatabaseSync(empty);assert.equal(rolledBack.prepare('SELECT count(*) AS n FROM users').get().n,0);rolledBack.close();
});

test('a renamed AWS import helper executes its CLI and verifies the persisted learner',t=>{
  const root=mkdtempSync(join(tmpdir(),'leselaut-import-cli-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  const filename=join(root,'learners.sqlite');applyMigrations(filename,'drizzle');
  const helper=join(root,'renamed-import-helper.mjs');copyFileSync('deploy/aws/import-snapshot.mjs',helper);
  const snapshot={version:1,tables:{users:[{id:'subject',email:'learner@example.test',display_name:'Grüße',created_at:'2026-10-23',updated_at:'2026-10-23',username:'learner'}],user_progress:[],tutor_sessions:[],tutor_quotas:[]}};
  const output=execFileSync(process.execPath,[helper],{input:JSON.stringify(snapshot),encoding:'utf8',env:{...process.env,LESELAUT_SQLITE_PATH:filename},stdio:['pipe','pipe','pipe']});
  assert.equal(JSON.parse(output).counts.users,1);
  const db=new DatabaseSync(filename,{readOnly:true});
  assert.equal(db.prepare('SELECT display_name FROM users WHERE id=?').get('subject').display_name,'Grüße');db.close();
});
