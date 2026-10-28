export const isStaging = (env = process.env) => env.LESELAUT_STAGING === '1';

// A test copy shares authentication with the live site. Check the current
// identity so a token for an account deleted on the live site cannot revive it.
export async function stagingIdentityIsCurrent(request, subject, env = process.env, fetcher = fetch) {
  if (!isStaging(env)) return true;
  const authorization = request.headers.get('authorization');
  if (!env.SUPABASE_SECRET_KEY || !authorization?.startsWith('Bearer ') || !subject) return false;
  try {
    const response = await fetcher('https://npnzojbbwwdtujuurkmx.supabase.co/auth/v1/user', {
      headers: { apikey: env.SUPABASE_SECRET_KEY, authorization },
      redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) { await response.body?.cancel(); return false; }
    const user = await response.json();
    return user?.id === subject;
  } catch { return false; }
}

export function stagingDeletionAllowed(email, env = process.env) {
  if (!isStaging(env)) return true;
  const allowed = env.LESELAUT_STAGING_DELETE_EMAIL?.trim().toLowerCase();
  return !!allowed && typeof email === 'string' && email.trim().toLowerCase() === allowed;
}
