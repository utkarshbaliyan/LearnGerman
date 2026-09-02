import { ensureAccount } from "@/app/lib/account-db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });

  const account = await ensureAccount(user);
  return Response.json({ account: { email: account.email, displayName: account.displayName, username: account.username } });
}
