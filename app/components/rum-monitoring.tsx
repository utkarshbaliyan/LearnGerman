'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { AwsRum } from 'aws-rum-web';
import { rumOptions, stripRumReferrer } from '@/app/lib/rum-options';
import { RUM_CONSENT_KEY, clearRumStorage, observedPage, privacyRestricted, readRumConsent, saveAnalyticsConsent, shouldMonitor, type RumConsent } from '@/app/lib/rum-privacy';
import { CLOUDFLARE_CONSENT_KEY, cloudflareAvailable, readCloudflareConsent, loadCloudflare, stopCloudflare } from '@/app/lib/cloudflare-analytics';

type Configuration = { enabled: boolean; region: string; appMonitorId: string; identityPoolId: string };
export function RumMonitoring() {
  const pathname = usePathname() ?? '/';
  const publicPage = observedPage(pathname);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [choice, setChoice] = useState<RumConsent>(null);
  const [ready, setReady] = useState(false), [open, setOpen] = useState(false), [restricted, setRestricted] = useState(false);
  const [running, setRunning] = useState(false);
  const [cloudflare, setCloudflare] = useState(false);
  const [choiceError, setChoiceError] = useState(false);
  const client = useRef<AwsRum | null>(null);
  const enabled = cloudflare || Boolean(configuration?.enabled);
  const collect = shouldMonitor(!cloudflare && Boolean(configuration?.enabled), choice, restricted, pathname);
  useEffect(() => {
    const useCloudflare = cloudflareAvailable(window.location.hostname);
    setCloudflare(useCloudflare);
    const refreshChoice = () => {
      let next: RumConsent = 'decline';
      try { next = useCloudflare ? readCloudflareConsent(localStorage) : readRumConsent(localStorage); } catch {}
      if (useCloudflare && next !== 'allow') stopCloudflare();
      setChoice(next);
    };
    refreshChoice();
    setReady(true); setRestricted(privacyRestricted(navigator));
    const controller = new AbortController();
    void fetch('/api/telemetry/config', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (response.ok) { const value = await response.json() as Configuration; if (!controller.signal.aborted) setConfiguration(value); }
    }).catch(() => {});
    window.addEventListener('storage', refreshChoice);
    return () => { controller.abort(); window.removeEventListener('storage', refreshChoice); };
  }, []);
  useEffect(() => {
    if (shouldMonitor(cloudflare, choice, restricted, pathname)) loadCloudflare();
  }, [cloudflare, choice, restricted, pathname]);
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
    let saved = false;
    try { saved = saveAnalyticsConsent(localStorage, cloudflare ? CLOUDFLARE_CONSENT_KEY : RUM_CONSENT_KEY, next); } catch {}
    if (!saved) next = 'decline';
    setChoiceError(!saved);
    if (next === 'decline' && configuration) {
      client.current?.disable(); client.current?.allowCookies(false); client.current?.clearCookies();
      try { clearRumStorage(localStorage, name => { document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Strict; Secure`; }, configuration.appMonitorId); } catch { /* Storage may be blocked. */ }
    }
    setChoice(next); setOpen(false);
    if (cloudflare && next === 'decline') stopCloudflare(document, saved);
    if (cloudflare && next === 'allow' && saved && document.getElementById('leselaut-analytics-boundary')?.dataset.analyticsNavigating === '1') window.location.reload();
  }
  return <>
    {choiceError && <p role="status" className="privacy-analytics-settings">Analytics are off in this tab. Your browser could not save that choice; check site storage settings before reloading.</p>}
    {pathname === "/privacy" && <div className="privacy-analytics-settings"><button type="button" className="analytics-preferences" onClick={() => setOpen(true)}>Analytics preferences</button></div>}
    {ready && (open || (enabled && publicPage && choice === null && !restricted)) && <section className="analytics-consent" aria-label="Optional analytics preferences">
      <div><strong>Help improve LeseLaut</strong><p>{cloudflare ? 'Optional Cloudflare analytics measure public-page visits, page views and page speed without identifying your account.' : 'Optional usage analytics help us find slow pages and browser problems.'} Your choice does not affect learning. <Link href="/privacy">Privacy details</Link></p>
        {restricted && <p>Your browser privacy signal disables optional analytics.</p>}
        {!enabled && <p>Optional analytics are currently unavailable.</p>}
      </div>
      <div className="analytics-consent-actions"><button type="button" onClick={() => choose('decline')}>Decline analytics</button><button type="button" disabled={restricted || !enabled} onClick={() => choose('allow')}>Allow analytics</button>{open && choice !== null && <button type="button" onClick={() => setOpen(false)}>Close</button>}</div>
    </section>}
  </>;
}
