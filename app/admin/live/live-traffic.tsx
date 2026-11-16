'use client';
import { type ReactNode, useEffect, useState } from 'react';
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
type Day = { day: string; visitors: number; pageviews: number; requests: number; errors5xx: number; bots: number };
type History = {
  days: number; from: string; to: string; series: Day[];
  totals: { visitorDays: number; pageviews: number; requests: number; errors5xx: number; bots: number; activeDays: number; averageDailyVisitors: number; peakDay: { day: string; visitors: number } | null };
  topPages: { path: string; views: number }[];
};
type Range = 'live' | '7d' | '30d' | '90d';
type State = { kind: 'loading' } | { kind: 'signin' } | { kind: 'denied' } | { kind: 'unavailable' } | { kind: 'error' } | { kind: 'ok'; data: Snapshot } | { kind: 'history'; data: History };
const RANGES: { value: Range; label: string }[] = [{ value: 'live', label: 'Live' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }];

const REFRESH_MS = 10_000, HISTORY_REFRESH_MS = 60_000;
const dayLabel = (day: string, long = false) => new Date(`${day}T00:00:00Z`).toLocaleDateString([], { timeZone: 'UTC', day: 'numeric', month: 'short', ...(long ? { weekday: 'short' } : {}) });
const time = (value: number) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function LiveTraffic() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [paused, setPaused] = useState(false);
  const [range, setRange] = useState<Range>('live');

  useEffect(() => {
    let cancelled = false;
    setState(previous => previous.kind === 'ok' || previous.kind === 'history' ? { kind: 'loading' } : previous);
    async function load() {
      try {
        const response = await authenticatedFetch(range === 'live' ? '/api/admin/live' : `/api/admin/live?range=${range}`, { cache: 'no-store' });
        if (cancelled) return;
        if (response.status === 401) return setState({ kind: 'signin' });
        if (response.status === 404) return setState({ kind: 'denied' });
        if (!response.ok) return setState(previous => previous.kind === 'ok' ? previous : { kind: 'error' });
        const data = await response.json() as Snapshot | { available: true; history: History } | { available: false };
        if (cancelled) return;
        if (!data.available) setState({ kind: 'unavailable' });
        else if ('history' in data) setState({ kind: 'history', data: data.history });
        else setState({ kind: 'ok', data });
      } catch { if (!cancelled) setState(previous => previous.kind === 'ok' ? previous : { kind: 'error' }); }
    }
    load();
    if (paused) return () => { cancelled = true; };
    const timer = setInterval(() => { if (document.visibilityState === 'visible') load(); }, range === 'live' ? REFRESH_MS : HISTORY_REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [paused, range]);

  const filter = <div className="live-traffic-ranges" role="group" aria-label="Time range">{RANGES.map(option => <button key={option.value} type="button" aria-pressed={range === option.value} onClick={() => setRange(option.value)}>{option.label}</button>)}</div>;

  if (state.kind === 'history') return <HistoryView data={state.data} filter={filter} />;

  if (state.kind !== 'ok') {
    const message = {
      loading: 'Loading live traffic…',
      signin: <>Sign in with the owner account to see live traffic. <Link href="/account">Go to account</Link></>,
      denied: 'This page is not available for this account.',
      unavailable: range === 'live' ? 'Live traffic is only recorded on the production server.' : 'Traffic history is only recorded on the production server.',
      error: 'Live traffic could not be loaded. It will retry automatically.',
    }[state.kind];
    return <article className="live-traffic"><header className="live-traffic-header"><div><h1>Traffic</h1><p>{message}</p></div></header>{(state.kind === 'loading' || state.kind === 'unavailable') && filter}</article>;
  }

  const { data } = state;
  const peak = Math.max(1, ...data.series.map(minute => minute.requests));
  return <article className="live-traffic" aria-labelledby="live-traffic-title">
    <header className="live-traffic-header">
      <div><h1 id="live-traffic-title">Traffic</h1><p>Live · updated {time(data.generatedAt)} · counting since {new Date(data.since).toLocaleString()} (resets on each deploy)</p></div>
      <button type="button" className="live-traffic-toggle" onClick={() => setPaused(value => !value)}>{paused ? 'Resume updates' : 'Pause updates'}</button>
    </header>
    {filter}

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

function HistoryView({ data, filter }: { data: History; filter: ReactNode }) {
  const peak = Math.max(1, ...data.series.map(day => Math.max(day.visitors, day.pageviews)));
  const { totals } = data;
  return <article className="live-traffic" aria-labelledby="traffic-history-title">
    <header className="live-traffic-header">
      <div><h1 id="traffic-history-title">Traffic</h1><p>Last {data.days} days · {dayLabel(data.from)} – {dayLabel(data.to)} (India time) · updates every minute</p></div>
    </header>
    {filter}
    <section className="live-traffic-stats" aria-label="Totals for this period">
      <div><strong>{totals.averageDailyVisitors}</strong><span>average visitors per day</span></div>
      <div><strong>{totals.peakDay ? totals.peakDay.visitors : 0}</strong><span>{totals.peakDay ? `busiest day (${dayLabel(totals.peakDay.day)})` : 'busiest day'}</span></div>
      <div><strong>{totals.pageviews}</strong><span>page views</span></div>
      <div><strong>{totals.visitorDays}</strong><span>daily visits (each visitor once per day)</span></div>
      <div><strong>{totals.activeDays} / {data.days}</strong><span>days with visitors</span></div>
      <div data-alert={totals.errors5xx > 0 || undefined}><strong>{totals.errors5xx}</strong><span>server errors</span></div>
    </section>
    <section className="live-traffic-panel" aria-labelledby="traffic-history-chart">
      <h2 id="traffic-history-chart">Visitors and page views per day</h2>
      <div className="live-traffic-chart live-traffic-days" role="img" aria-label={`Daily visitors over the last ${data.days} days`}>
        {data.series.map(day => <span key={day.day} title={`${dayLabel(day.day, true)}: ${day.visitors} visitors, ${day.pageviews} page views${day.errors5xx ? `, ${day.errors5xx} server errors` : ''}`}>
          <i className="live-traffic-bar-views" style={{ height: `${day.pageviews / peak * 100}%` }} />
          <i className="live-traffic-bar-visitors" style={{ height: `${Math.max(day.visitors ? 3 : 0, day.visitors / peak * 100)}%` }} data-error={day.errors5xx > 0 || undefined} />
        </span>)}
      </div>
      <div className="live-traffic-axis" aria-hidden="true"><span>{dayLabel(data.from)}</span><span>{dayLabel(data.to)}</span></div>
      <p className="live-traffic-note"><span className="live-traffic-key live-traffic-key-visitors" /> visitors <span className="live-traffic-key live-traffic-key-views" /> page views · hover a bar for the day’s numbers</p>
    </section>
    <section className="live-traffic-panel" aria-labelledby="traffic-history-top">
      <h2 id="traffic-history-top">Top pages</h2>
      {data.topPages.length ? <ol className="live-traffic-top">{data.topPages.map(page => <li key={page.path}><a href={page.path}>{page.path}</a><span>{page.views}</span></li>)}</ol> : <p className="live-traffic-note">No page views recorded in this period yet.</p>}
    </section>
    <p className="live-traffic-note">History starts when this feature went live. A visitor is counted once per day; there is no cross-day tracking, so the same person on two days counts twice in “daily visits”. Bots and static files are excluded from visitors.</p>
  </article>;
}
