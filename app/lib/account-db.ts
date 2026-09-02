import { eq } from "drizzle-orm";
import type { AuthenticatedUser } from "@/app/lib/supabase-auth";
import { ensureDatabase, getD1, getDb } from "@/db";
import { users } from "@/db/schema";

function normalizeUsername(value: string) {
  return value.toLocaleLowerCase("en-US").normalize("NFKD").replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);
}

async function availableUsername(preferred: string) {
  const d1 = await getD1();
  const base = normalizeUsername(preferred) || "learner";
  for (let suffix = 0; suffix < 10_000; suffix += 1) {
    const ending = suffix === 0 ? "" : String(suffix + 1);
    const candidate = `${base.slice(0, 24 - ending.length)}${ending}`;
    const existing = await d1.prepare("SELECT 1 FROM users WHERE username = ? LIMIT 1").bind(candidate).first();
    if (!existing) return candidate;
  }
  return `learner_${crypto.randomUUID().slice(0, 8)}`;
}

export async function ensureAccount(user: AuthenticatedUser) {
  await ensureDatabase();
  const db = await getDb();
  const existing = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (existing[0]) {
    await db.update(users).set({ email: user.email, displayName: user.displayName, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
    return { ...existing[0], email: user.email, displayName: user.displayName };
  }
  const username = await availableUsername(user.requestedUsername ?? user.displayName ?? user.email.split("@")[0]);
  await db.insert(users).values({ id: user.id, email: user.email, displayName: user.displayName, username });
  return { id: user.id, email: user.email, displayName: user.displayName, username };
}
