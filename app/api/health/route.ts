import { getD1 } from '@/db';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };

// A minimal readiness probe: no account data, environment values or schema details.
export async function GET() {
  try {
    const database = await getD1();
    const result = await database.prepare('SELECT 1 AS ready').first<{ ready: number }>();
    if (result?.ready !== 1) throw new Error('not ready');
    return Response.json({ status: 'ok' }, { headers });
  } catch {
    console.error('{"event":"database_unavailable"}');
    return Response.json({ status: 'unavailable' }, { status: 503, headers });
  }
}
