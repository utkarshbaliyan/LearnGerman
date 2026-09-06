import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

test("cloud sync preserves in-flight edits, receives merged saves, and avoids save loops", async () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const values = new Map();
  const previousStorage = globalThis.localStorage, previousWindow = globalThis.window;
  globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  globalThis.window = new EventTarget();
  const vite = await createServer({ root, configFile: false, appType: "custom", resolve: { alias: { "@": root } }, server: { middlewareMode: true, ws: false },
    plugins: [{ name: "mock-network", enforce: "pre", transform(code, id) {
      if (id.endsWith("/app/lib/authenticated-fetch.ts")) return "export const authenticatedFetch = (...args) => globalThis.__syncFetch(...args);";
    } }],
  });
  let save;
  try {
    const { mergeProgress } = await vite.ssrLoadModule("/app/lib/progress-merge.ts");
    const p = await vite.ssrLoadModule("/app/lib/progress-sync.ts");
    const keys = await vite.ssrLoadModule("/app/lib/cloud-progress-keys.ts");
    save = await vite.ssrLoadModule("/app/lib/cloud-progress-save.ts");
    const { synchronizeCloudProgress } = await vite.ssrLoadModule("/app/lib/cloud-progress.ts");
    const a = { german: "lernen", english: "to learn" }, b = { german: "gehen", english: "to go" };
    let remote = { vocabulary: p.setVocabularyStatus(p.emptyVocabularyProgress(), a, "learned", 100), stories: ["remote-story"] };
    let injected = false, puts = 0;
    localStorage.setItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY, "alice");
    save.setCloudAuthenticated(false);
    globalThis.__syncFetch = async (_url, init) => {
      if (!init?.method) return Response.json({ userId: "alice", progress: remote });
      puts++;
      const { scope, data } = JSON.parse(init.body);
      assert.equal(init.headers["x-progress-owner"], "alice");
      if (scope === "vocabulary" && !injected) {
        injected = true;
        save.queueCloudProgress("vocabulary", p.setVocabularyStatus(p.emptyVocabularyProgress(), b, "review", 200));
      }
      remote[scope] = mergeProgress(scope, data, remote[scope]);
      return Response.json({ userId: "alice", data: remote[scope], saved: true });
    };
    // Force a vocabulary PUT and introduce another edit while it is in flight.
    localStorage.setItem(keys.PROGRESS_STORAGE_KEYS.vocabulary, JSON.stringify({ ...p.emptyVocabularyProgress(), legacyMigrated: true }));
    assert.equal((await synchronizeCloudProgress()).synced, true);
    await save.flushCloudProgress("vocabulary");
    const synced = JSON.parse(localStorage.getItem(keys.PROGRESS_STORAGE_KEYS.vocabulary));
    assert.equal(p.isVocabularyLearned(synced, a), true);
    assert.equal(p.isVocabularyReview(synced, b), true);
    assert.equal(p.isVocabularyReview(remote.vocabulary, b), true);
    assert.equal(JSON.parse(localStorage.getItem(keys.PROGRESS_STORAGE_KEYS.stories)).entries["remote-story"].completed, true);
    const unchanged = JSON.parse(localStorage.getItem(keys.PROGRESS_STORAGE_KEYS.course));
    save.queueCloudProgress("course", unchanged);
    await save.flushCloudProgress("course");
    const before = puts;
    save.queueCloudProgress("course", unchanged);
    await save.flushCloudProgress("course");
    assert.equal(puts, before, "hydrating unchanged data must not trigger an endless save loop");
    // Switching accounts discards the previous account's cached progress.
    globalThis.__syncFetch = async (_url, init) => !init?.method ? Response.json({ userId: "bob", progress: {} })
      : Response.json({ userId: "bob", data: JSON.parse(init.body).data });
    await synchronizeCloudProgress();
    assert.equal(localStorage.getItem(keys.CLOUD_PROGRESS_OWNER_STORAGE_KEY), "bob");
    assert.equal(p.isVocabularyLearned(JSON.parse(localStorage.getItem(keys.PROGRESS_STORAGE_KEYS.vocabulary)), a), false);
  } finally {
    save?.setCloudAuthenticated(false);
    save?.clearPendingProgress();
    await vite.close();
    globalThis.localStorage = previousStorage;
    globalThis.window = previousWindow;
    delete globalThis.__syncFetch;
  }
});
