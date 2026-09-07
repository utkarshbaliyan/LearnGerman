import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

test("speaking confirms transcripts, saves goal-based turns, supports focused repair and enforces durable account quotas", async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../drizzle/0002_legal_nehzno.sql", import.meta.url), "utf8"));
  globalThis.__speakingDb = { prepare(sql) { return { bind(...params) { return {
    async first() { return sqlite.prepare(sql).get(...params) ?? null; },
    async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...params).changes) } }; },
  }; } }; } };
  const vite = await createServer({ root, configFile: false, appType: "custom", resolve: { alias: { "@": root } }, server: { middlewareMode: true, ws: false },
    plugins: [{ name: "speaking-fixtures", enforce: "pre", resolveId(id) { if (id.startsWith("speaking-test:")) return `\0${id}`; },
      load(id) {
        if (id === "\0speaking-test:db") return "export const getD1 = async () => globalThis.__speakingDb;";
        if (id === "\0speaking-test:auth") return "export const getAuthenticatedUser = async r => r.headers.get('x-test-user') ? { id: r.headers.get('x-test-user') } : null;";
      }, transform(code, id) {
        if (id.endsWith("/app/api/tutor/speaking/route.ts")) return code.replace('"@/db"', '"speaking-test:db"').replace('"@/app/lib/supabase-auth"', '"speaking-test:auth"');
      },
    }],
  });
  const originalFetch = globalThis.fetch, originalKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "test-key";
  let transcriptions = 0, replies = 0, grades = 0, failProvider = false;
  globalThis.fetch = async (url, init) => {
    if (failProvider) return Response.json({}, { status: 503 });
    if (String(url).endsWith("/audio/transcriptions")) { transcriptions++; return Response.json({ text: "Ich möchten den Termin ändern." }); }
    const payload = JSON.parse(init.body);
    assert.ok(init.signal);
    if (payload.max_completion_tokens === 700) { replies++; return Response.json({ choices: [{ message: { content: JSON.stringify({ reply: "Am Dienstag ist noch ein Termin frei. Passt Ihnen das?" }) } }] }); }
    grades++;
    return Response.json({ choices: [{ message: { content: JSON.stringify({ overallScore: 70, mastery: false, corrections: [{ original: "Ich möchten", corrected: "Ich möchte", explanation: "The subject ich takes möchte.", hint: "Check the verb ending for ich.", category: "Verb agreement", patternId: "verb-agreement", kind: "error", confidence: .95, severity: "major" }], constructionEvidence: [] }) } }] });
  };
  try {
    const api = await vite.ssrLoadModule("/app/api/tutor/speaking/route.ts");
    let sequence = 0;
    const id = () => `speaking-request-${++sequence}`;
    const post = (user, body, owner = user) => api.POST(new Request("http://localhost/api/tutor/speaking", { method: "POST", headers: { "content-type": "application/json", ...(user ? { "x-test-user": user, "x-tutor-owner": owner } : {}) }, body: JSON.stringify({ taskId: "a2-1-1", ...body }) }));
    const get = async user => (await api.GET(new Request("http://localhost/api/tutor/speaking?taskId=a2-1-1", { headers: { "x-test-user": user } }))).json();
    const transcribe = (user, version, requestId, consent = true) => {
      const form = new FormData(); form.set("taskId", "a2-1-1"); form.set("version", String(version)); form.set("requestId", requestId); form.set("consent", String(consent));
      form.set("audio", new File([new Uint8Array(200)], "recording.webm", { type: "audio/webm" }));
      return api.POST(new Request("http://localhost/api/tutor/speaking", { method: "POST", headers: { "x-test-user": user, "x-tutor-owner": user }, body: form }));
    };
    assert.equal((await post(null, { action: "start", mode: "conversation", version: 0 })).status, 401);
    assert.equal((await post("alice", { action: "start", mode: "conversation", version: 0 }, "bob")).status, 409);
    assert.equal((await post("alice", { action: "start", mode: "conversation", version: 0 })).status, 200);
    let saved = await get("alice");
    assert.equal((await transcribe("alice", saved.version, id(), false)).status, 400);
    const requestId = id();
    assert.equal((await transcribe("alice", saved.version, requestId)).status, 200);
    assert.equal((await transcribe("alice", saved.version, requestId)).status, 200);
    assert.equal(transcriptions, 1); assert.equal(grades, 0); assert.equal(replies, 0);
    saved = await get("alice");
    assert.equal(saved.session.speaking.transcript.original, "Ich möchten den Termin ändern.");
    assert.equal((await post("alice", { action: "respond", version: saved.version, requestId: id(), answer: "Ich möchten den Termin ändern.", transcriptId: requestId, confirmed: false })).status, 400);
    assert.equal((await post("bob", { action: "respond", version: 0, requestId: id(), answer: "Ich möchten den Termin ändern.", transcriptId: requestId, confirmed: true })).status, 400);
    for (let turn = 0; turn < 4; turn++) {
      if (turn > 0) { assert.equal((await transcribe("alice", saved.version, id())).status, 200); saved = await get("alice"); }
      const responseId = id();
      const body = { action: "respond", version: saved.version, requestId: responseId, answer: `Ich möchten den Termin ändern. Antwort ${turn}.`, transcriptId: saved.session.speaking.transcript.id, confirmed: true };
      assert.equal((await post("alice", body)).status, 200);
      assert.equal((await post("alice", body)).status, 200);
      saved = await get("alice");
      assert.equal(saved.session.speaking.turns.length, turn + 1);
      assert.equal(grades, turn === 3 ? 1 : 0, "Conversation feedback waits until the final turn");
    }
    assert.equal(saved.session.speaking.ended, true);
    assert.equal(saved.session.attempts.length, 1);
    assert.equal(sqlite.prepare("SELECT used FROM tutor_quotas WHERE user_id='alice'").get().used, 9);
    assert.equal((await get("bob")).session.speaking, undefined);
    await post("bob", { action: "start", mode: "focus", version: 0 });
    saved = await get("bob"); await transcribe("bob", saved.version, id()); saved = await get("bob");
    await post("bob", { action: "respond", version: saved.version, requestId: id(), answer: "Ich möchten den Termin ändern.", transcriptId: saved.session.speaking.transcript.id, confirmed: true });
    saved = await get("bob");
    assert.equal(saved.session.attempts.length, 1); assert.equal(saved.session.attempts[0].feedback.issues[0].corrected, "");
    await post("bob", { action: "reveal", version: saved.version, attemptId: saved.session.attempts[0].id });
    saved = await get("bob"); assert.equal(saved.session.attempts[0].feedback.issues[0].corrected, "Ich möchte");
    await transcribe("bob", saved.version, id()); saved = await get("bob");
    await post("bob", { action: "repair", version: saved.version, requestId: id(), answer: "Ich möchte den Termin ändern.", transcriptId: saved.session.speaking.transcript.id, confirmed: true });
    saved = await get("bob"); assert.equal(saved.session.speaking.turns.length, 1); assert.equal(saved.session.attempts.length, 2); assert.equal(saved.session.attempts[1].assistance, "correction");
    assert.equal(sqlite.prepare("SELECT used FROM tutor_quotas WHERE user_id='bob'").get().used, 5);
    const version = saved.version;
    assert.equal((await post("bob", { action: "delete", version })).status, 200);
    assert.equal((await get("bob")).session.speaking, undefined);
    assert.equal((await post("bob", { action: "start", version, mode: "focus" })).status, 409);
    saved = await get("bob"); await post("bob", { action: "start", version: saved.version, mode: "focus" }); saved = await get("bob");
    failProvider = true;
    assert.equal((await transcribe("bob", saved.version, id())).status, 502);
    saved = await get("bob"); assert.equal(saved.session.speaking.requests.at(-1).status, "failed"); failProvider = false;
    sqlite.prepare("UPDATE tutor_quotas SET used=20 WHERE user_id='bob'").run();
    assert.equal((await transcribe("bob", saved.version, id())).status, 429);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = originalKey;
    delete globalThis.__speakingDb; await vite.close(); sqlite.close();
  }
});
