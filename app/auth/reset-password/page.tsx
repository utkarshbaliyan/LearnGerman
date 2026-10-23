'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase-client';
import { updateRecoveredPassword } from '@/app/lib/password-recovery';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Checking your recovery session…');
  useEffect(() => {
    void supabase.auth.getSession().then(({ data, error }) => {
      setReady(!error && Boolean(data.session));
      setMessage(error || !data.session ? 'Your recovery link is invalid or has expired. Request another from the sign-in page.' : 'Choose a new password for your account.');
    }).catch(() => setMessage('Recovery is unavailable. Request another link from the sign-in page.'));
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password.length < 8 || password.length > 128 || password !== form.get('confirmation')) { setMessage('Use 8–128 characters and enter the same password twice.'); return; }
    setBusy(true);
    try {
      const result = await updateRecoveredPassword(supabase.auth, password, String(form.get('confirmation') ?? ''));
      setReady(false);
      setMessage(!result.sessionsRevoked ? 'Password updated. Other sessions could not be signed out; contact support if you suspect unauthorized access.' : 'Password updated. Sign in with your new password.');
    } catch { setMessage('Your password could not be updated. Try again or request a new recovery link.'); }
    finally { setBusy(false); }
  }
  return <main className="site-shell account-page"><section className="account-shell"><div className="account-intro"><h1>Reset your password</h1></div><div className="account-panel account-auth">
    <p role="status">{message}</p>
    {ready && <form onSubmit={submit}>
      <label>New password<input name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" disabled={busy} /></label>
      <label>Confirm new password<input name="confirmation" type="password" minLength={8} maxLength={128} required autoComplete="new-password" disabled={busy} /></label>
      <button className="account-submit" disabled={busy}>{busy ? 'Updating…' : 'Save new password'}</button>
    </form>}
    <Link href="/account">Back to sign in</Link>
  </div></section></main>;
}
