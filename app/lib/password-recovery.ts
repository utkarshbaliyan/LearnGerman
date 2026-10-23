import type { SupabaseClient } from '@supabase/supabase-js';

export function recoveryCallback(search: string, hash: string) {
  const query = new URLSearchParams(search);
  return query.get('intent') === 'recovery' || query.get('type') === 'recovery' || new URLSearchParams(hash.replace(/^#/, '')).get('type') === 'recovery';
}

export async function requestRecovery(auth: Pick<SupabaseClient['auth'], 'resetPasswordForEmail'>, email: string, callback: string) {
  const target = new URL(callback); target.searchParams.set('intent', 'recovery');
  const { error } = await auth.resetPasswordForEmail(email, { redirectTo: target.href });
  if (error) throw error;
}

export async function updateRecoveredPassword(auth: Pick<SupabaseClient['auth'], 'updateUser' | 'signOut'>, password: string, confirmation: string) {
  if (password.length < 8 || password.length > 128 || password !== confirmation) throw new Error('Use 8–128 characters and enter the same password twice.');
  const { error } = await auth.updateUser({ password });
  if (error) throw error;
  const signedOut = await auth.signOut({ scope: 'global' });
  return { sessionsRevoked: !signedOut.error };
}
