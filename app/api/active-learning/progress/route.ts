import { getD1 } from '@/db';
import { getAuthenticatedUser } from '@/app/lib/supabase-auth';
import { deriveActiveProgress, type ProgressRow } from '@/app/lib/active-progress';
export async function GET(request: Request) {
 const headers = { 'cache-control': 'no-store' };
 const user = await getAuthenticatedUser(request);
 if (!user) return Response.json({ error: 'Sign in to save your course progress.' }, { status: 401, headers });
 try {
  const db = await getD1();
  const rows = await db.prepare(`SELECT task_id AS taskId, count(*) AS attempts,
   sum(CASE WHEN json_extract(j.value, '$.feedback.taskSuccess') = 1 AND coalesce(json_array_length(j.value, '$.disputes'), 0) = 0 THEN 1 ELSE 0 END) AS successful,
   max(json_extract(j.value, '$.createdAt')) AS updatedAt,
   min(json_extract(j.value, '$.createdAt')) AS firstCheckedAt
   FROM tutor_sessions, json_each(tutor_sessions.data, '$.attempts') AS j
   WHERE user_id = ? AND (task_id LIKE 'active-%' OR task_id LIKE 'speaking-drill:active-%')
   AND json_extract(j.value, '$.status') = 'complete' GROUP BY task_id`).bind(user.id).all<ProgressRow>();
  return Response.json({ userId: user.id, progress: deriveActiveProgress(rows.results) }, { headers });
 } catch { return Response.json({ error: 'Progress could not be loaded. Your saved work has not been changed.' }, { status: 503, headers }); }
}
