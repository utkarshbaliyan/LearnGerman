import { DatabaseSync } from 'node:sqlite';
import { deleteAuthIdentity } from './auth-admin.mjs';

if (process.argv.includes('--configured')) process.exit(process.env.SUPABASE_SECRET_KEY && process.env.LESELAUT_SQLITE_PATH ? 0 : 1);

if (!process.env.SUPABASE_SECRET_KEY || !process.env.LESELAUT_SQLITE_PATH) {
  throw new Error('Account deletion worker is not configured.');
}
const db = new DatabaseSync(process.env.LESELAUT_SQLITE_PATH);
try {
  db.exec('PRAGMA busy_timeout=5000;');
  const pending = db.prepare("SELECT user_id FROM account_deletions WHERE status = 'pending' ORDER BY created_at LIMIT 50").all();
  let failed = 0;
  for (const { user_id } of pending) {
    try {
      await deleteAuthIdentity(user_id, process.env.SUPABASE_SECRET_KEY);
      db.prepare("UPDATE account_deletions SET status = 'complete' WHERE user_id = ?").run(user_id);
    } catch { failed++; }
  }
  console.log(JSON.stringify({ event: 'account_deletion_retry', processed: pending.length, failed }));
  if (failed) process.exitCode = 1;
} finally { db.close(); }
