import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureDatabase, getDb } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });

  await ensureDatabase();
  const db = await getDb();
  await db.insert(users).values({ id: user.id, email: user.email, displayName: user.displayName })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: user.email, displayName: user.displayName, updatedAt: new Date().toISOString() },
    });

  return Response.json({ account: { email: user.email, displayName: user.displayName } });
}
