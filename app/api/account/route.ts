import { ensureAccount } from "@/app/lib/account-db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' };

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401, headers });

  try {
    const account = await ensureAccount(user);
    return Response.json({ account: { email: account.email, displayName: account.displayName, username: account.username } }, { headers });
  } catch {
    console.error('{"event":"account_unavailable"}');
    return Response.json({ error: 'Your account is temporarily unavailable. Please retry.' }, { status: 503, headers });
  }
}
