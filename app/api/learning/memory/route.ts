import { getD1 } from '@/db';
import { getAuthenticatedUser } from '@/app/lib/supabase-auth';
import { buildTranslationMemory } from '@/app/lib/translation-memory';
import type { TranslationRecord } from '@/app/lib/translation-practice';
const headers = { 'cache-control': 'private, no-store' };
export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Sign in to review past translation mistakes.' }, { status: 401, headers });
  const owner = request.headers.get('x-translation-owner');
  if (owner && owner !== user.id) return Response.json({ error: 'Account changed. Reload your practice.' }, { status: 409, headers });
  try {
    const db = await getD1();
    const rows = await db.prepare("SELECT task_id, json_object('kind', 'translation-v1', 'level', json_extract(data, '$.level'), 'learning', json_extract(data, '$.learning'), 'checks', CASE WHEN json_array_length(data, '$.checks') > 0 THEN json_array(json_extract(data, '$.checks[0]'), json_extract(data, '$.checks[#-1]')) ELSE json('[]') END) AS data, version FROM tutor_sessions WHERE user_id = ? AND task_id LIKE 'translation-%' AND json_extract(data, '$.kind') = 'translation-v1' ORDER BY updated_at DESC LIMIT 200").bind(user.id).all<{ task_id: string; data: string; version: number }>();
    const records = rows.results.flatMap(r => { try { return [{ exerciseId: r.task_id, version: r.version, session: JSON.parse(r.data) } as TranslationRecord]; } catch { return []; } });
    return Response.json({ ...buildTranslationMemory(records), userId: user.id, historyLimit: 200 }, { headers });
  } catch { return Response.json({ error: 'Your mistake review could not load. Try again.' }, { status: 503, headers }); }
}
