import {getD1} from '@/db';

export const dynamic = 'force-dynamic';
const headers = {'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff'};
const tables = ['users', 'user_progress', 'tutor_sessions', 'tutor_quotas'];

// Disabled unless the owner sets a short-lived token hash AND expiry. This
// exports a consistent read-only snapshot, never secrets or arbitrary SQL.
export async function POST(request: Request) {
  const expected = process.env.LESELAUT_EXPORT_TOKEN_SHA256;
  const expires = Date.parse(process.env.LESELAUT_EXPORT_EXPIRES ?? '');
  if (!expected || !/^[a-f0-9]{64}$/.test(expected) || !Number.isFinite(expires) || expires <= Date.now())
    return new Response(null, {status: 404, headers});
  const authorization = request.headers.get('authorization') ?? '';
  if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) return new Response(null, {status: 401, headers});
  const actual = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(authorization.slice(7))))]
    .map(n => n.toString(16).padStart(2, '0')).join('');
  if (actual !== expected) return new Response(null, {status: 401, headers});
  try {
    const db = await getD1();
    const snapshot = await db.batch(tables.map(table => db.prepare(`SELECT * FROM ${table}`)));
    return Response.json({version: 1, exportedAt: new Date().toISOString(),
      tables: Object.fromEntries(tables.map((name, i) => [name, snapshot[i].results]))}, {headers});
  } catch { return Response.json({error: 'Export unavailable'}, {status: 503, headers}); }
}
