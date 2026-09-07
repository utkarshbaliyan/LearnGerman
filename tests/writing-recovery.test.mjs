import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

test("draft recovery isolates accounts and preserves edits made during an in-flight save", async () => {
  const vite = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, ws: false } });
  try {
    const { readRecovery, recoveryKey, acknowledgeDraft } = await vite.ssrLoadModule("/app/lib/writing-draft-recovery.ts");
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
    acknowledgeDraft(storage, "alice", "task-1", "Old message", "New message", 3);
    assert.equal(readRecovery(storage, "alice", "task-1", "Old message"), "New message");
    assert.equal(readRecovery(storage, "bob", "task-1", ""), null);
    assert.equal(readRecovery(storage, "alice", "task-2", ""), null);
    assert.equal(readRecovery(storage, "alice", "task-1", "Remote edit"), "New message", "Remote conflicts must retain unsent work for an explicit choice");
    acknowledgeDraft(storage, "alice", "task-1", "New message", "New message", 4);
    assert.equal(readRecovery(storage, "alice", "task-1", "New message"), null);
    storage.setItem(recoveryKey("alice", "task-1"), "broken JSON");
    assert.equal(readRecovery(storage, "alice", "task-1", ""), null);
    storage.setItem(recoveryKey("alice", "task-1"), JSON.stringify({ text: "x".repeat(8001) }));
    assert.equal(readRecovery(storage, "alice", "task-1", ""), null);
  } finally { await vite.close(); }
});
