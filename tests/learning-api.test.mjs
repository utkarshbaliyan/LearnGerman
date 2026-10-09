import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

test('fresh mistake reviews enforce account ownership, source validity, spacing, help history and existing quotas', async () => {
  const db = new DatabaseSync(':memory:'); db.exec(readFileSync('drizzle/0002_legal_nehzno.sql', 'utf8'));
  globalThis.__learningTestDb = { prepare(sql) { return { bind(...args) { return { async first() { return db.prepare(sql).get(...args) ?? null; }, async all() { return { results: db.prepare(sql).all(...args) }; }, async run() { return { meta: { changes: Number(db.prepare(sql).run(...args).changes) } }; } }; } }; } };
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false }, plugins: [{ name: 'learning-test-auth', enforce: 'pre', transform(code, id) {
    if (id.endsWith('/app/api/active-learning/translation/route.ts') || id.endsWith('/app/api/learning/memory/route.ts')) return code.replace("import { getD1 } from '@/db';", 'const getD1 = async () => globalThis.__learningTestDb;').replace("import { getAuthenticatedUser } from '@/app/lib/supabase-auth';", "const getAuthenticatedUser = async r => r.headers.get('x-test-user') ? { id: r.headers.get('x-test-user') } : null;");
  } }] });
  const oldFetch = globalThis.fetch, oldKey = process.env.GROQ_API_KEY; process.env.GROQ_API_KEY = 'test-key';
  const inputs = []; let generated = 0;
  globalThis.fetch = async (_url, init) => {
    const task = JSON.parse(JSON.parse(init.body).messages[1].content); inputs.push(task);
    const result = task.count ? { sentences: [`She sells ${++generated} apples.`] } : { feedback: task.items.map(item => ({ number: item.number, verdict: 'correct', correctTranslation: 'Sie verkauft Äpfel.', explanation: 'Your sentence works.', corrections: [] })) };
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(result) } }] });
  };
  const DAY = 86400000, at = new Date(Date.now() - 8 * DAY).toISOString();
  const source = { exerciseId: 'translation-source-memory-01', checkId: 'source-check-memory-01', number: 1 };
  const session = { kind: 'translation-v1', level: 'A1', count: 1, createdAt: at, draftUpdatedAt: at, sentences: ['She buys bread.'], answers: ['Sie kaufen Brot.'], operations: [], checks: [{ id: source.checkId, createdAt: at, answers: ['Sie kaufen Brot.'], feedback: [{ number: 1, verdict: 'needs_work', correctTranslation: 'Sie kauft Brot.', explanation: 'Check agreement.', corrections: [{ original: 'kaufen', corrected: 'kauft', explanation: 'Singular sie uses the verb ending -t.', category: 'grammar', kind: 'error' }] }] }] };
  db.prepare('INSERT INTO tutor_sessions(user_id,task_id,data,version,updated_at) VALUES(?,?,?,?,?)').run('alice', source.exerciseId, JSON.stringify(session), 1, at);
  const quota = () => db.prepare('SELECT used FROM tutor_quotas WHERE user_id=?').get('alice')?.used ?? 0;
  try {
    const api = await vite.ssrLoadModule('/app/api/active-learning/translation/route.ts');
    const memory = await vite.ssrLoadModule('/app/api/learning/memory/route.ts');
    const post = (body, user = 'alice') => api.POST(new Request('http://local/api/active-learning/translation', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-user': user }, body: JSON.stringify(body) }));
    const getMemory = user => memory.GET(new Request('http://local/api/learning/memory', { headers: user ? { 'x-test-user': user } : {} }));
    const generate = { action: 'generate', level: 'A1', count: 1, requestId: 'memory-review-generate-01', learning: { reviewSource: source } };
    assert.equal((await getMemory()).status, 401);
    assert.deepEqual((await (await getMemory('bob')).json()).reviews, []);
    assert.equal((await post(generate, 'bob')).status, 404);
    assert.equal((await post({ ...generate, level: 'B2' })).status, 400);
    assert.equal(quota(), 0);
    let response = await post(generate); assert.equal(response.status, 200); let record = await response.json();
    assert.equal(record.session.learning.pattern, 'verb-agreement');
    assert.ok(inputs[0].avoid.includes('She buys bread.'));
    assert.equal(inputs[0].focus.pattern, 'Subject–verb agreement');
    assert.equal(quota(), 1);
    const unchecked = await getMemory('alice'); assert.equal(unchecked.status, 200);
    assert.equal((await unchecked.json()).reviews[0].attempts, 0, 'generated but unchecked reviews do not break or inflate memory');
    assert.equal((await post(generate)).status, 200); assert.equal(quota(), 1, 'retry does not consume quota');
    response = await post({ action: 'draft', exerciseId: record.exerciseId, version: record.version, answers: ['Sie verkauft Äpfel.'], usedHelp: true }); record = await response.json();
    assert.equal(record.session.helpUsed, true);
    response = await post({ action: 'check', exerciseId: record.exerciseId, version: record.version, answers: ['Sie verkauft Äpfel.'], requestId: 'memory-review-check-01', usedHelp: false }); record = await response.json();
    assert.equal(record.session.checks[0].usedHelp, true, 'a known hint cannot be erased by unchecking the report');
    assert.equal((await (await getMemory('alice')).json()).delayed.total, 0);
    assert.equal((await post({ ...generate, requestId: 'memory-review-too-soon' })).status, 400);
    assert.equal(quota(), 2, 'a review before its next due date does not reserve quota');
    const other = { ...source, exerciseId: 'translation-source-memory-02' };
    db.prepare('INSERT INTO tutor_sessions(user_id,task_id,data,version,updated_at) VALUES(?,?,?,?,?)').run('alice', other.exerciseId, JSON.stringify(session), 1, at);
    response = await post({ ...generate, requestId: 'memory-review-generate-02', learning: { reviewSource: other } }); record = await response.json();
    response = await post({ action: 'check', exerciseId: record.exerciseId, version: record.version, answers: ['Sie verkauft Äpfel.'], requestId: 'memory-review-check-02', usedHelp: false }); record = await response.json();
    assert.equal(record.session.checks[0].usedHelp, false);
    assert.deepEqual((await (await getMemory('alice')).json()).delayed, { correct: 1, total: 1 });
    response = await post({ action: 'check', exerciseId: record.exerciseId, version: record.version, answers: ['Sie verkauft heute Äpfel.'], requestId: 'memory-review-revision-02', usedHelp: false }); record = await response.json();
    assert.equal(record.session.checks.at(-1).usedHelp, true, 'revisions always remain assisted');
    assert.deepEqual((await (await getMemory('alice')).json()).delayed, { correct: 1, total: 1 }, 'revisions do not inflate delayed scores');
    const leaked = await getMemory('bob'); assert.equal((await leaked.json()).delayed.total, 0);
    assert.match(leaked.headers.get('cache-control'), /private, no-store/);
  } finally { globalThis.fetch = oldFetch; if (oldKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldKey; delete globalThis.__learningTestDb; db.close(); await vite.close(); }
});
