import {DatabaseSync} from 'node:sqlite';
import {readFileSync, readdirSync, realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

export function applyMigrations(filename, directory) {
  const db = new DatabaseSync(filename);
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    db.exec('CREATE TABLE IF NOT EXISTS _leselaut_migrations (name TEXT PRIMARY KEY, sha256 TEXT NOT NULL)');
    for (const name of readdirSync(directory).filter(name => /^\d+_[\w]+\.sql$/.test(name)).sort()) {
      const sql = readFileSync(join(directory, name), 'utf8');
      const hash = createHash('sha256').update(sql).digest('hex');
      const existing = db.prepare('SELECT sha256 FROM _leselaut_migrations WHERE name=?').get(name);
      if (existing) {
        if (existing.sha256 !== hash) throw new Error(`Applied migration changed: ${name}`);
        continue;
      }
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec(sql);
        db.prepare('INSERT INTO _leselaut_migrations(name,sha256) VALUES(?,?)').run(name, hash);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    }
    if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Foreign key integrity check failed.');
  } finally { db.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  if (!process.env.LESELAUT_SQLITE_PATH) throw new Error('LESELAUT_SQLITE_PATH is required.');
  applyMigrations(process.env.LESELAUT_SQLITE_PATH, join(import.meta.dirname, 'drizzle'));
}
