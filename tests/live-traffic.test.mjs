import assert from 'node:assert/strict';
import test from 'node:test';
import http, { createServer } from 'node:http';
import { createTrafficRecorder, installTrafficRecorder, normalisePath, classify } from '../deploy/aws/traffic.mjs';

const browser = 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Safari/605.1.15';

test('live traffic counts visitors, pages and errors without storing addresses or query strings', () => {
  let clock = Date.UTC(2026, 10, 16, 8, 0, 30);
  const recorder = createTrafficRecorder({ now: () => clock });
  recorder.record({ url: '/stories?token=secret', status: 200, durationMs: 40, address: '203.0.113.5', userAgent: browser });
  recorder.record({ url: '/stories', status: 200, durationMs: 60, address: '203.0.113.5', userAgent: browser });
  recorder.record({ url: '/books/a1/x/1', status: 200, durationMs: 1500, address: '198.51.100.7', userAgent: browser });
  recorder.record({ url: '/api/progress', method: 'POST', status: 503, durationMs: 20, address: '198.51.100.7', userAgent: browser });
  recorder.record({ url: '/audio/books/p001.webm', status: 206, durationMs: 5, address: '198.51.100.7', userAgent: browser });
  recorder.record({ url: '/', status: 200, durationMs: 5, address: '192.0.2.1', userAgent: 'Googlebot/2.1' });
  recorder.record({ url: '/api/health', status: 200, durationMs: 1, address: '127.0.0.1', userAgent: 'curl/8' });
  clock += 20_000;
  const snapshot = recorder.snapshot();
  assert.equal(snapshot.activeVisitors.last5, 2);
  assert.equal(snapshot.last5.requests, 6);
  assert.equal(snapshot.last5.pages, 4);
  assert.equal(snapshot.last5.api, 1);
  assert.equal(snapshot.last5.bots, 1);
  assert.equal(snapshot.last5.errors5xx, 1);
  assert.equal(snapshot.last5.slow, 1);
  assert.deepEqual(snapshot.topPages[0], { path: '/stories', views: 2 });
  assert.equal(snapshot.series.length, 60);
  assert.equal(snapshot.series.at(-1).requests, 6);
  assert.equal(snapshot.recent.length, 5, 'static assets are excluded from the request list');
  const serialised = JSON.stringify(snapshot);
  assert.doesNotMatch(serialised, /203\.0\.113\.5|198\.51\.100\.7|secret|token=/);
  assert.doesNotMatch(serialised, /\/api\/health/);
});

test('visitors expire after 30 minutes and old minutes leave the hourly window', () => {
  let clock = Date.UTC(2026, 10, 16, 8, 0, 0);
  const recorder = createTrafficRecorder({ now: () => clock });
  recorder.record({ url: '/', address: 'a', userAgent: browser });
  clock += 31 * 60_000;
  recorder.record({ url: '/', address: 'b', userAgent: browser });
  let snapshot = recorder.snapshot();
  assert.equal(snapshot.activeVisitors.last30, 1);
  assert.equal(snapshot.lastHour.requests, 2);
  clock += 61 * 60_000;
  snapshot = recorder.snapshot();
  assert.equal(snapshot.lastHour.requests, 0);
  assert.equal(snapshot.activeVisitors.last30, 0);
});

test('path helpers normalise and classify requests', () => {
  assert.equal(normalisePath('/a?b=1#c'), '/a');
  assert.equal(classify('/api/health'), 'ignored');
  assert.equal(classify('/api/account'), 'api');
  assert.equal(classify('/assets/app-1.js'), 'asset');
  assert.equal(classify('/stories/reading-a1-01-v1'), 'page');
});

test('installed recorder wraps the named node:http createServer import used by Vinext', async () => {
  const original = http.createServer;
  try {
    installTrafficRecorder(http, createTrafficRecorder());
    const server = createServer((request, response) => { response.statusCode = request.url === '/missing' ? 404 : 200; response.end('ok'); });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    for (const path of ['/', '/stories?x=1', '/missing']) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, { headers: { 'user-agent': browser, 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } });
      await response.text();
    }
    await new Promise(resolve => setTimeout(resolve, 20));
    await new Promise(resolve => server.close(resolve));
    const snapshot = globalThis.__leselautTraffic.snapshot();
    assert.equal(snapshot.last5.requests, 3);
    assert.equal(snapshot.last5.errors4xx, 1);
    assert.equal(snapshot.activeVisitors.last5, 1);
    assert.deepEqual(snapshot.recent.map(entry => entry.path), ['/missing', '/stories', '/']);
  } finally {
    http.createServer = original;
    delete globalThis.__leselautTraffic;
  }
});
