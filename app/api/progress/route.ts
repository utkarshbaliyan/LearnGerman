import { eq } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureDatabase, getDb } from "@/db";
import { userProgress, users } from "@/db/schema";

const SCOPES = ["course", "stories", "grammar", "vocabulary"] as const;
type ProgressScope = (typeof SCOPES)[number];

function isScope(value: unknown): value is ProgressScope {
  return typeof value === "string" && SCOPES.includes(value as ProgressScope);
}

async function authenticatedDb() {
  const user = await getChatGPTUser();
  if (!user) return null;
  await ensureDatabase();
  const db = await getDb();
  await db.insert(users).values({ id: user.id, email: user.email, displayName: user.displayName })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: user.email, displayName: user.displayName, updatedAt: new Date().toISOString() },
    });
  return { db, user };
}

export async function GET() {
  const auth = await authenticatedDb();
  if (!auth) return Response.json({ error: "Authentication required" }, { status: 401 });

  const rows = await auth.db.select({ scope: userProgress.scope, data: userProgress.data })
    .from(userProgress)
    .where(eq(userProgress.userId, auth.user.id));
  const progress = Object.fromEntries(rows.flatMap((row) => {
    try { return [[row.scope, JSON.parse(row.data)]]; } catch { return []; }
  }));
  return Response.json({ progress });
}

export async function PUT(request: Request) {
  const auth = await authenticatedDb();
  if (!auth) return Response.json({ error: "Authentication required" }, { status: 401 });

  const payload = await request.json() as { scope?: unknown; data?: unknown };
  const validData = payload.scope === "stories"
    ? Array.isArray(payload.data) && payload.data.every((item) => typeof item === "string")
    : Boolean(payload.data) && typeof payload.data === "object" && !Array.isArray(payload.data);
  if (!isScope(payload.scope) || !validData) {
    return Response.json({ error: "A valid progress scope and object are required" }, { status: 400 });
  }
  const serialized = JSON.stringify(payload.data);
  if (serialized.length > 1_000_000) return Response.json({ error: "Progress document is too large" }, { status: 413 });

  await auth.db.insert(userProgress).values({ userId: auth.user.id, scope: payload.scope, data: serialized })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.scope],
      set: { data: serialized, updatedAt: new Date().toISOString() },
    });
  return Response.json({ saved: true, scope: payload.scope });
}
