import type { WritingRecord } from "@/app/lib/writing-repair";
export async function readTutorSession(db: D1Database, user: string, task: string): Promise<WritingRecord> {
  const row = await db.prepare("SELECT data, version FROM tutor_sessions WHERE user_id = ? AND task_id = ?").bind(user, task).first<{ data: string; version: number }>();
  return row ? { version: row.version, session: JSON.parse(row.data) } : { version: 0, session: { draft: "", attempts: [] } };
}
export async function saveTutorSession(db: D1Database, user: string, task: string, record: WritingRecord) {
  const result = record.version === 0
    ? await db.prepare("INSERT INTO tutor_sessions (user_id, task_id, data, version, updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT DO NOTHING").bind(user, task, JSON.stringify(record.session), new Date().toISOString()).run()
    : await db.prepare("UPDATE tutor_sessions SET data = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND task_id = ? AND version = ?").bind(JSON.stringify(record.session), new Date().toISOString(), user, task, record.version).run();
  if (!result.meta.changes) return false;
  record.version += 1;
  return true;
}
export async function reserveTutorQuota(db: D1Database, userId: string, units = 1) {
  return db.prepare("INSERT INTO tutor_quotas (user_id, day, used) VALUES (?, ?, ?) ON CONFLICT (user_id, day) DO UPDATE SET used = used + excluded.used WHERE used + excluded.used <= 20 RETURNING used").bind(userId, new Date().toISOString().slice(0, 10), units).first();
}
