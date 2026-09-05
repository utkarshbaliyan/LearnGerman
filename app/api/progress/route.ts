import { and, eq } from "drizzle-orm";
import { mergeVocabularyProgress } from "@/app/lib/progress-sync";

import { ensureAccount } from "@/app/lib/account-db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { getDb } from "@/db";
import { userProgress } from "@/db/schema";

const SCOPES = ["course", "stories", "grammar", "vocabulary"] as const;
type ProgressScope = (typeof SCOPES)[number];

function isScope(value: unknown): value is ProgressScope {
  return typeof value === "string" && SCOPES.includes(value as ProgressScope);
}

async function authenticatedDb(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return null;
  const db = await getDb();
  await ensureAccount(user);
  return { db, user };
}

export async function GET(request: Request) {
  const auth = await authenticatedDb(request);
  if (!auth) return Response.json({ error: "Authentication required" }, { status: 401 });

  const rows = await auth.db.select({ scope: userProgress.scope, data: userProgress.data })
    .from(userProgress)
    .where(eq(userProgress.userId, auth.user.id));
  const progress = Object.fromEntries(rows.flatMap((row) => {
    try { return [[row.scope, JSON.parse(row.data)]]; } catch { return []; }
  }));
  return Response.json({ progress, userId: auth.user.id });
}

export async function PUT(request: Request) {
  const auth = await authenticatedDb(request);
  if (!auth) return Response.json({ error: "Authentication required" }, { status: 401 });

  let payload: { scope?: unknown; data?: unknown };
  try { payload = await request.json() as { scope?: unknown; data?: unknown }; }
  catch { return Response.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  const validData = payload.scope === "stories"
    ? Array.isArray(payload.data) && payload.data.every((item) => typeof item === "string")
    : Boolean(payload.data) && typeof payload.data === "object" && !Array.isArray(payload.data);
  if (!isScope(payload.scope) || !validData) {
    return Response.json({ error: "A valid progress scope and object are required" }, { status: 400 });
  }
  const serialized = JSON.stringify(payload.data);
  if (serialized.length > 1_000_000) return Response.json({ error: "Progress document is too large" }, { status: 413 });

  if (payload.scope === "vocabulary") {
    // Compare-and-swap prevents simultaneous browsers from replacing each other's cards.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const [existing] = await auth.db.select({ data: userProgress.data }).from(userProgress)
        .where(and(eq(userProgress.userId, auth.user.id), eq(userProgress.scope, "vocabulary")));
      let remote: unknown = {};
      try { remote = JSON.parse(existing?.data ?? "{}"); } catch { /* Recover malformed legacy documents. */ }
      const data = JSON.stringify(mergeVocabularyProgress(payload.data, remote));
      if (data.length > 1_000_000) return Response.json({ error: "Progress document is too large" }, { status: 413 });
      const saved = existing
        ? await auth.db.update(userProgress).set({ data, updatedAt: new Date().toISOString() })
          .where(and(eq(userProgress.userId, auth.user.id), eq(userProgress.scope, "vocabulary"), eq(userProgress.data, existing.data))).returning({ scope: userProgress.scope })
        : await auth.db.insert(userProgress).values({ userId: auth.user.id, scope: "vocabulary", data })
          .onConflictDoNothing().returning({ scope: userProgress.scope });
      if (saved.length) return Response.json({ saved: true, scope: "vocabulary" });
    }
    return Response.json({ error: "Progress changed concurrently. Please retry." }, { status: 409 });
  }

  await auth.db.insert(userProgress).values({ userId: auth.user.id, scope: payload.scope, data: serialized })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.scope],
      set: { data: serialized, updatedAt: new Date().toISOString() },
    });
  return Response.json({ saved: true, scope: payload.scope });
}
