import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

// Run SQL in workerd itself. The installed Miniflare 5 alpha's Node binding
// proxy stalls, so this test-only Worker exposes its ephemeral DB over dispatch.
// This script is never part of the application Worker or the production build.
export async function localD1() {
  const mf = new Miniflare(convertV4MiniflareOptions({
    host: '127.0.0.1', cf: false, modules: true, compatibilityDate: '2026-09-01',
    d1Databases: { DB: 'backend-test' }, d1Persist: false,
    script: `export default { async fetch(request, env) {
      const { sql, params = [], method = 'all', statements } = await request.json();
      try {
        const value = statements
          ? await env.DB.batch(statements.map(s => env.DB.prepare(s.sql).bind(...s.params)))
          : await env.DB.prepare(sql).bind(...params)[method]();
        return Response.json(value);
      } catch (error) { return Response.json({ error: String(error) }, {status: 500}); }
    } }`,
  }));
  const counts = { total: 0, writes: 0, fail: false };
  async function execute(payload) {
    if (counts.fail) throw new Error('test-sensitive-database-detail');
    counts.total++;
    if (/^\s*(INSERT|UPDATE|DELETE)/iu.test(payload.sql ?? '')) counts.writes++;
    const response = await mf.dispatchFetch('http://backend-test.local/sql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error);
    return value;
  }
  function prepared(sql, params = []) {
    return { sql, params,
      bind(...values) { return prepared(sql, values); },
      first: async () => execute({ sql, params, method: 'first' }),
      all: async () => execute({ sql, params, method: 'all' }),
      raw: async () => execute({ sql, params, method: 'raw' }),
      run: async () => execute({ sql, params, method: 'run' }),
    };
  }
  await mf.ready;
  return { db: { prepare: prepared, batch: async statements => execute({ statements }) }, counts, dispose: () => mf.dispose() };
}
