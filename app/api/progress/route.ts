import { and, eq } from "drizzle-orm";
import { mergeProgress } from "@/app/lib/progress-merge";

import { ensureAccount } from "@/app/lib/account-db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { getDb } from "@/db";
import { userProgress } from "@/db/schema";
import { boundedBody } from '@/app/lib/request-body';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
// Preserve the existing character limit while staying below D1's 2 MB row limit.
const validSize = (text: string) => text.length <= 1_000_000 && new TextEncoder().encode(text).byteLength <= 1_900_000;

const SCOPES = ["course", "stories", "grammar", "vocabulary", "books", "learning"] as const;
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

async function getProgress(request: Request) {
  const auth = await authenticatedDb(request);
  if (!auth) return json({ error: "Authentication required" }, 401);

  const rows = await auth.db.select({ scope: userProgress.scope, data: userProgress.data })
    .from(userProgress)
    .where(eq(userProgress.userId, auth.user.id));
  const progress = Object.fromEntries(rows.flatMap((row) => {
    try { return [[row.scope, JSON.parse(row.data)]]; } catch { return []; }
  }));
  return json({ progress, userId: auth.user.id });
}

async function putProgress(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return json({ error: "Authentication required" }, 401);

  const expectedOwner = request.headers.get("x-progress-owner");
  if (expectedOwner && expectedOwner !== user.id) return json({ error: "Account changed. Reload progress before saving." }, 409);

  let payload: { scope?: unknown; data?: unknown };
  try {
    const bytes = await boundedBody(request, 1_950_000);
    if (!bytes) return json({ error: 'Progress document is too large' }, 413);
    payload = JSON.parse(new TextDecoder().decode(bytes)) as { scope?: unknown; data?: unknown };
  } catch { return json({ error: "Request body must be valid JSON" }, 400); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json({ error: "Request body must be an object" }, 400);
  const validData = payload.scope === "stories"
    ? (Array.isArray(payload.data) && payload.data.every((item) => typeof item === "string")) || (Boolean(payload.data) && typeof payload.data === "object" && !Array.isArray(payload.data))
    : Boolean(payload.data) && typeof payload.data === "object" && !Array.isArray(payload.data);
  if (!isScope(payload.scope) || !validData) {
    return json({ error: "A valid progress scope and object are required" }, 400);
  }
  const serialized = JSON.stringify(payload.data);
  if (!validSize(serialized)) return json({ error: "Progress document is too large" }, 413);
  const db = await getDb();
  await ensureAccount(user);
  const auth = { db, user };

  {
    const scope = payload.scope;
    // Compare-and-swap prevents simultaneous browsers from replacing each other's cards.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const [existing] = await auth.db.select({ data: userProgress.data }).from(userProgress)
        .where(and(eq(userProgress.userId, auth.user.id), eq(userProgress.scope, scope)));
      let remote: unknown = {};
      try { remote = JSON.parse(existing?.data ?? "{}"); } catch { /* Recover malformed legacy documents. */ }
      const data = JSON.stringify(mergeProgress(scope, payload.data, remote));
      if (!validSize(data)) return json({ error: "Progress document is too large" }, 413);
      const saved = existing
        ? await auth.db.update(userProgress).set({ data, updatedAt: new Date().toISOString() })
          .where(and(eq(userProgress.userId, auth.user.id), eq(userProgress.scope, scope), eq(userProgress.data, existing.data))).returning({ scope: userProgress.scope })
        : await auth.db.insert(userProgress).values({ userId: auth.user.id, scope, data })
          .onConflictDoNothing().returning({ scope: userProgress.scope });
      if (saved.length) return json({ saved: true, scope, data: JSON.parse(data), userId: auth.user.id });
    }
    return json({ error: "Progress changed concurrently. Please retry." }, 409);
  }

}

function unavailable() {
  console.error('{"event":"progress_unavailable"}');
  return json({ error: 'Progress is temporarily unavailable. Your browser progress is safe; please retry.' }, 503);
}
export async function GET(request: Request) { try { return await getProgress(request); } catch { return unavailable(); } }
export async function PUT(request: Request) { try { return await putProgress(request); } catch { return unavailable(); } }
