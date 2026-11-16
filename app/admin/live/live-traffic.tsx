'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';

type Minute = { minute: number; requests: number; pages: number; visitors: number; errors: number };
type Snapshot = {
  available: true; generatedAt: number; since: number;
  activeVisitors: { last1: number; last5: number; last30: number };
  last5: { requests: number; pages: number; api: number; bots: number; errors5xx: number; errors4xx: number; slow: number };
  lastHour: { requests: number; pages: number; errors5xx: number; avgMs: number };
  series: Minute[];
  topPages: { path: string; views: number }[];
  recent: { at: number; method: string; path: string; status: number; ms: number; bot: boolean }[];
};
type State = { kind: 'loading' } | { kind: 'signin' } | { kind: 'denied' } | { kind: 'unavailable' } | { kind: 'error' } | { kind: 'ok'; data: Snapshot };

const REFRESH_MS = 10_000;
const time = (value: number) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function LiveTraffic() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await authenticatedFetch('/api/admin/live', { cache: 'no-store' });
        if (cancelled) return;
        if (response.status === 401) return setState({ kind: 'signin' });
        if (response.status === 404) return setState({ kind: 'denied' });
        if (!response.ok) return setState(previous => previous.kind === 'ok' ? previous : { kind: 'error' });
        const data = await response.json() as Snapshot | { available: false };
        if (!cancelled) setState(data.available ? { kind: 'ok', data } : { kind: 'unavailable' });
      } catch { if (!cancelled) setState(previous => previous.kind === 'ok' ? previous : { kind: 'error' }); }
    }
    load();
    if (paused) return () => { cancelled = true; };
    const timer = setInterval(() => { if (document.visibilityState === 'visible') load(); }, REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [paused]);

  if (state.kind !== 'ok') {
    const message = {
      loading: 'Loading live traffic…',
      signin: <>Sign in with the owner account to see live traffic. <Link href="/account">Go to account</Link></>,
      denied: 'This page is not available for this account.',
      unavailable: 'Live traffic is only recorded on the production server.',
      error: 'Live traffic could not be loaded. It will retry automatically.',
    }[state.kind];
    return <article className="information-page live-traffic"><h1>Live traffic</h1><p>{message}</p></article>;
  }

  const { data } = state;
  const peak = Math.max(1, ...data.series.map(minute => minute.requests));
  return <article className="live-traffic" aria-labelledby="live-traffic-title">
    <header className="live-traffic-header">
      <div><h1 id="live-traffic-title">Live traffic</h1><p>Updated {time(data.generatedAt)} · counting since {new Date(data.since).toLocaleString()} (resets on each deploy)</p></div>
      <button type="button" className="live-traffic-toggle" onClick={() => setPaused(value => !value)}>{paused ? 'Resume updates' : 'Pause updates'}</button>
    </header>

    <section className="live-traffic-stats" aria-label="Current activity">
      <div><strong>{data.activeVisitors.last5}</strong><span>visitors in the last 5 min</span></div>
      <div><strong>{data.activeVisitors.last1}</strong><span>visitors in the last minute</span></div>
      <div><strong>{data.last5.pages}</strong><span>page views, last 5 min</span></div>
      <div><strong>{data.lastHour.requests}</strong><span>requests in the last hour</span></div>
      <div data-alert={data.last5.errors5xx > 0 || undefined}><strong>{data.last5.errors5xx}</strong><span>server errors, last 5 min</span></div>
      <div><strong>{data.lastHour.avgMs} ms</strong><span>average response, last hour</span></div>
    </section>

    <section className="live-traffic-panel" aria-labelledby="live-traffic-chart">
      <h2 id="live-traffic-chart">Requests per minute (last 60 minutes)</h2>
      <div className="live-traffic-chart" role="img" aria-label={`Requests per minute over the last hour, peak ${peak}`}>
        {data.series.map(minute => <span key={minute.minute} title={`${time(minute.minute)}: ${minute.requests} requests, ${minute.visitors} visitors${minute.errors ? `, ${minute.errors} errors` : ''}`} style={{ height: `${Math.max(2, minute.requests / peak * 100)}%` }} data-error={minute.errors > 0 || undefined} />)}
      </div>
      <p className="live-traffic-note">Peak {peak}/min · {data.activeVisitors.last30} visitors in the last 30 min · bots in the last 5 min: {data.last5.bots} · slow responses (&gt;1 s): {data.last5.slow}</p>
    </section>

    <div className="live-traffic-columns">
      <section className="live-traffic-panel" aria-labelledby="live-traffic-top">
        <h2 id="live-traffic-top">Top pages (last 15 min)</h2>
        {data.topPages.length ? <ol className="live-traffic-top">{data.topPages.map(page => <li key={page.path}><a href={page.path}>{page.path}</a><span>{page.views}</span></li>)}</ol> : <p className="live-traffic-note">No page views yet.</p>}
      </section>
      <section className="live-traffic-panel" aria-labelledby="live-traffic-recent">
        <h2 id="live-traffic-recent">Latest requests</h2>
        {data.recent.length ? <table className="live-traffic-table"><thead><tr><th>Time</th><th>Request</th><th>Status</th><th>ms</th></tr></thead><tbody>
          {data.recent.slice(0, 25).map((request, index) => <tr key={`${request.at}-${index}`} data-bot={request.bot || undefined} data-error={request.status >= 500 || undefined}>
            <td>{time(request.at)}</td><td><code>{request.method} {request.path}</code>{request.bot && <small> bot</small>}</td><td>{request.status}</td><td>{request.ms}</td>
          </tr>)}
        </tbody></table> : <p className="live-traffic-note">No requests yet.</p>}
      </section>
    </div>
    <p className="live-traffic-note">Counts only. Visitors are estimated from a rotating anonymous hash; no IP addresses, accounts or query strings are stored, and nothing is kept after a restart. Static files served from the CloudFront cache are not counted.</p>
  </article>;
}
