'use client';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabase-client';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';
import { clearAccountStorage } from '@/app/lib/account-storage';
import { clearPendingProgress, setCloudAuthenticated } from '@/app/lib/cloud-progress-save';

export function AccountDeletion({ userId, email }: { userId: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user.id !== userId) throw new Error('Account changed. Reload before continuing.');
      const response = await authenticatedFetch('/api/account/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), confirmation: form.get('confirmation') }) });
      const payload = await response.json() as { error?: string; status?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Deletion could not be confirmed.');
      if (payload.status !== 'complete' && payload.status !== 'pending') throw new Error('Deletion could not be confirmed. Contact support before retrying.');
      setCloudAuthenticated(false); clearPendingProgress();
      try { clearAccountStorage(localStorage, userId); } catch { /* Explain browser cleanup below. */ }
      await supabase.auth.signOut({ scope: 'local' });
      window.location.replace(`/account?deletion=${payload.status === 'complete' ? 'complete' : 'pending'}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Deletion could not be confirmed. Contact leselaut.team@gmail.com.');
      setBusy(false);
    }
  }
  return <section className="account-data-export account-delete">
    <h2>Delete your account</h2>
    <p>This permanently removes your profile, synced progress and saved practice. Download your data first if you want a copy. Backups expire on their own schedule.</p>
    {!open ? <button className="account-signout" type="button" onClick={() => setOpen(true)}>Delete my account…</button> : <form onSubmit={submit}>
      <label>Confirm your email<input name="email" type="email" required autoComplete="email" placeholder={email} disabled={busy} /></label>
      <label>Type DELETE to confirm<input name="confirmation" required pattern="DELETE" autoComplete="off" disabled={busy} /></label>
      <p>Local data in this browser will be cleared. Clear LeseLaut site data on your other browsers and devices too.</p>
      <button className="account-submit" disabled={busy}>{busy ? 'Deleting…' : 'Permanently delete my account'}</button>
      <button className="account-signout" type="button" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
    </form>}
    {message && <p role="alert">{message}</p>}
  </section>;
}
