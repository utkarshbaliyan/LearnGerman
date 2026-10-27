// Temporary, expiring owner transfer interface. Disabled without both runtime
// settings. It never accepts SQL, credentials, arbitrary keys, or table names.
import { boundedBody } from '../../app/lib/request-body';
import { immutableMediaResponse } from '../../app/lib/book-object-media.mjs';
import { mediaRegistry as media } from './media-registry.mjs';

export const transferColumns = {
  users: ['id','email','display_name','created_at','updated_at','username'],
  user_progress: ['user_id','scope','data','updated_at'],
  tutor_sessions: ['user_id','task_id','data','version','updated_at'],
  tutor_quotas: ['user_id','day','used','generated','checked'],
  account_deletions: ['user_id','status','created_at'],
  ai_provider_usage: ['day','calls'],
};
const headers = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' };
const json = (value, status = 200) => Response.json(value, { status, headers });
const hex = value => [...new Uint8Array(value)].map(n => n.toString(16).padStart(2,'0')).join('');
export async function transferAuthorized(request, env = process.env) {
  const expected = env.LESELAUT_TRANSFER_SHA256;
  const expiry = Date.parse(env.LESELAUT_TRANSFER_EXPIRES ?? '');
  const token = request.headers.get('x-leselaut-transfer') ?? '';
  if (!/^[a-f0-9]{64}$/.test(expected ?? '') || !Number.isFinite(expiry) || expiry <= Date.now() || !/^[a-f0-9]{64}$/.test(token)) return false;
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))) === expected;
}
export async function transferDigest(tables) {
  const canonical = Object.entries(transferColumns).map(([table, fields]) => [table,
    tables[table].map(row => fields.map(field => row[field])).sort((a,b) => JSON.stringify(a)<JSON.stringify(b)?-1:JSON.stringify(a)>JSON.stringify(b)?1:0)]);
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(canonical))));
}
async function snapshot(db) {
  const names = Object.keys(transferColumns);
  const results = await db.batch(names.map(name => db.prepare(`SELECT * FROM ${name}`)));
  return Object.fromEntries(names.map((name, i) => [name, results[i].results]));
}
export async function transferResponse(request, env) {
  if (!await transferAuthorized(request)) return new Response(null, { status: 404, headers });
  const url = new URL(request.url), operation = url.searchParams.get('op');
  try {
    if (request.method === 'GET' && ['status','export'].includes(operation)) {
      const tables = await snapshot(env.DB);
      return json(operation === 'export' ? { version: 2, tables } : {
        counts: Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length])), sha256: await transferDigest(tables),
      });
    }
    if (operation === 'media') {
      const key = url.searchParams.get('key'), entry = media[key];
      if (!entry) return new Response(null, { status: 404, headers });
      if (request.method === 'PUT') {
        // The transfer token has already been checked. Reuse the bounded,
        // exact-checksum immutable upload validator with a local HMAC proof.
        const secret = request.headers.get('x-leselaut-transfer');
        const expiry = String(Math.floor(Date.now()/1000)+60);
        const signing = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', signing, new TextEncoder().encode(`PUT\n${key}\n${expiry}\n${entry.bytes}\n${entry.sha256}`));
        const signedHeaders = new Headers(request.headers);
        signedHeaders.set('x-media-expiry', expiry);
        signedHeaders.set('x-media-signature', btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''));
        request = new Request(request, { headers: signedHeaders });
        return immutableMediaResponse(request, { key, entry }, { bucket: env.BUCKET, uploadSecret: secret });
      }
      if (!['HEAD','GET'].includes(request.method)) return new Response(null, { status: 405, headers });
      return immutableMediaResponse(request, { key, entry }, { bucket: env.BUCKET });
    }
    if (request.method === 'POST' && operation === 'restore') {
      if (process.env.LESELAUT_READ_ONLY !== '1') return json({ error: 'Restore requires read-only staging.' }, 409);
      const bytes = await boundedBody(request, 2_000_000);
      if (!bytes) return json({ error: 'Snapshot exceeds the transfer limit.' }, 413);
      const value = JSON.parse(new TextDecoder().decode(bytes));
      if (value.version !== 2 || !value.tables || Object.keys(value.tables).sort().join() !== Object.keys(transferColumns).sort().join()) return json({ error: 'Invalid snapshot schema.' }, 400);
      const queries = [];
      for (const name of ['user_progress','tutor_sessions','tutor_quotas','users','account_deletions','ai_provider_usage']) queries.push(env.DB.prepare(`DELETE FROM ${name}`));
      for (const name of ['account_deletions','users','user_progress','tutor_sessions','tutor_quotas','ai_provider_usage']) {
        const fields = transferColumns[name], rows = value.tables[name];
        if (!Array.isArray(rows)) return json({ error: 'Invalid snapshot rows.' }, 400);
        for (const row of rows) {
          if (!row || Object.keys(row).sort().join() !== [...fields].sort().join() || Object.values(row).some(v => v !== null && typeof v !== 'string' && !(typeof v === 'number' && Number.isSafeInteger(v)))) return json({ error: 'Invalid snapshot row.' }, 400);
        }
        // Keep each statement below D1's parameter limit and the complete
        // atomic batch below the Free plan's per-invocation query allowance.
        const chunkSize = Math.floor(90 / fields.length);
        for (let offset=0; offset<rows.length; offset+=chunkSize) {
          const chunk = rows.slice(offset,offset+chunkSize);
          queries.push(env.DB.prepare(`INSERT INTO ${name} (${fields.join(',')}) VALUES ${chunk.map(()=>`(${fields.map(()=>'?').join(',')})`).join(',')}`).bind(...chunk.flatMap(row=>fields.map(field=>row[field]))));
        }
      }
      if (queries.length > 40) return json({ error: 'Snapshot needs a larger staged import.' }, 413);
      const names = Object.keys(transferColumns);
      const results = await env.DB.batch([...queries, ...names.map(name => env.DB.prepare(`SELECT * FROM ${name}`))]);
      const stored = Object.fromEntries(names.map((name,i) => [name, results[queries.length+i].results]));
      return json({ counts: Object.fromEntries(names.map(name=>[name,stored[name].length])), sha256: await transferDigest(stored) });
    }
    return new Response(null, { status: 404, headers });
  } catch { return json({ error: 'Transfer failed; inspect private validation results.' }, 503); }
}
