import assert from 'node:assert/strict';
import test from 'node:test';
import http, { createServer } from 'node:http';
import {
  classify,
  clientAddress,
  createTrafficRecorder,
  installTrafficRecorder,
  isBotAgent,
  isInternalPath,
  isPrefetchRequest,
  isProbePath,
  normalisePath,
  sectionForPath,
} from '../deploy/aws/traffic.mjs';

const browser = 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Safari/605.1.15';

test('live traffic counts real visitors, pages, sections and errors without storing addresses or query strings', () => {
  let clock = Date.UTC(2026, 10, 16, 8, 0, 30);
  const recorder = createTrafficRecorder({ now: () => clock });
  recorder.record({ url: '/stories?token=secret', status: 200, durationMs: 40, address: '203.0.113.5', userAgent: browser });
  recorder.record({ url: '/stories.rsc', status: 200, durationMs: 60, address: '203.0.113.5', userAgent: browser });
  recorder.record({ url: '/books/a1/x/1', status: 200, durationMs: 1500, address: '198.51.100.7', userAgent: browser });
  recorder.record({ url: '/api/progress', method: 'POST', status: 503, durationMs: 20, address: '198.51.100.7', userAgent: browser });
  recorder.record({ url: '/audio/books/p001.webm', status: 206, durationMs: 5, address: '198.51.100.7', userAgent: browser });
  recorder.record({ url: '/', status: 200, durationMs: 5, address: '192.0.2.1', userAgent: 'Googlebot/2.1' });
  recorder.record({ url: '/api/health', status: 200, durationMs: 1, address: '127.0.0.1', userAgent: 'curl/8' });
  recorder.record({ url: '/api/admin/live', status: 200, durationMs: 2, address: '203.0.113.99', userAgent: browser });
  clock += 20_000;
  const snapshot = recorder.snapshot();
  assert.equal(snapshot.activeVisitors.last5, 2);
  assert.equal(snapshot.last5.requests, 6);
  assert.equal(snapshot.last5.pages, 3, 'only real non-bot 2xx GET page views count');
  assert.equal(snapshot.last5.api, 1);
  assert.equal(snapshot.last5.bots, 1);
  assert.equal(snapshot.last5.errors5xx, 1);
  assert.equal(snapshot.last5.slow, 1);
  assert.deepEqual(snapshot.topPages[0], { path: '/stories', views: 2, section: 'Stories', share: 66.7 });
  assert.deepEqual(snapshot.topPages[1], { path: '/books/a1/x/1', views: 1, section: 'Books', share: 33.3 });
  assert.deepEqual(snapshot.sections, [
    { section: 'Stories', views: 2, share: 66.7 },
    { section: 'Books', views: 1, share: 33.3 },
  ]);
  assert.equal(snapshot.series.length, 60);
  assert.equal(snapshot.series.at(-1).requests, 6);
  assert.equal(snapshot.series.at(-1).pages, 3);
  assert.equal(snapshot.recent.length, 5, 'static assets and ignored endpoints are excluded from the request list');
  const serialised = JSON.stringify(snapshot);
  assert.doesNotMatch(serialised, /203\.0\.113\.5|198\.51\.100\.7|secret|token=/);
  assert.doesNotMatch(serialised, /\/api\/health|\/api\/admin\/live/);
});

test('probes, 404s, HEAD requests, prefetches and /admin hits do not inflate real visitors or top pages', () => {
  let clock = Date.UTC(2026, 10, 27, 10, 0, 0);
  const recorder = createTrafficRecorder({ now: () => clock });
  // Real user hits grammar
  recorder.record({ url: '/grammar', status: 200, durationMs: 20, address: '203.0.113.10', userAgent: browser });
  // Scanner with a spoofed browser User-Agent hits WordPress & .env
  recorder.record({ url: '/wp-admin/install.php', status: 404, durationMs: 3, address: '198.51.100.40', userAgent: browser });
  recorder.record({ url: '/.env', status: 404, durationMs: 2, address: '198.51.100.41', userAgent: browser });
  // Random 404 page and HEAD ping
  recorder.record({ url: '/does-not-exist', status: 404, durationMs: 4, address: '198.51.100.42', userAgent: browser });
  recorder.record({ url: '/', method: 'HEAD', status: 200, durationMs: 2, address: '198.51.100.43', userAgent: browser });
  // Owner viewing /admin/live & auth callback
  recorder.record({ url: '/admin/live', status: 200, durationMs: 10, address: '198.51.100.44', userAgent: browser });
  recorder.record({ url: '/auth/confirm', status: 200, durationMs: 10, address: '198.51.100.44', userAgent: browser });
  // Background prefetch
  recorder.record({ url: '/books/a1/der-schluessel-im-blauen-korb.rsc', status: 200, durationMs: 8, address: '203.0.113.10', userAgent: browser, prefetch: true });

  const snapshot = recorder.snapshot();
  assert.equal(snapshot.activeVisitors.last5, 1, 'only the real learner counts as an active visitor');
  assert.equal(snapshot.lastHour.pages, 1);
  assert.equal(snapshot.lastHour.probes, 2);
  assert.equal(snapshot.lastHour.bots, 2);
  assert.equal(snapshot.lastHour.errors4xx, 3);
  assert.deepEqual(snapshot.topPages, [{ path: '/grammar', views: 1, section: 'Grammar', share: 100 }]);
  assert.deepEqual(snapshot.sections, [{ section: 'Grammar', views: 1, share: 100 }]);
  assert.equal(snapshot.recent.filter(row => row.real).length, 1);
  assert.equal(snapshot.recent.filter(row => row.probe).length, 2);
});

test('visitors expire after 30/60 minutes and old minutes leave the hourly window', () => {
  let clock = Date.UTC(2026, 10, 16, 8, 0, 0);
  const recorder = createTrafficRecorder({ now: () => clock });
  recorder.record({ url: '/', address: 'a', userAgent: browser });
  clock += 31 * 60_000;
  recorder.record({ url: '/', address: 'b', userAgent: browser });
  let snapshot = recorder.snapshot();
  assert.equal(snapshot.activeVisitors.last30, 1);
  assert.equal(snapshot.activeVisitors.last60, 2);
  assert.equal(snapshot.lastHour.requests, 2);
  clock += 61 * 60_000;
  snapshot = recorder.snapshot();
  assert.equal(snapshot.lastHour.requests, 0);
  assert.equal(snapshot.activeVisitors.last30, 0);
  assert.equal(snapshot.activeVisitors.last60, 0);
});

test('path helpers normalise, classify, detect probes/prefetches and group sections', () => {
  assert.equal(normalisePath('/a?b=1#c'), '/a');
  assert.equal(normalisePath('/stories/b1.rsc?_rsc=abc'), '/stories/b1');
  assert.equal(normalisePath('/.rsc'), '/');
  assert.equal(normalisePath('/grammar/'), '/grammar');
  assert.equal(classify('/api/health'), 'ignored');
  assert.equal(classify('/api/admin/live'), 'ignored');
  assert.equal(classify('/api/account'), 'api');
  assert.equal(classify('/assets/app-1.js'), 'asset');
  assert.equal(classify('/stories/reading-a1-01-v1'), 'page');
  assert.equal(classify('/stories/b1', { prefetch: true }), 'prefetch');
  assert.equal(isProbePath('/wp-admin/install.php'), true);
  assert.equal(isProbePath('/.env'), true);
  assert.equal(isProbePath('/xmlrpc.php'), true);
  assert.equal(isProbePath('/grammar'), false);
  assert.equal(isInternalPath('/admin/live'), true);
  assert.equal(isInternalPath('/auth/confirm'), true);
  assert.equal(isInternalPath('/stories'), false);
  assert.equal(isBotAgent('AhrefsBot/7.0'), true);
  assert.equal(isBotAgent('GPTBot/1.0'), true);
  assert.equal(isBotAgent(browser), false);
  assert.equal(isPrefetchRequest({ 'sec-purpose': 'prefetch' }), true);
  assert.equal(isPrefetchRequest({ 'next-router-prefetch': '1' }), true);
  assert.equal(isPrefetchRequest({ accept: 'text/html' }), false);
  assert.equal(sectionForPath('/'), 'Home');
  assert.equal(sectionForPath('/stories/reading-a1-01-v1.rsc'), 'Stories');
  assert.equal(sectionForPath('/books/a1/der-schluessel-im-blauen-korb'), 'Books');
  assert.equal(sectionForPath('/grammar/lessons/dative-case-basics'), 'Grammar');
  assert.equal(sectionForPath('/vocabulary/a1'), 'Vocabulary');
  assert.equal(sectionForPath('/review'), 'Practice & review');
});

test('installed recorder wraps the named node:http createServer import used by Vinext', async () => {
  const original = http.createServer;
  try {
    installTrafficRecorder(http, createTrafficRecorder());
    const server = createServer((request, response) => { response.statusCode = request.url === '/missing' ? 404 : 200; response.end('ok'); });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    for (const [path, extraHeaders] of [
      ['/', {}],
      ['/stories.rsc?x=1', { rsc: '1' }],
      ['/books.rsc', { 'next-router-prefetch': '1' }],
      ['/missing', {}],
    ]) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        headers: { 'user-agent': browser, 'x-forwarded-for': '203.0.113.9, 10.0.0.1', ...extraHeaders },
      });
      await response.text();
    }
    await new Promise(resolve => setTimeout(resolve, 20));
    await new Promise(resolve => server.close(resolve));
    const snapshot = globalThis.__leselautTraffic.snapshot();
    assert.equal(snapshot.last5.requests, 4);
    assert.equal(snapshot.last5.pages, 2, 'prefetch and 404 do not count as real page views');
    assert.equal(snapshot.last5.errors4xx, 1);
    assert.equal(snapshot.activeVisitors.last5, 1);
    assert.deepEqual(snapshot.recent.map(entry => entry.path), ['/missing', '/stories', '/']);
    assert.equal(snapshot.recent.find(entry => entry.path === '/stories').rsc, true);
  } finally {
    http.createServer = original;
    delete globalThis.__leselautTraffic;
  }
});

test('traffic history keeps daily counts, cleans legacy .rsc/probe rows, groups sections and deletes old visitor hashes', async () => {
  const { createTrafficStore, trafficDay } = await import('../deploy/aws/traffic-store.mjs');
  const { mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { DatabaseSync } = await import('node:sqlite');
  const file = join(mkdtempSync(join(tmpdir(), 'leselaut-traffic-')), 'traffic.sqlite');
  let clock = Date.UTC(2026, 10, 10, 6, 0, 0);
  const store = createTrafficStore(file, { now: () => clock });
  const visit = (address, path = '/stories', extra = {}) => store.add({ time: clock, kind: 'page', method: 'GET', status: 200, bot: false, address, userAgent: 'Safari', path, ...extra });
  visit('203.0.113.1'); visit('203.0.113.1', '/books'); visit('203.0.113.2');
  store.add({ time: clock, kind: 'page', status: 200, bot: true, address: '192.0.2.9', userAgent: 'Googlebot', path: '/' });
  store.add({ time: clock, kind: 'page', status: 404, bot: false, address: '198.51.100.8', userAgent: 'Safari', path: '/wp-admin/install.php' });
  store.add({ time: clock, kind: 'api', status: 503, bot: false, address: '203.0.113.2', userAgent: 'Safari', path: '/api/progress' });
  store.flush();
  store.close();

  // Seed legacy pre-update page rows directly to confirm history() cleans & merges them on read.
  const seedDb = new DatabaseSync(file);
  seedDb.prepare('INSERT INTO traffic_daily_pages(day, path, views) VALUES (?, ?, ?)').run('2026-11-10', '/stories.rsc', 2);
  seedDb.prepare('INSERT INTO traffic_daily_pages(day, path, views) VALUES (?, ?, ?)').run('2026-11-10', '/wp-admin/install.php', 99);
  seedDb.prepare('INSERT INTO traffic_daily_pages(day, path, views) VALUES (?, ?, ?)').run('2026-11-10', '/admin/live', 15);
  seedDb.close();

  // Same visitor again later that day (after a "restart") is not double counted.
  const reopened = createTrafficStore(file, { now: () => clock });
  reopened.add({ time: clock, kind: 'page', status: 200, bot: false, address: '203.0.113.1', userAgent: 'Safari', path: '/stories' });
  clock += 3 * 86_400_000;
  reopened.add({ time: clock, kind: 'page', status: 200, bot: false, address: '203.0.113.1', userAgent: 'Safari', path: '/' });
  const history = reopened.history(30);
  assert.equal(history.series.length, 30);
  assert.equal(history.to, trafficDay(clock));
  const first = history.series.find(day => day.day === '2026-11-10');
  assert.deepEqual(
    { visitors: first.visitors, pageviews: first.pageviews, errors5xx: first.errors5xx, bots: first.bots },
    { visitors: 2, pageviews: 4, errors5xx: 1, bots: 2 },
  );
  assert.equal(history.totals.visitorDays, 3);
  assert.equal(history.totals.activeDays, 2);
  assert.deepEqual(history.totals.peakDay, { day: '2026-11-10', visitors: 2 });
  // /stories (3 new) + /stories.rsc (2 legacy) = 5; /wp-admin/install.php and /admin/live filtered out
  assert.deepEqual(history.topPages.map(p => [p.path, p.views]), [
    ['/stories', 5],
    ['/', 1],
    ['/books', 1],
  ]);
  assert.deepEqual(history.sections.map(s => [s.section, s.views]), [
    ['Stories', 5],
    ['Books', 1],
    ['Home', 1],
  ]);
  assert.equal(history.totals.cleanPageviews, 7);
  reopened.close();
  const db = new DatabaseSync(file);
  assert.deepEqual(db.prepare('SELECT DISTINCT day FROM traffic_day_visitors').all().map(row => row.day), ['2026-11-13'], 'hashes older than yesterday are deleted');
  assert.deepEqual(db.prepare('SELECT day FROM traffic_salts').all().map(row => row.day), ['2026-11-13']);
  const everything = JSON.stringify(db.prepare('SELECT * FROM traffic_daily').all()) + JSON.stringify(db.prepare('SELECT * FROM traffic_day_visitors').all());
  assert.doesNotMatch(everything, /203\.0\.113|Safari/);
  db.close();
});

test('day boundaries follow India time', async () => {
  const { trafficDay } = await import('../deploy/aws/traffic-store.mjs');
  assert.equal(trafficDay(Date.UTC(2026, 10, 15, 18, 29)), '2026-11-15');
  assert.equal(trafficDay(Date.UTC(2026, 10, 15, 18, 31)), '2026-11-16');
});

test('recorder passes non-prefetch requests to the history store and exposes history', () => {
  const added = [];
  const recorder = createTrafficRecorder({ store: { add: value => added.push(value), history: days => ({ days }) } });
  recorder.record({ url: '/stories?x=1', status: 200, address: 'a', userAgent: 'Safari' });
  recorder.record({ url: '/books.rsc', status: 200, address: 'a', userAgent: 'Safari', prefetch: true });
  recorder.record({ url: '/api/health', status: 200, address: 'a', userAgent: 'curl' });
  assert.equal(added.length, 1);
  assert.equal(added[0].path, '/stories');
  assert.deepEqual(recorder.history(30), { days: 30 });
  assert.equal(createTrafficRecorder().history(30), null);
});

test('clientAddress uses the CloudFront-appended hop and ignores spoofed leftmost X-Forwarded-For values', async () => {
  assert.equal(clientAddress({ 'x-forwarded-for': '1.1.1.1, 203.0.113.9, 10.0.0.1' }, '127.0.0.1'), '203.0.113.9');
  assert.equal(clientAddress({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3, 203.0.113.9, 10.0.0.1' }, '127.0.0.1'), '203.0.113.9');
  assert.equal(clientAddress({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }, '127.0.0.1'), '203.0.113.9');
  assert.equal(clientAddress({ 'x-forwarded-for': '203.0.113.9' }, '127.0.0.1'), '203.0.113.9');
  assert.equal(clientAddress({}, '127.0.0.1'), '127.0.0.1');

  const original = http.createServer;
  try {
    installTrafficRecorder(http, createTrafficRecorder());
    const server = createServer((_request, response) => { response.statusCode = 200; response.end('ok'); });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    for (const spoof of ['198.51.100.1', '198.51.100.2', '198.51.100.3']) {
      const response = await fetch(`http://127.0.0.1:${port}/stories`, {
        headers: { 'user-agent': browser, 'x-forwarded-for': `${spoof}, 203.0.113.9, 10.0.0.1` },
      });
      await response.text();
    }
    await new Promise(resolve => setTimeout(resolve, 20));
    await new Promise(resolve => server.close(resolve));
    assert.equal(globalThis.__leselautTraffic.snapshot().activeVisitors.last5, 1);
  } finally {
    http.createServer = original;
    delete globalThis.__leselautTraffic;
  }
});

test('disableLinkAutoPrefetch plugin disables Vinext viewport prefetching cleanly', async () => {
  const { readFileSync } = await import('node:fs');
  const { disableLinkAutoPrefetch } = await import('../build/link-prefetch-vite-plugin.ts');
  const plugin = disableLinkAutoPrefetch();
  const shimPath = 'node_modules/vinext/dist/shims/link-prefetch.js';
  const original = readFileSync(shimPath, 'utf8');
  const result = plugin.transform(original, `/repo/${shimPath}`);
  assert.ok(result && typeof result.code === 'string');
  assert.match(result.code, /function canLinkPrefetch\(\) \{\s*return false;\s*\}/);
});
