import { deleteAuthIdentity } from '@/deploy/aws/auth-admin.mjs';

export async function deleteAccount(db: D1Database, userId: string, secret: string) {
  if (!secret) throw new Error('Account deletion is not configured.');
  // Persist the deletion barrier and remove learner data in one transaction.
  // Database triggers reject writes from requests that were already in flight.
  await db.batch([
    db.prepare('INSERT INTO account_deletions (user_id) VALUES (?) ON CONFLICT DO NOTHING').bind(userId),
    db.prepare('DELETE FROM user_progress WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM tutor_sessions WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM tutor_quotas WHERE user_id = ?').bind(userId),
    db.prepare('DELETE FROM users WHERE id = ?').bind(userId),
  ]);
  try {
    await deleteAuthIdentity(userId, secret);
    await db.prepare("UPDATE account_deletions SET status = 'complete' WHERE user_id = ?").bind(userId).run();
    return 'complete';
  } catch {
    console.error('{"event":"account_deletion_pending"}');
    // A scheduled job retries pending identities. Never remove the barrier on
    // partial failure or claim the authentication account has already gone.
    return 'pending';
  }
}
