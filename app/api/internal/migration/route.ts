import { timingSafeEqual } from 'node:crypto';
import {getD1} from '@/db';

export const dynamic = 'force-dynamic';
const headers = {'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff'};
const tables = ['users', 'user_progress', 'tutor_sessions', 'tutor_quotas'];

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

// Disabled unless the owner sets a short-lived token hash AND expiry. This
// exports a consistent read-only snapshot, never secrets or arbitrary SQL.
export async function POST(request: Request) {
  const expected = process.env.LESELAUT_EXPORT_TOKEN_SHA256;
  const expires = Date.parse(process.env.LESELAUT_EXPORT_EXPIRES ?? '');
  if (!expected || !/^[a-f0-9]{64}$/.test(expected) || !Number.isFinite(expires) || expires <= Date.now())
    return new Response(null, {status: 404, headers});
  const authorization = request.headers.get('authorization') ?? '';
  if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) return new Response(null, {status: 401, headers});
  const actualBytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(authorization.slice(7))));
  const expectedBytes = hexToBytes(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes))
    return new Response(null, {status: 401, headers});
  try {
    const db = await getD1();
    const snapshot = await db.batch(tables.map(table => db.prepare(`SELECT * FROM ${table}`)));
    return Response.json({version: 1, exportedAt: new Date().toISOString(),
      tables: Object.fromEntries(tables.map((name, i) => [name, snapshot[i].results]))}, {headers});
  } catch { return Response.json({error: 'Export unavailable'}, {status: 503, headers}); }
}
