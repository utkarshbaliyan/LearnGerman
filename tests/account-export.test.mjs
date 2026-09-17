import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

test("account export authenticates, isolates all tables, preserves data and fails closed", async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const sqlite = new DatabaseSync(":memory:");
  for (const file of readdirSync(`${root}/drizzle`).filter((file) => file.endsWith(".sql")).sort()) {
    sqlite.exec(readFileSync(`${root}/drizzle/${file}`, "utf8"));
  }
  for (const id of ["alice", "bob"]) {
    sqlite.prepare("INSERT INTO users(id,email,username,display_name) VALUES(?,?,?,?)").run(id, `${id}@example.com`, id, id);
    sqlite.prepare("INSERT INTO user_progress(user_id,scope,data) VALUES(?,?,?)").run(id, "stories", JSON.stringify({ owner: id, completed: ["äöü"] }));
    sqlite.prepare("INSERT INTO tutor_sessions(user_id,task_id,data,version,updated_at) VALUES(?,?,?,3,?)").run(id, "writing:a2", JSON.stringify({ draft: `${id}: Grüße`, attempts: [{ feedback: "private" }] }), "2026-09-17");
    sqlite.prepare("INSERT INTO tutor_quotas(user_id,day,used) VALUES(?,?,7)").run(id, "2026-09-17");
  }
  let batches = 0, fail = false;
  globalThis.__exportDb = {
    prepare(sql) { return { bind(...params) { return { sql, params }; } }; },
    async batch(statements) {
      batches++;
      if (fail) throw new Error("sensitive database error");
      return statements.map(({ sql, params }) => ({ success: true, results: sqlite.prepare(sql).all(...params) }));
    },
  };
  const vite = await createServer({ root, configFile: false, appType: "custom", resolve: { alias: { "@": root } }, server: { middlewareMode: true, ws: false },
    plugins: [{ name: "export-boundaries", enforce: "pre", transform(_code, id) {
      if (id.endsWith("/app/lib/supabase-auth.ts")) return 'export async function getAuthenticatedUser(request) { const token = request.headers.get("authorization"); return token === "Bearer alice" ? { id: "alice" } : token === "Bearer empty" ? { id: "empty" } : null; }';
      if (id.endsWith("/db/index.ts")) return "export async function getD1() { return globalThis.__exportDb; }";
    } }],
  });
  const originalError = console.error;
  try {
    const { GET } = await vite.ssrLoadModule("/app/api/account/export/route.ts");
    const request = (token) => new Request("https://example.com/api/account/export?userId=bob", { headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), "x-user-id": "bob" } });
    for (const token of [undefined, "invalid"]) {
      const response = await GET(request(token));
      assert.equal(response.status, 401);
      assert.match(response.headers.get("cache-control"), /no-store/);
    }
    assert.equal(batches, 0, "unauthenticated requests must not access D1");
    const response = await GET(request("alice"));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-disposition"), /attachment/);
    assert.match(response.headers.get("cache-control"), /private, no-store/);
    const raw = await response.text();
    assert.equal(raw.includes("bob"), false);
    const data = JSON.parse(raw);
    assert.equal(data.version, 1);
    assert.equal(data.account.id, "alice");
    assert.equal(JSON.parse(data.progress[0].data).completed[0], "äöü");
    assert.equal(JSON.parse(data.tutorSessions[0].data).draft, "alice: Grüße");
    assert.equal(data.tutorSessions[0].version, 3);
    assert.equal(data.tutorQuotas[0].used, 7);
    const empty = await (await GET(request("empty"))).json();
    assert.equal(empty.account, null);
    assert.deepEqual([empty.progress, empty.tutorSessions, empty.tutorQuotas], [[], [], []]);
    const logs = [];
    console.error = (message) => logs.push(message);
    fail = true;
    const failed = await GET(request("alice"));
    assert.equal(failed.status, 503);
    assert.equal((await failed.text()).includes("sensitive"), false);
    assert.deepEqual(logs, ['{"event":"account_export_failed"}']);
  } finally {
    console.error = originalError;
    await vite.close(); sqlite.close(); delete globalThis.__exportDb;
  }
});
