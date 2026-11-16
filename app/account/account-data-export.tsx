"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';
import { browserSession } from '@/app/lib/browser-session';
import { supabase } from '@/app/lib/supabase-client';

export function AccountDataExport() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true, authVersion = 0;
    void browserSession().then(session => { if (active && authVersion === 0) setSignedIn(Boolean(session)); })
      .catch(() => {}).finally(() => { if (active) setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) { authVersion++; setSignedIn(Boolean(session)); setReady(true); }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function exportData() {
    setExporting(true); setMessage('');
    try {
      const response = await authenticatedFetch('/api/account/export', { cache: 'no-store' });
      if (!response.ok) throw new Error('Export unavailable');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url; link.download = 'leselaut-account-data.json';
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Download started. Keep this file private: it contains your learning history.');
    } catch {
      setMessage('Download failed. Check your connection and sign-in, then try again.');
    } finally { setExporting(false); }
  }

  if (!ready) return null;
  return <div className="privacy-data-export">
    {signedIn ? <button type="button" onClick={exportData} disabled={exporting}>{exporting ? 'Preparing download…' : 'Download my data'}</button>
      : <Link href="/account">Sign in to download your data</Link>}
    {message && <p role="status">{message}</p>}
  </div>;
}
