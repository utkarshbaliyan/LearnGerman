'use client';
import { type ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';

type Minute = { minute: number; requests: number; pages: number; visitors: number; bots?: number; errors: number };
type SectionSummary = { section: string; views: number; share: number };
type TopPage = { path: string; views: number; section?: string; share?: number };
type RecentRequest = {
  at: number; method: string; path: string; status: number; ms: number;
  bot: boolean; probe?: boolean; rsc?: boolean; real?: boolean; section?: string | null;
};
type Snapshot = {
  available: true; generatedAt: number; since: number; windowMinutes?: number;
  activeVisitors: { last1: number; last5: number; last30: number; last60?: number };
  last5: { requests: number; pages: number; api: number; bots: number; probes?: number; errors5xx: number; errors4xx: number; slow: number };
  lastHour: { requests: number; pages: number; bots?: number; probes?: number; errors4xx?: number; errors5xx: number; avgMs: number };
  series: Minute[];
  sections?: SectionSummary[];
  topPages: TopPage[];
  recent: RecentRequest[];
};
type Day = { day: string; visitors: number; pageviews: number; requests: number; errors4xx?: number; errors5xx: number; bots: number };
type History = {
  days: number; from: string; to: string; series: Day[];
  totals: {
    visitorDays: number; pageviews: number; cleanPageviews?: number; requests: number;
    errors4xx?: number; errors5xx: number; bots: number; activeDays: number;
    averageDailyVisitors: number; peakDay: { day: string; visitors: number } | null;
  };
  sections?: SectionSummary[];
  topPages: TopPage[];
};
type Range = 'live' | '7d' | '30d' | '90d';
type State = { kind: 'loading' } | { kind: 'signin' } | { kind: 'denied' } | { kind: 'unavailable' } | { kind: 'error' } | { kind: 'ok'; data: Snapshot } | { kind: 'history'; data: History };
const RANGES: { value: Range; label: string }[] = [{ value: 'live', label: 'Live' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }];

const REFRESH_MS = 10_000, HISTORY_REFRESH_MS = 60_000;
const dayLabel = (day: string, long = false) => new Date(`${day}T00:00:00Z`).toLocaleDateString([], { timeZone: 'UTC', day: 'numeric', month: 'short', ...(long ? { weekday: 'short' } : {}) });
const time = (value: number) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const shortTime = (value: number) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const count = (value: number) => value.toLocaleString('en');

function SectionsPanel({
  title,
  sections,
  selected,
  onSelect,
  emptyMessage,
}: {
  title: string;
  sections: SectionSummary[];
  selected: string;
  onSelect: (section: string) => void;
  emptyMessage: string;
}) {
  const maxViews = Math.max(1, ...sections.map(item => item.views));
  return (
    <section className="live-traffic-panel" aria-labelledby="traffic-sections-title">
      <div className="live-traffic-panel-head">
        <h2 id="traffic-sections-title">{title}</h2>
        {selected !== 'All' && (
          <button type="button" className="live-traffic-clear" onClick={() => onSelect('All')}>
            Show all sections
          </button>
        )}
      </div>
      {sections.length ? (
        <ul className="live-traffic-sections">
          {sections.map(item => {
            const active = selected === item.section;
            return (
              <li key={item.section}>
                <button
                  type="button"
                  className="live-traffic-section-row"
                  aria-pressed={active}
                  onClick={() => onSelect(active ? 'All' : item.section)}
                >
                  <div className="live-traffic-section-label">
                    <strong>{item.section}</strong>
                    <span>{count(item.views)} <small>({item.share}%)</small></span>
                  </div>
                  <div className="live-traffic-meter" aria-hidden="true">
                    <i style={{ width: `${Math.max(2, (item.views / maxViews) * 100)}%` }} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="live-traffic-note">{emptyMessage}</p>
      )}
    </section>
  );
}

function TopPagesPanel({
  title,
  pages,
  sections,
  selectedSection,
  onSelectSection,
  emptyMessage,
}: {
  title: string;
  pages: TopPage[];
  sections: SectionSummary[];
  selectedSection: string;
  onSelectSection: (section: string) => void;
  emptyMessage: string;
}) {
  const filtered = selectedSection === 'All'
    ? pages
    : pages.filter(page => page.section === selectedSection);
  const maxViews = Math.max(1, ...filtered.map(page => page.views));
  const sectionChoices = ['All', ...sections.map(item => item.section)];

  return (
    <section className="live-traffic-panel" aria-labelledby="traffic-top-pages-title">
      <div className="live-traffic-panel-head">
        <h2 id="traffic-top-pages-title">{title}</h2>
        {selectedSection !== 'All' && <span className="live-traffic-badge">{selectedSection}</span>}
      </div>
      {sections.length > 1 && (
        <div className="live-traffic-chips" role="group" aria-label="Filter top pages by section">
          {sectionChoices.map(choice => (
            <button
              key={choice}
              type="button"
              aria-pressed={selectedSection === choice}
              onClick={() => onSelectSection(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
      )}
      {filtered.length ? (
        <ol className="live-traffic-top">
          {filtered.slice(0, 20).map(page => (
            <li key={page.path}>
              <div className="live-traffic-page-row">
                <a href={page.path}>{page.path}</a>
                {page.section && selectedSection === 'All' && (
                  <span className="live-traffic-tag">{page.section}</span>
                )}
                <span className="live-traffic-count">
                  {count(page.views)}
                  {typeof page.share === 'number' && <small> {page.share}%</small>}
                </span>
              </div>
              <div className="live-traffic-meter live-traffic-meter--thin" aria-hidden="true">
                <i style={{ width: `${Math.max(2, (page.views / maxViews) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="live-traffic-note">
          {selectedSection === 'All' ? emptyMessage : `No recorded pages in ${selectedSection} for this period.`}
        </p>
      )}
    </section>
  );
}

export function LiveTraffic() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [paused, setPaused] = useState(false);
  const [range, setRange] = useState<Range>('live');
  const [selectedSection, setSelectedSection] = useState('All');
  const [showAllTraffic, setShowAllTraffic] = useState(false);

  function selectRange(next: Range) {
    if (next === range) return;
    setRange(next);
    setSelectedSection('All');
    setState(previous => previous.kind === 'ok' || previous.kind === 'history' ? { kind: 'loading' } : previous);
  }

  useEffect(() => {
    let cancelled = false;
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

  const filter = (
    <div className="live-traffic-ranges" role="group" aria-label="Time range">
      {RANGES.map(option => (
        <button key={option.value} type="button" aria-pressed={range === option.value} onClick={() => selectRange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );

  if (state.kind === 'history') {
    return (
      <HistoryView
        data={state.data}
        filter={filter}
        selectedSection={selectedSection}
        onSelectSection={setSelectedSection}
      />
    );
  }

  if (state.kind !== 'ok') {
    const message = {
      loading: 'Loading live traffic…',
      signin: <>Sign in with the owner account to see live traffic. <Link href="/account">Go to account</Link></>,
      denied: 'This page is not available for this account.',
      unavailable: range === 'live' ? 'Live traffic is only recorded on the production server.' : 'Traffic history is only recorded on the production server.',
      error: 'Live traffic could not be loaded. It will retry automatically.',
    }[state.kind];
    return (
      <article className="live-traffic">
        <header className="live-traffic-header"><div><h1>Traffic</h1><p>{message}</p></div></header>
        {(state.kind === 'loading' || state.kind === 'unavailable') && filter}
      </article>
    );
  }

  const { data } = state;
  const sections = data.sections ?? [];
  const peakActivity = Math.max(1, ...data.series.map(minute => Math.max(minute.pages, minute.visitors)));
  const botsHour = data.lastHour.bots ?? data.last5.bots;
  const probesHour = data.lastHour.probes ?? 0;
  const recentRows = showAllTraffic
    ? data.recent
    : data.recent.filter(row => row.real ?? (!row.bot && !row.probe && row.status >= 200 && row.status < 300));
  const firstMinute = data.series[0]?.minute;
  const lastMinute = data.series[data.series.length - 1]?.minute;
  const windowLabel = data.windowMinutes === 60 ? 'last hour' : `last ${data.windowMinutes ?? 60} min`;

  return (
    <article className="live-traffic" aria-labelledby="live-traffic-title">
      <header className="live-traffic-header">
        <div>
          <h1 id="live-traffic-title">Traffic</h1>
          <p>Live · updated {time(data.generatedAt)} · counting since {new Date(data.since).toLocaleString()} (resets on deploy)</p>
        </div>
        <button type="button" className="live-traffic-toggle" onClick={() => setPaused(value => !value)}>
          {paused ? 'Resume updates' : 'Pause updates'}
        </button>
      </header>
      {filter}

      <section className="live-traffic-stats" aria-label="Current real user activity">
        <div data-emphasis="true">
          <strong>{count(data.activeVisitors.last5)}</strong>
          <span>real users (last 5 min · {count(data.activeVisitors.last1)} in 1 min)</span>
        </div>
        <div>
          <strong>{count(data.activeVisitors.last30)}</strong>
          <span>real users (last 30 min{typeof data.activeVisitors.last60 === 'number' ? ` · ${count(data.activeVisitors.last60)} in 1 hr` : ''})</span>
        </div>
        <div>
          <strong>{count(data.lastHour.pages)}</strong>
          <span>real page views (1 hr · {count(data.last5.pages)} in 5 min)</span>
        </div>
        <div>
          <strong>{count(botsHour)}</strong>
          <span>bots &amp; probes filtered (1 hr{probesHour > 0 ? ` · ${count(probesHour)} probes` : ''})</span>
        </div>
        <div data-alert={data.lastHour.errors5xx > 0 || undefined}>
          <strong>{count(data.lastHour.errors5xx)}</strong>
          <span>server errors (1 hr · {count(data.last5.errors5xx)} in 5 min)</span>
        </div>
        <div>
          <strong>{data.lastHour.avgMs} ms</strong>
          <span>avg response (1 hr · {count(data.lastHour.requests)} total req)</span>
        </div>
      </section>

      <section className="live-traffic-panel" aria-labelledby="live-traffic-chart">
        <h2 id="live-traffic-chart">Real users and page views per minute (last 60 minutes)</h2>
        <div className="live-traffic-chart live-traffic-days" role="img" aria-label={`Real page views and users per minute over the last hour, peak ${peakActivity}`}>
          {data.series.map(minute => (
            <span
              key={minute.minute}
              title={`${time(minute.minute)}: ${minute.visitors} real users, ${minute.pages} page views (${minute.requests} total req${minute.bots ? `, ${minute.bots} bots` : ''}${minute.errors ? `, ${minute.errors} errors` : ''})`}
            >
              <i className="live-traffic-bar-views" style={{ height: `${minute.pages ? Math.max(4, (minute.pages / peakActivity) * 100) : 0}%` }} />
              <i className="live-traffic-bar-visitors" style={{ height: `${minute.visitors ? Math.max(4, (minute.visitors / peakActivity) * 100) : 0}%` }} data-error={minute.errors > 0 || undefined} />
            </span>
          ))}
        </div>
        {firstMinute && lastMinute && (
          <div className="live-traffic-axis" aria-hidden="true">
            <span>{shortTime(firstMinute)}</span>
            <span>{shortTime(lastMinute)}</span>
          </div>
        )}
        <p className="live-traffic-note">
          <span className="live-traffic-key live-traffic-key-visitors" /> real users
          <span className="live-traffic-key live-traffic-key-views" /> real page views
          {' · '}slow (&gt;1 s, 5 min): {data.last5.slow} · 4xx (5 min): {data.last5.errors4xx}
        </p>
      </section>

      <div className="live-traffic-columns">
        <SectionsPanel
          title={`Most-used sections (${windowLabel})`}
          sections={sections}
          selected={selectedSection}
          onSelect={setSelectedSection}
          emptyMessage="No real learner page views in the last hour yet."
        />
        <TopPagesPanel
          title={`Most-requested pages (${windowLabel})`}
          pages={data.topPages}
          sections={sections}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          emptyMessage="No real learner page views in the last hour yet."
        />
      </div>

      <section className="live-traffic-panel" aria-labelledby="live-traffic-recent">
        <div className="live-traffic-panel-head">
          <h2 id="live-traffic-recent">Latest requests</h2>
          <div className="live-traffic-segmented" role="group" aria-label="Request filter">
            <button type="button" aria-pressed={!showAllTraffic} onClick={() => setShowAllTraffic(false)}>
              Real users
            </button>
            <button type="button" aria-pressed={showAllTraffic} onClick={() => setShowAllTraffic(true)}>
              All traffic ({data.recent.length})
            </button>
          </div>
        </div>
        {recentRows.length ? (
          <div className="live-traffic-table-wrap">
            <table className="live-traffic-table">
              <thead><tr><th>Time</th><th>Request</th><th>Section</th><th>Status</th><th>ms</th></tr></thead>
              <tbody>
                {recentRows.slice(0, 30).map((request, index) => (
                  <tr key={`${request.at}-${index}`} data-bot={(request.bot || request.probe) || undefined} data-error={request.status >= 500 || undefined}>
                    <td>{time(request.at)}</td>
                    <td>
                      <code>{request.method} {request.path}</code>
                      {request.rsc && !request.bot && <small className="live-traffic-pill">in-app</small>}
                      {request.probe && <small className="live-traffic-pill live-traffic-pill--warn">probe</small>}
                      {request.bot && !request.probe && <small className="live-traffic-pill">bot</small>}
                    </td>
                    <td>{request.section ? <span className="live-traffic-tag">{request.section}</span> : '—'}</td>
                    <td>{request.status}</td>
                    <td>{request.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="live-traffic-note">
            {showAllTraffic ? 'No requests yet.' : 'No real user requests yet. Switch to "All traffic" to see bots, probes and 4xx hits.'}
          </p>
        )}
      </section>

      <p className="live-traffic-note">
        Bots, exploit probes (such as <code>/wp-admin/*</code> and <code>*.php</code>), 4xx/5xx responses, prefetches, and owner <code>/admin</code> checks are excluded from real user and top-page counts. Visitors are estimated from a rotating anonymous hash; no IP addresses, accounts or query strings are stored. Static files served from CloudFront cache are not counted.
      </p>
    </article>
  );
}

function HistoryView({
  data,
  filter,
  selectedSection,
  onSelectSection,
}: {
  data: History;
  filter: ReactNode;
  selectedSection: string;
  onSelectSection: (section: string) => void;
}) {
  const peak = Math.max(1, ...data.series.map(day => Math.max(day.visitors, day.pageviews)));
  const { totals } = data;
  const sections = data.sections ?? [];
  const realPageViews = totals.cleanPageviews ?? totals.pageviews;

  return (
    <article className="live-traffic" aria-labelledby="traffic-history-title">
      <header className="live-traffic-header">
        <div>
          <h1 id="traffic-history-title">Traffic</h1>
          <p>Last {data.days} days · {dayLabel(data.from)} – {dayLabel(data.to)} (India time) · updates every minute</p>
        </div>
      </header>
      {filter}

      <section className="live-traffic-stats" aria-label="Totals for this period">
        <div data-emphasis="true">
          <strong>{totals.averageDailyVisitors}</strong>
          <span>avg real users per day ({totals.activeDays}/{data.days} active days)</span>
        </div>
        <div>
          <strong>{count(totals.peakDay ? totals.peakDay.visitors : 0)}</strong>
          <span>{totals.peakDay ? `busiest day (${dayLabel(totals.peakDay.day)})` : 'busiest day'}</span>
        </div>
        <div>
          <strong>{count(realPageViews)}</strong>
          <span>real page views (clean paths)</span>
        </div>
        <div>
          <strong>{count(totals.visitorDays)}</strong>
          <span>daily visits (each user once per day)</span>
        </div>
        <div>
          <strong>{count(totals.bots)}</strong>
          <span>bots &amp; probes filtered</span>
        </div>
        <div data-alert={totals.errors5xx > 0 || undefined}>
          <strong>{count(totals.errors5xx)}</strong>
          <span>server errors (5xx)</span>
        </div>
      </section>

      <div className="live-traffic-columns">
        <SectionsPanel
          title="Most-used sections"
          sections={sections}
          selected={selectedSection}
          onSelect={onSelectSection}
          emptyMessage="No page views recorded in this period yet."
        />
        <TopPagesPanel
          title="Most-requested pages"
          pages={data.topPages}
          sections={sections}
          selectedSection={selectedSection}
          onSelectSection={onSelectSection}
          emptyMessage="No page views recorded in this period yet."
        />
      </div>

      <section className="live-traffic-panel" aria-labelledby="traffic-history-chart">
        <h2 id="traffic-history-chart">Users and page views per day</h2>
        <div className="live-traffic-chart live-traffic-days" role="img" aria-label={`Daily users over the last ${data.days} days`}>
          {data.series.map(day => (
            <span key={day.day} title={`${dayLabel(day.day, true)}: ${day.visitors} users, ${day.pageviews} page views, ${day.bots} bots${day.errors5xx ? `, ${day.errors5xx} server errors` : ''}`}>
              <i className="live-traffic-bar-views" style={{ height: `${day.pageviews ? Math.max(3, (day.pageviews / peak) * 100) : 0}%` }} />
              <i className="live-traffic-bar-visitors" style={{ height: `${day.visitors ? Math.max(3, (day.visitors / peak) * 100) : 0}%` }} data-error={day.errors5xx > 0 || undefined} />
            </span>
          ))}
        </div>
        <div className="live-traffic-axis" aria-hidden="true"><span>{dayLabel(data.from)}</span><span>{dayLabel(data.to)}</span></div>
        <p className="live-traffic-note">
          <span className="live-traffic-key live-traffic-key-visitors" /> users
          <span className="live-traffic-key live-traffic-key-views" /> page views · hover a bar for the day’s numbers
        </p>
      </section>

      <p className="live-traffic-note">
        Bots, exploit probes, 4xx/5xx responses, prefetches and owner <code>/admin</code> hits are excluded from real counts. Earlier days before this filter update have their <code>.rsc</code> suffixes merged and probe paths removed, though their historical daily totals may still include earlier auto-prefetches. Each user is counted once per day with no cross-day tracking.
      </p>
    </article>
  );
}
