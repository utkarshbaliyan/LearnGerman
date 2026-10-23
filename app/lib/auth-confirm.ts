import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js';

type Callback = { error: string | null; tokenHash: string | null; type: EmailOtpType | null };
type CallbackAuth = Pick<SupabaseClient['auth'], 'initialize' | 'verifyOtp' | 'getSession'>;

export async function confirmAuthSession(auth: CallbackAuth, parameters: Callback) {
  if (parameters.error) throw new Error(parameters.error);
  // detectSessionInUrl exchanges a PKCE code during SDK initialization. Codes
  // are single-use: calling exchangeCodeForSession again would reject a valid login.
  const initialized = await auth.initialize();
  if (initialized.error) throw initialized.error;
  if (parameters.tokenHash) {
    const { error } = await auth.verifyOtp({ token_hash: parameters.tokenHash, type: parameters.type ?? 'email' });
    if (error) throw error;
  }
  const { data, error } = await auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('The sign-in link is invalid or has expired. Please start sign-in again.');
  return data.session;
}
