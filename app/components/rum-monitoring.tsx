'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { AwsRum } from 'aws-rum-web';
import { rumOptions, stripRumReferrer } from '@/app/lib/rum-options';
import { RUM_CONSENT_KEY, clearRumStorage, observedPage, privacyRestricted, readRumConsent, shouldMonitor, type RumConsent } from '@/app/lib/rum-privacy';

type Configuration = { enabled: boolean; region: string; appMonitorId: string; identityPoolId: string };
export function RumMonitoring() {
  const pathname = usePathname() ?? '/';
  const publicPage = observedPage(pathname);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [choice, setChoice] = useState<RumConsent>(null);
  const [ready, setReady] = useState(false), [open, setOpen] = useState(false), [restricted, setRestricted] = useState(false);
  const [running, setRunning] = useState(false);
  const client = useRef<AwsRum | null>(null);
  const collect = shouldMonitor(Boolean(configuration?.enabled), choice, restricted, pathname);
  useEffect(() => {
    try { setChoice(readRumConsent(localStorage)); } catch { setChoice('decline'); }
    setReady(true); setRestricted(privacyRestricted(navigator));
    const controller = new AbortController();
    void fetch('/api/telemetry/config', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (response.ok) { const value = await response.json() as Configuration; if (!controller.signal.aborted) setConfiguration(value); }
    }).catch(() => {});
    const refreshChoice = () => { try { setChoice(readRumConsent(localStorage)); } catch { setChoice('decline'); } };
    window.addEventListener('storage', refreshChoice);
    return () => { controller.abort(); window.removeEventListener('storage', refreshChoice); };
  }, []);
  useEffect(() => {
    if (!configuration || !collect) return;
    let cancelled = false, current: AwsRum | null = null;
    void import('aws-rum-web').then(({ AwsRum }) => {
      if (cancelled) return;
      current = new AwsRum(configuration.appMonitorId, 'reading-beta', configuration.region, {
        ...rumOptions(window.location.origin), identityPoolId: configuration.identityPoolId,
      });
      current.setEventMetadataHook(stripRumReferrer);
      client.current = current; setRunning(true);
    }).catch(() => { /* Optional telemetry must never prevent learning or sign-in. */ });
    return () => { cancelled = true; current?.disable(); if (client.current === current) client.current = null; setRunning(false); };
  }, [configuration, collect]);
  useEffect(() => {
    if (!running || !publicPage) return;
    if (observedPage(window.location.pathname)) client.current?.recordPageView(window.location.pathname);
    const heartbeat = () => {
      if (document.visibilityState === 'visible' && observedPage(window.location.pathname)) client.current?.recordEvent('leselaut.heartbeat', { page: window.location.pathname });
    };
    heartbeat(); const timer = setInterval(heartbeat, 60_000);
    document.addEventListener('visibilitychange', heartbeat);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', heartbeat); };
  }, [running, pathname, publicPage]);
  function choose(next: Exclude<RumConsent, null>) {
    try { localStorage.setItem(RUM_CONSENT_KEY, JSON.stringify({ choice: next, at: Date.now() })); } catch { next = 'decline'; }
    if (next === 'decline' && configuration) {
      client.current?.disable(); client.current?.allowCookies(false); client.current?.clearCookies();
      try { clearRumStorage(localStorage, name => { document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Strict; Secure`; }, configuration.appMonitorId); } catch { /* Storage may be blocked. */ }
    }
    setChoice(next); setOpen(false);
  }
  return <>
    {pathname === "/privacy" && <div className="privacy-analytics-settings"><button type="button" className="analytics-preferences" onClick={() => setOpen(true)}>Analytics preferences</button></div>}
    {ready && (open || (configuration?.enabled && publicPage && choice === null && !restricted)) && <section className="analytics-consent" aria-label="Optional analytics preferences">
      <div><strong>Help improve LeseLaut</strong><p>Optional usage analytics help us find slow pages and browser problems. Your choice does not affect learning. <Link href="/privacy">Privacy details</Link></p>
        {restricted && <p>Your browser privacy signal disables optional analytics.</p>}
        {!configuration?.enabled && <p>Optional analytics are currently unavailable.</p>}
      </div>
      <div className="analytics-consent-actions"><button type="button" onClick={() => choose('decline')}>Decline analytics</button><button type="button" disabled={restricted || !configuration?.enabled} onClick={() => choose('allow')}>Allow analytics</button>{open && choice !== null && <button type="button" onClick={() => setOpen(false)}>Close</button>}</div>
    </section>}
  </>;
}
