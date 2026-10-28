import type { SupabaseClient } from '@supabase/supabase-js';
import { requestRecovery } from './password-recovery';

export type CaptchaConfig = { enabled: boolean; siteKey: string | null };
export function captchaConfig(env: Record<string, string | undefined>): CaptchaConfig {
  const siteKey = env.LESELAUT_TURNSTILE_SITE_KEY?.trim();
  if (!siteKey) {
    if (env.LESELAUT_TURNSTILE_REQUIRED === '1') throw new Error('CAPTCHA is not configured.');
    return { enabled: false, siteKey: null };
  }
  if (!/^0x[A-Za-z0-9_-]{10,100}$/.test(siteKey)) throw new Error('Invalid CAPTCHA configuration.');
  return { enabled: true, siteKey };
}

type EmailAuth = Pick<SupabaseClient['auth'], 'signUp' | 'signInWithPassword' | 'resetPasswordForEmail'>;
export async function submitEmailAuth(auth: EmailAuth, input: {
  mode: 'signin' | 'signup' | 'recover'; email: string; password: string; username: string;
  callback: string; captcha: CaptchaConfig; token: string;
}) {
  if (input.captcha.enabled && (!input.token || input.token.length > 2048)) throw new Error('Complete the security check before continuing.');
  const captchaToken = input.captcha.enabled ? input.token : undefined;
  if (input.mode === 'recover') {
    await requestRecovery(auth, input.email, input.callback, captchaToken);
    return 'If an account exists for this email, a recovery link will be sent. Open it in this browser.';
  }
  const result = input.mode === 'signup'
    ? await auth.signUp({ email: input.email, password: input.password, options: { data: { username: input.username }, emailRedirectTo: input.callback, captchaToken } })
    : await auth.signInWithPassword({ email: input.email, password: input.password, options: { captchaToken } });
  if (result.error) throw result.error;
  return input.mode === 'signup' && !result.data.session ? 'Check your email to confirm your account, then sign in.' : 'Signed in successfully.';
}
