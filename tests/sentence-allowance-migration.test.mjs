import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';

test('sentence allowance migration preserves learner data and shared usage, and backfills UTC attempts and revisions', () => {
  const db = new DatabaseSync(':memory:');
  try {
    for (const name of readdirSync('drizzle').filter(n => n.endsWith('.sql') && !n.startsWith('0004_')).sort()) db.exec(readFileSync(`drizzle/${name}`, 'utf8'));
    db.prepare('INSERT INTO users(id,email,display_name) VALUES(?,?,?)').run('alice','a@example.test','Alice');
    db.prepare('INSERT INTO user_progress(user_id,scope,data) VALUES(?,?,?)').run('alice','grammar','{"completed":["a1-1-2"]}');
    const operation = (action, status = 'complete', extra = {}) => ({ action, status, createdAt: '2026-10-23T23:59:00.000Z', ...extra });
    const session = { kind: 'translation-v1', count: 4, sentences: ['Keep all saved sentences'], answers: ['Keep draft'], checks: [{ feedback: 'Keep feedback' }], operations: [
      operation('generate'), operation('check'), operation('check'),
      operation('check','failed',{error:'The AI provider is busy.'}),
      operation('check','failed',{error:'Daily AI limit reached (20 requests). Try again after midnight UTC.'}),
      operation('speech'), operation('photo'),
      operation('generate','pending',{createdAt:'2026-10-24T00:00:00.000Z'}),
    ] };
    db.prepare('INSERT INTO tutor_sessions VALUES(?,?,?,?,?)').run('alice','translation-saved',JSON.stringify(session),8,'2026-10-24');
    db.prepare('INSERT INTO tutor_sessions VALUES(?,?,?,?,?)').run('alice','legacy-writing','{"draft":"Keep old writing"}',3,'2026-10-23');
    db.prepare('INSERT INTO tutor_quotas VALUES(?,?,?)').run('alice','2026-10-23',19);
    const before = Object.fromEntries(['users','user_progress','tutor_sessions'].map(table => [table, db.prepare(`SELECT * FROM ${table}`).all()]));
    db.exec(readFileSync('drizzle/0004_sentence_allowances.sql','utf8'));
    for (const [table, rows] of Object.entries(before)) assert.deepEqual(db.prepare(`SELECT * FROM ${table}`).all(), rows);
    assert.deepEqual({ ...db.prepare('SELECT used,generated,checked FROM tutor_quotas WHERE day=?').get('2026-10-23') }, { used:19, generated:4, checked:12 });
    assert.deepEqual({ ...db.prepare('SELECT used,generated,checked FROM tutor_quotas WHERE day=?').get('2026-10-24') }, { used:0, generated:4, checked:0 });
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  } finally { db.close(); }
});
