import { getD1 } from '@/db';
import { getAuthenticatedUser } from '@/app/lib/supabase-auth';
import { deriveActiveProgress, type ProgressRow } from '@/app/lib/active-progress';
export async function GET(request: Request) {
 const headers = { 'cache-control': 'no-store' };
 const user = await getAuthenticatedUser(request);
 if (!user) return Response.json({ error: 'Sign in to save your course progress.' }, { status: 401, headers });
 try {
  const db = await getD1();
  const rows = await db.prepare(`WITH assessed AS (
   SELECT task_id, j.value AS attempt,
    row_number() OVER (PARTITION BY task_id ORDER BY json_extract(j.value, '$.createdAt') DESC, CAST(j.key AS INTEGER) DESC) AS rank
   FROM tutor_sessions, json_each(tutor_sessions.data, '$.attempts') AS j
   WHERE user_id = ? AND (task_id LIKE 'active-%' OR task_id LIKE 'speaking-drill:active-%')
   AND json_extract(j.value, '$.status') = 'complete'
  ) SELECT task_id AS taskId, count(*) AS attempts,
   max(CASE WHEN rank = 1 AND json_extract(attempt, '$.feedback.development.sufficient') = 1 THEN 1 ELSE 0 END) AS accepted,
   max(CASE WHEN rank = 1 AND json_extract(attempt, '$.feedback.taskSuccess') = 1 THEN 1 ELSE 0 END) AS successful,
   max(json_extract(attempt, '$.createdAt')) AS updatedAt,
   min(CASE WHEN json_extract(attempt, '$.feedback.development.sufficient') = 1 THEN json_extract(attempt, '$.createdAt') END) AS firstCheckedAt
   FROM assessed GROUP BY task_id`).bind(user.id).all<ProgressRow>();
  return Response.json({ userId: user.id, progress: deriveActiveProgress(rows.results) }, { headers });
 } catch { return Response.json({ error: 'Progress could not be loaded. Your saved work has not been changed.' }, { status: 503, headers }); }
}
