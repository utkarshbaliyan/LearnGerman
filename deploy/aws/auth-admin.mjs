const authUrl = 'https://npnzojbbwwdtujuurkmx.supabase.co/auth/v1';

export async function deleteAuthIdentity(userId, secret) {
  if (!secret) throw new Error('Account deletion is not configured.');
  const response = await fetch(`${authUrl}/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE', signal: AbortSignal.timeout(15_000),
    headers: { apikey: secret, authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
    body: JSON.stringify({ should_soft_delete: false }),
  });
  await response.body?.cancel();
  if (!response.ok && response.status !== 404) throw new Error('Authentication deletion is temporarily unavailable.');
}
