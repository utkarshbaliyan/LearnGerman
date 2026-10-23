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
  const [existing] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  // Normal progress reads must not allocate usernames or rewrite the profile.
  if (existing?.username) {
    if (existing.email !== user.email || existing.displayName !== user.displayName) {
      await db.update(users).set({ email: user.email, displayName: user.displayName, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
    }
    return { ...existing, email: user.email, displayName: user.displayName };
  }
  const base = normalizeUsername(user.requestedUsername ?? user.displayName ?? user.email.split("@")[0]);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(user.id)));
  const suffix = [...digest.slice(0, 5)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = attempt === 0 ? base : usernameCandidate(`${base.slice(0, 11)}_${suffix}`, attempt - 1);
    await db.insert(users).values({ id: user.id, email: user.email, displayName: user.displayName, username }).onConflictDoNothing();
    await d1.prepare("UPDATE OR IGNORE users SET username = ? WHERE id = ? AND username IS NULL").bind(username, user.id).run();
    const account = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (account[0]?.username) {
      if (account[0].email !== user.email || account[0].displayName !== user.displayName) {
        await db.update(users).set({ email: user.email, displayName: user.displayName, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
      }
      return { ...account[0], email: user.email, displayName: user.displayName };
    }
  }
  throw new Error("Unable to allocate a unique username.");
}
