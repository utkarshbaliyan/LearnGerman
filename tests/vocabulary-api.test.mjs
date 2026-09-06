import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

test("vocabulary API persists schedules, merges concurrent browsers, and isolates accounts", async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("CREATE TABLE user_progress (user_id TEXT NOT NULL, scope TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, scope))");
  const db = drizzle(async (sql, params, method) => {
    // Yield to force simultaneous PUT requests to read the same earlier document.
    await new Promise((resolve) => setImmediate(resolve));
    const stmt = sqlite.prepare(sql);
    if (method === "run") { stmt.run(...params); return { rows: [] }; }
    stmt.setReturnArrays(true);
    return { rows: method === "get" ? stmt.get(...params) : stmt.all(...params) };
  });
  globalThis.__vocabularyTestDb = db;
  const vite = await createServer({
    root, configFile: false, appType: "custom", resolve: { alias: { "@": root } }, server: { middlewareMode: true, ws: false },
    plugins: [{ name: "isolated-account-fixtures", enforce: "pre",
      resolveId(id) { if (id.startsWith("test-vocabulary:")) return `\0${id}`; },
      load(id) {
        if (id === "\0test-vocabulary:db") return "export const getDb = async () => globalThis.__vocabularyTestDb;";
        if (id === "\0test-vocabulary:auth") return "export const getAuthenticatedUser = async (request) => request.headers.get('x-test-user') ? { id: request.headers.get('x-test-user') } : null;";
        if (id === "\0test-vocabulary:account") return "export const ensureAccount = async () => {};";
      },
      transform(code, id) {
        if (id.endsWith("/app/api/progress/route.ts")) return code.replace('"@/db"', '"test-vocabulary:db"')
          .replace('"@/app/lib/supabase-auth"', '"test-vocabulary:auth"').replace('"@/app/lib/account-db"', '"test-vocabulary:account"');
      },
    }],
  });
  try {
    const api = await vite.ssrLoadModule("/app/api/progress/route.ts");
    const p = { ...await vite.ssrLoadModule("/app/lib/progress-sync.ts"), ...await vite.ssrLoadModule("/app/lib/flashcard-progress.ts") };
    const a = { german: "lernen", english: "to learn" }, b = { german: "gehen", english: "to go" };
    const put = (user, data, scope = "vocabulary") => api.PUT(new Request("http://localhost/api/progress", { method: "PUT", headers: { "content-type": "application/json", ...(user ? { "x-test-user": user } : {}) }, body: JSON.stringify({ scope, data }) }));
    const get = async (user) => (await api.GET(new Request("http://localhost/api/progress", { headers: { "x-test-user": user } }))).json();
    assert.equal((await put(null, {})).status, 401);
    const old = p.setVocabularyStatus(p.emptyVocabularyProgress(), a, "learned", 100);
    assert.equal((await put("alice", old)).status, 200);
    const schedule = p.scheduleVocabularyReview(old, a, 4320, 200);
    const otherTab = p.setVocabularyStatus(old, b, "learned", 300);
    const responses = await Promise.all([put("alice", schedule), put("alice", otherTab)]);
    assert.ok(responses.every((response) => response.status === 200));
    let saved = (await get("alice")).progress.vocabulary;
    assert.equal(p.isVocabularyReview(saved, a), true);
    assert.equal(p.isVocabularyLearned(saved, b), true);
    assert.equal(p.vocabularyReviewDueAt(saved, a), 200 + 4320 * 60000);
    assert.deepEqual((await get("bob")).progress, {});
    const concurrentCourse = await Promise.all([
      put("alice", { chapters: { "a1-1-1": { completed: true, skillScores: { reading: 90 } } } }, "course"),
      put("alice", { chapters: { "a1-1-2": { skillScores: { writing: 80 } } } }, "course"),
    ]);
    assert.ok(concurrentCourse.every((r) => r.status === 200));
    let all = (await get("alice")).progress;
    assert.equal(all.course.chapters["a1-1-1"].completed, true);
    assert.equal(all.course.chapters["a1-1-2"].skillScores.writing, 80);
    const concurrentGrammar = await Promise.all([
      put("alice", { completed: ["lesson-a"], scores: { "lesson-a": 90 }, sets: { "lesson-a": { one: 90 } } }, "grammar"),
      put("alice", { completed: ["lesson-b"], scores: { "lesson-a": 60 }, sets: { "lesson-a": { two: 80 } } }, "grammar"),
    ]);
    assert.ok(concurrentGrammar.every((r) => r.status === 200));
    all = (await get("alice")).progress;
    assert.deepEqual(new Set(all.grammar.completed), new Set(["lesson-a", "lesson-b"]));
    assert.deepEqual(all.grammar.sets["lesson-a"], { one: 90, two: 80 });
    assert.equal(all.grammar.scores["lesson-a"], 90);
    await put("alice", ["story-a"], "stories");
    await put("alice", { entries: { "story-a": { completed: false, updatedAt: 20 }, "story-b": { completed: true, updatedAt: 10 } } }, "stories");
    await put("alice", ["story-a"], "stories");
    all = (await get("alice")).progress;
    assert.equal(all.stories.entries["story-a"].completed, false);
    assert.equal(all.stories.entries["story-b"].completed, true);
    assert.deepEqual((await get("bob")).progress, {});
    assert.equal((await api.PUT(new Request("http://localhost/api/progress", { method: "PUT", headers: { "x-test-user": "bob", "x-progress-owner": "alice" }, body: JSON.stringify({ scope: "course", data: {} }) }))).status, 409);
    assert.equal((await put("alice", old)).status, 200);
    saved = (await get("alice")).progress.vocabulary;
    assert.equal(p.isVocabularyReview(saved, a), true, "stale client cannot replace newer review state");
    assert.equal((await put("alice", p.setVocabularyStatus(saved, a, "learned", 400))).status, 200);
    assert.equal(p.isVocabularyLearned((await get("alice")).progress.vocabulary, a), true);
    const rated = p.rateVocabularyFlashcard(saved, a, 3, 500);
    assert.equal((await put("alice", rated)).status, 200);
    const freshBrowser = (await get("alice")).progress.vocabulary;
    assert.deepEqual(freshBrowser.cards[p.vocabularyCardKey(a)], rated.cards[p.vocabularyCardKey(a)]);
    const secondRating = p.rateVocabularyFlashcard(freshBrowser, a, 3, p.vocabularyReviewDueAt(freshBrowser, a));
    assert.equal((await put("alice", secondRating)).status, 200);
    assert.equal((await get("alice")).progress.vocabulary.cards[p.vocabularyCardKey(a)].memory.reps, 2);
    const streakRun = p.recordVocabularyGuess(secondRating, b, true, 700000);
    assert.equal((await put("alice", streakRun)).status, 200);
    assert.deepEqual((await get("alice")).progress.vocabulary.guessStreak, streakRun.guessStreak);
    const mistake = p.recordVocabularyGuess(streakRun, a, false, 800000);
    assert.equal((await put("alice", mistake)).status, 200);
    assert.equal((await put("alice", streakRun)).status, 200);
    assert.deepEqual((await get("alice")).progress.vocabulary.guessStreak, { current: 0, best: 1, updatedAt: 800000 });
    assert.deepEqual((await get("bob")).progress, {});
  } finally {
    await vite.close();
    sqlite.close();
    delete globalThis.__vocabularyTestDb;
  }
});
