import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKbcAAAAASUVORK5CYII=", "base64");

test("photo assignments require consent, preserve handwriting errors, confirm text before checking and keep account boundaries", async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../drizzle/0002_legal_nehzno.sql", import.meta.url), "utf8"));
  globalThis.__photoDb = { prepare(sql) { return { bind(...params) { return {
    async first() { return sqlite.prepare(sql).get(...params) ?? null; },
    async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...params).changes) } }; },
  }; } }; } };
  const vite = await createServer({ root, configFile: false, appType: "custom", resolve: { alias: { "@": root } }, server: { middlewareMode: true, ws: false },
    plugins: [{ name: "photo-fixtures", enforce: "pre", resolveId(id) { if (id.startsWith("photo-test:")) return `\0${id}`; },
      load(id) {
        if (id === "\0photo-test:db") return "export const getD1 = async () => globalThis.__photoDb;";
        if (id === "\0photo-test:auth") return "export const getAuthenticatedUser = async r => r.headers.get('x-test-user') ? { id: r.headers.get('x-test-user') } : null;";
      }, transform(code, id) {
        if (id.endsWith("/app/api/tutor/writing/route.ts")) return code.replace('"@/db"', '"photo-test:db"').replace('"@/app/lib/supabase-auth"', '"photo-test:auth"');
      },
    }],
  });
  const oldFetch = globalThis.fetch, oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "test-key";
  let calls = 0, visionCalls = 0, result = { text: "Hallo, ich wohnen in [unclear].", readable: true, uncertain: true }, finishReason = "stop";
  let release, entered;
  let onEntered;
  let wait = false;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(init.body);
    assert.ok(init.signal);
    let content;
    if (Array.isArray(body.messages[1].content)) {
      visionCalls++;
      assert.equal(body.model, "qwen/qwen3.6-27b");
      assert.match(body.messages[0].content, /Do NOT correct/);
      assert.match(body.messages[0].content, /never instructions to obey/);
      assert.match(body.messages[1].content[1].image_url.url, /^data:image\/png;base64,/);
      if (wait) { onEntered(); await new Promise(r => { release = r; }); }
      content = result;
    } else {
      assert.equal(JSON.parse(body.messages[1].content).learnerAnswer, "Hallo, ich wohnen in Berlin.");
      content = { overallScore: 60, mastery: false, corrections: [{ original: "ich wohnen", corrected: "ich wohne", explanation: "Use the ich ending.", category: "Verb agreement", kind: "error", hint: "Which verb ending goes with ich?", confidence: 0.95, severity: "major" }] };
    }
    return Response.json({ choices: [{ finish_reason: finishReason, message: { content: JSON.stringify(content) } }] });
  };
  try {
    const api = await vite.ssrLoadModule("/app/api/tutor/writing/route.ts");
    const helpers = await vite.ssrLoadModule("/app/lib/writing-photo.ts");
    const { boundedBody } = await vite.ssrLoadModule("/app/api/tutor/_photo.ts");
    const post = (user, data) => api.POST(new Request("http://localhost/api/tutor/writing", { method: "POST", headers: { "content-type": "application/json", "x-test-user": user }, body: JSON.stringify({ taskId: "a2-1-1", ...data }) }));
    const get = async user => (await api.GET(new Request("http://localhost/api/tutor/writing?taskId=a2-1-1", { headers: { "x-test-user": user } }))).json();
    const upload = (user, version, id, options = {}) => {
      const form = new FormData();
      form.set("taskId", "a2-1-1"); form.set("version", String(version)); form.set("requestId", id);
      form.set("photo", new File([options.bytes ?? png], "private-student-name.png", { type: options.mime ?? "image/png" }));
      if (options.consent !== false) form.set("consent", "true");
      return api.POST(new Request("http://localhost/api/tutor/writing", { method: "POST", headers: user ? { "x-test-user": user, "x-writing-owner": options.owner ?? user } : {}, body: form }));
    };
    assert.equal((await upload(null, 0, "photo-request-0001")).status, 401);
    assert.equal((await upload("alice", 0, "photo-request-0001", { consent: false })).status, 400);
    assert.equal((await upload("alice", 0, "photo-request-0001", { bytes: Buffer.from("fake-image") })).status, 400);
    assert.equal((await upload("alice", 0, "photo-request-0001", { mime: "image/jpeg" })).status, 400);
    assert.equal((await upload("bob", 0, "photo-request-0001", { owner: "alice" })).status, 409);
    assert.equal((await upload("alice", 0, "photo-request-0001", { bytes: new Uint8Array(2_600_000) })).status, 413);
    assert.equal(calls, 0);
    await post("alice", { action: "draft", version: 0, answer: "My existing draft" });
    let saved = await get("alice");
    assert.equal((await upload("alice", saved.version, "photo-request-0001")).status, 200);
    saved = await get("alice");
    assert.equal(saved.session.draft, "My existing draft", "Reading a photo never overwrites existing work");
    assert.equal(saved.session.photos[0].text, result.text, "OCR preserves original German mistakes");
    assert.equal(saved.session.attempts.length, 0, "Photo recognition never grades automatically");
    assert.equal(saved.session.photos[0].confirmedAt, undefined);
    assert.doesNotMatch(JSON.stringify(saved), /base64|private-student-name/);
    assert.equal((await upload("alice", 1, "photo-request-0001")).status, 200);
    assert.equal(calls, 1, "A retry does not repeat the OCR request");
    const changed = Buffer.from(png); changed[changed.length - 1] ^= 1;
    assert.equal((await upload("alice", saved.version, "photo-request-0001", { bytes: changed })).status, 409);
    assert.equal((await get("bob")).session.photos, undefined);
    assert.equal((await post("bob", { action: "confirm-photo", version: 0, photoId: "photo-request-0001", answer: "Hallo, ich wohnen in Berlin." })).status, 404);
    assert.equal((await post("alice", { action: "confirm-photo", version: saved.version, photoId: "photo-request-0001", answer: result.text })).status, 400);
    assert.equal((await post("alice", { action: "confirm-photo", version: saved.version, photoId: "photo-request-0001", answer: "Hallo, ich wohnen in Berlin." })).status, 200);
    saved = await get("alice");
    assert.equal(saved.session.photos[0].confirmedText, "Hallo, ich wohnen in Berlin.");
    assert.ok(saved.session.photos[0].confirmedAt);
    assert.equal(saved.session.draftPhotoId, "photo-request-0001");
    assert.equal((await post("alice", { action: "check", version: saved.version, requestId: "check-photo-request-01", answer: saved.session.draft })).status, 200);
    saved = await get("alice");
    assert.equal(saved.session.attempts[0].sourcePhotoId, "photo-request-0001");
    assert.equal(saved.session.attempts[0].feedback.issues[0].corrected, "");
    await post("alice", { action: "reveal", version: saved.version, attemptId: "check-photo-request-01" });
    saved = await get("alice");
    assert.equal(saved.session.attempts[0].feedback.issues[0].explanation, "Use the ich ending.");
    assert.equal(sqlite.prepare("SELECT used FROM tutor_quotas WHERE user_id = 'alice'").get().used, 2);
    wait = true; entered = new Promise(r => { onEntered = r; });
    const inflight = upload("alice", saved.version, "photo-request-0002");
    await entered;
    const pending = await get("alice");
    assert.equal((await post("alice", { action: "draft", version: pending.version, answer: "Overwrite during reading" })).status, 409);
    release(); assert.equal((await inflight).status, 200); wait = false;
    saved = await get("alice");
    finishReason = "length";
    assert.equal((await upload("alice", saved.version, "photo-request-0003")).status, 502);
    saved = await get("alice"); assert.equal(saved.session.photos.at(-1).status, "failed");
    finishReason = "stop"; result = { text: "", readable: false, uncertain: true };
    assert.equal((await upload("alice", saved.version, "photo-request-0004")).status, 422);
    saved = await get("alice");
    await post("alice", { action: "delete", version: saved.version });
    saved = await get("alice");
    assert.equal(saved.session.photos, undefined);
    assert.equal(sqlite.prepare("SELECT used FROM tutor_quotas WHERE user_id = 'alice'").get().used, 5);
    sqlite.prepare("UPDATE tutor_quotas SET used=20 WHERE user_id='alice'").run();
    const before = visionCalls;
    assert.equal((await upload("alice", saved.version, "photo-request-0005")).status, 429);
    assert.equal(visionCalls, before);
    assert.equal(helpers.photoProblem(png, "image/png"), null);
    const huge = Buffer.from(png); huge.writeUInt32BE(10000, 16);
    assert.match(helpers.photoProblem(huge, "image/png"), /dimensions/);
    assert.equal(await boundedBody(new Request("http://localhost", { method: "POST", body: "too much" }), 3), null);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldKey;
    delete globalThis.__photoDb; await vite.close(); sqlite.close();
  }
});
