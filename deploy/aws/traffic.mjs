// In-memory, privacy-preserving live traffic counter for the single AWS host.
// Nothing is written to disk. Visitors are counted with a salted hash of
// (address + user agent) that rotates every few hours and is never exposed;
// query strings, IP addresses, account IDs and headers are never stored.
import { createHash, randomBytes } from 'node:crypto';
import { syncBuiltinESMExports } from 'node:module';

const MINUTES = 60, RECENT = 60, VISITOR_WINDOW_MS = 30 * 60_000, MAX_VISITORS = 50_000, MAX_PATHS_PER_MINUTE = 300;
const BOT = /bot|crawl|spider|slurp|curl|wget|python|httpclient|headless|lighthouse|monitor|uptime|preview|facebookexternalhit|node-fetch|go-http|okhttp|java\//i;
const ASSET = /^\/(?:assets|audio|media|images|fonts|_next|icons?)\/|\.(?:js|css|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|webm|m4a|mp3|json|txt|xml|webmanifest)$/i;
const IGNORED = new Set(['/api/health']);

export function classify(path) {
  if (IGNORED.has(path)) return 'ignored';
  if (path.startsWith('/api/')) return 'api';
  if (ASSET.test(path)) return 'asset';
  return 'page';
}

export function normalisePath(url) {
  const path = String(url || '/').split('?')[0].split('#')[0] || '/';
  return path.length > 160 ? `${path.slice(0, 157)}...` : path;
}

export function createTrafficRecorder({ now = () => Date.now(), saltHours = 6 } = {}) {
  let salt = randomBytes(16), saltSince = now();
  const minutes = new Map(), visitors = new Map(), recent = [];
  const startedAt = now();

  const minuteKey = time => Math.floor(time / 60_000) * 60_000;
  function bucket(time) {
    const key = minuteKey(time);
    let entry = minutes.get(key);
    if (!entry) {
      entry = { minute: key, requests: 0, pages: 0, api: 0, assets: 0, bots: 0, errors4xx: 0, errors5xx: 0, slow: 0, totalMs: 0, visitors: new Set(), paths: new Map() };
      minutes.set(key, entry);
      for (const old of minutes.keys()) if (old < key - MINUTES * 60_000) minutes.delete(old);
    }
    return entry;
  }
  function visitorKey(address, agent, time) {
    if (time - saltSince > saltHours * 3_600_000) { salt = randomBytes(16); saltSince = time; visitors.clear(); }
    return createHash('sha256').update(salt).update(String(address)).update('\0').update(String(agent).slice(0, 300)).digest('base64url').slice(0, 16);
  }

  function record({ method = 'GET', url = '/', status = 200, durationMs = 0, address = '', userAgent = '' }) {
    const path = normalisePath(url), kind = classify(path);
    if (kind === 'ignored') return;
    const time = now(), entry = bucket(time), bot = BOT.test(userAgent) || !userAgent;
    entry.requests++; entry.totalMs += durationMs;
    if (durationMs > 1000) entry.slow++;
    if (status >= 500) entry.errors5xx++; else if (status >= 400) entry.errors4xx++;
    if (bot) entry.bots++;
    if (kind === 'page') entry.pages++; else if (kind === 'api') entry.api++; else entry.assets++;
    if (!bot && kind !== 'asset') {
      const key = visitorKey(address, userAgent, time);
      entry.visitors.add(key);
      visitors.set(key, time);
      if (visitors.size > MAX_VISITORS) for (const [k, seen] of visitors) { if (time - seen > VISITOR_WINDOW_MS || visitors.size > MAX_VISITORS) visitors.delete(k); else break; }
      if (kind === 'page' && (entry.paths.has(path) || entry.paths.size < MAX_PATHS_PER_MINUTE)) entry.paths.set(path, (entry.paths.get(path) ?? 0) + 1);
    }
    if (kind !== 'asset') {
      recent.push({ at: time, method: String(method).slice(0, 8), path, status, ms: Math.round(durationMs), bot });
      if (recent.length > RECENT) recent.shift();
    }
  }

  function snapshot() {
    const time = now(), current = minuteKey(time);
    const series = [];
    for (let i = MINUTES - 1; i >= 0; i--) {
      const key = current - i * 60_000, entry = minutes.get(key);
      series.push({ minute: key, requests: entry?.requests ?? 0, pages: entry?.pages ?? 0, visitors: entry?.visitors.size ?? 0, errors: (entry?.errors5xx ?? 0) });
    }
    const since = ms => [...minutes.values()].filter(entry => entry.minute >= current - ms + 60_000);
    const sum = (list, field) => list.reduce((total, entry) => total + entry[field], 0);
    const last5 = since(5 * 60_000), last60 = since(60 * 60_000);
    const active = cutoff => { let count = 0; for (const seen of visitors.values()) if (seen >= time - cutoff) count++; return count; };
    const paths = new Map();
    for (const entry of since(15 * 60_000)) for (const [path, count] of entry.paths) paths.set(path, (paths.get(path) ?? 0) + count);
    const requests60 = sum(last60, 'requests');
    return {
      available: true,
      generatedAt: time,
      since: startedAt,
      activeVisitors: { last1: active(60_000), last5: active(5 * 60_000), last30: active(VISITOR_WINDOW_MS) },
      last5: { requests: sum(last5, 'requests'), pages: sum(last5, 'pages'), api: sum(last5, 'api'), bots: sum(last5, 'bots'), errors5xx: sum(last5, 'errors5xx'), errors4xx: sum(last5, 'errors4xx'), slow: sum(last5, 'slow') },
      lastHour: { requests: requests60, pages: sum(last60, 'pages'), errors5xx: sum(last60, 'errors5xx'), avgMs: requests60 ? Math.round(sum(last60, 'totalMs') / requests60) : 0 },
      series,
      topPages: [...paths].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, views]) => ({ path, views })),
      recent: [...recent].reverse(),
    };
  }

  return { record, snapshot };
}

// Wraps Node's HTTP request handler without changing responses.
export function installTrafficRecorder(http, recorder = createTrafficRecorder()) {
  globalThis.__leselautTraffic = recorder;
  const original = http.createServer;
  http.createServer = function createServer(...args) {
    const index = args.findIndex(arg => typeof arg === 'function');
    if (index >= 0) {
      const handler = args[index];
      args[index] = function trafficHandler(request, response) {
        const started = process.hrtime.bigint();
        response.once('finish', () => {
          try {
            const forwarded = String(request.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
            recorder.record({ method: request.method, url: request.url, status: response.statusCode, durationMs: Number(process.hrtime.bigint() - started) / 1e6, address: forwarded || request.socket?.remoteAddress || '', userAgent: String(request.headers['user-agent'] ?? '') });
          } catch { /* never affect serving */ }
        });
        return handler.call(this, request, response);
      };
    }
    return original.apply(this, args);
  };
  // Vinext imports { createServer } from "node:http"; refresh that live binding.
  syncBuiltinESMExports();
  return recorder;
}
