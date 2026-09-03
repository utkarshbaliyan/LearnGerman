import { eq } from "drizzle-orm";
import type { AuthenticatedUser } from "@/app/lib/supabase-auth";
import { getD1, getDb } from "@/db";
import { users } from "@/db/schema";

function normalizeUsername(value: string) {
  const normalized = value.toLocaleLowerCase("en-US").normalize("NFKD").replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);
  return normalized.length >= 3 ? normalized : "learner";
}

function usernameCandidate(base: string, attempt: number) {
  const ending = attempt === 0 ? "" : String(attempt + 1);
  return `${base.slice(0, 24 - ending.length)}${ending}`;
}

export async function ensureAccount(user: AuthenticatedUser) {
  const db = await getDb();
  const d1 = await getD1();
  const base = normalizeUsername(user.requestedUsername ?? user.displayName ?? user.email.split("@")[0]);
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const username = usernameCandidate(base, attempt);
    await db.insert(users).values({ id: user.id, email: user.email, displayName: user.displayName, username }).onConflictDoNothing();
    await d1.prepare("UPDATE OR IGNORE users SET username = ? WHERE id = ? AND username IS NULL").bind(username, user.id).run();
    const account = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (account[0]?.username) {
      await db.update(users).set({ email: user.email, displayName: user.displayName, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
      return { ...account[0], email: user.email, displayName: user.displayName };
    }
  }
  throw new Error("Unable to allocate a unique username.");
}
