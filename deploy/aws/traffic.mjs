// In-memory, privacy-preserving live traffic counter for the single AWS host.
// Nothing is written to disk. Visitors are counted with a salted hash of
// (address + user agent) that rotates every few hours and is never exposed;
// query strings, IP addresses, account IDs and headers are never stored.
import { createHash, randomBytes } from 'node:crypto';
import { syncBuiltinESMExports } from 'node:module';
import { dirname, join } from 'node:path';
import {
  classify,
  createTrafficStore,
  isBotAgent,
  isInternalPath,
  isPrefetchRequest,
  isProbePath,
  isRealPageView,
  isRealVisitorEvent,
  isRscUrl,
  normalisePath,
  sectionForPath,
  summarizePaths,
} from './traffic-store.mjs';

export {
  classify,
  isBotAgent,
  isInternalPath,
  isPrefetchRequest,
  isProbePath,
  isRealPageView,
  isRealVisitorEvent,
  isRscUrl,
  normalisePath,
  sectionForPath,
  summarizePaths,
};

const MINUTES = 60, RECENT = 80, VISITOR_WINDOW_MS = 60 * 60_000, MAX_VISITORS = 50_000, MAX_PATHS_PER_MINUTE = 300;

export function createTrafficRecorder({ now = () => Date.now(), saltHours = 6, store = null } = {}) {
  let salt = randomBytes(16), saltSince = now();
  const minutes = new Map(), visitors = new Map(), recent = [];
  const startedAt = now();

  const minuteKey = time => Math.floor(time / 60_000) * 60_000;
  function bucket(time) {
    const key = minuteKey(time);
    let entry = minutes.get(key);
    if (!entry) {
      entry = { minute: key, requests: 0, pages: 0, api: 0, assets: 0, prefetches: 0, bots: 0, probes: 0, errors4xx: 0, errors5xx: 0, slow: 0, totalMs: 0, visitors: new Set(), paths: new Map() };
      minutes.set(key, entry);
      for (const old of minutes.keys()) if (old < key - MINUTES * 60_000) minutes.delete(old);
    }
    return entry;
  }
  function visitorKey(address, agent, time) {
    if (time - saltSince > saltHours * 3_600_000) { salt = randomBytes(16); saltSince = time; visitors.clear(); }
    return createHash('sha256').update(salt).update(String(address)).update('\0').update(String(agent).slice(0, 300)).digest('base64url').slice(0, 16);
  }

  function record({ method = 'GET', url = '/', status = 200, durationMs = 0, address = '', userAgent = '', prefetch = false, rsc = undefined }) {
    const rawRsc = rsc ?? isRscUrl(url);
    const path = normalisePath(url), kind = classify(path, { prefetch });
    if (kind === 'ignored') return;
    const upperMethod = String(method || 'GET').toUpperCase().slice(0, 8);
    const time = now(), entry = bucket(time);
    const probe = isProbePath(path);
    const bot = isBotAgent(userAgent) || probe;
    if (store && kind !== 'prefetch') {
      try { store.add({ time, kind, method: upperMethod, status, bot, probe, address, userAgent, path }); } catch { /* history is best effort */ }
    }
    entry.requests++; entry.totalMs += durationMs;
    if (durationMs > 1000) entry.slow++;
    if (status >= 500) entry.errors5xx++; else if (status >= 400) entry.errors4xx++;
    if (probe) entry.probes++;
    if (bot) entry.bots++;
    if (kind === 'api') entry.api++;
    else if (kind === 'asset') entry.assets++;
    else if (kind === 'prefetch') entry.prefetches++;

    const realPage = isRealPageView({ kind, method: upperMethod, status, bot, probe, path });
    const realVisitor = isRealVisitorEvent({ kind, method: upperMethod, status, bot, probe, path });
    if (realPage) {
      entry.pages++;
      if (entry.paths.has(path) || entry.paths.size < MAX_PATHS_PER_MINUTE) {
        entry.paths.set(path, (entry.paths.get(path) ?? 0) + 1);
      }
    }
    if (realVisitor) {
      const key = visitorKey(address, userAgent, time);
      entry.visitors.add(key);
      visitors.set(key, time);
      if (visitors.size > MAX_VISITORS) {
        for (const [k, seen] of visitors) {
          if (time - seen > VISITOR_WINDOW_MS || visitors.size > MAX_VISITORS) visitors.delete(k); else break;
        }
      }
    }
    if (kind !== 'asset' && kind !== 'prefetch') {
      recent.push({
        at: time,
        method: upperMethod,
        path,
        status,
        ms: Math.round(durationMs),
        bot,
        probe,
        rsc: Boolean(rawRsc),
        real: realPage || (realVisitor && kind === 'api'),
        section: kind === 'page' && !probe && !isInternalPath(path) ? sectionForPath(path) : null,
      });
      if (recent.length > RECENT) recent.shift();
    }
  }

  function snapshot() {
    const time = now(), current = minuteKey(time);
    const series = [];
    for (let i = MINUTES - 1; i >= 0; i--) {
      const key = current - i * 60_000, entry = minutes.get(key);
      series.push({
        minute: key,
        requests: entry?.requests ?? 0,
        pages: entry?.pages ?? 0,
        visitors: entry?.visitors.size ?? 0,
        bots: entry?.bots ?? 0,
        errors: entry?.errors5xx ?? 0,
      });
    }
    const since = ms => [...minutes.values()].filter(entry => entry.minute >= current - ms + 60_000);
    const sum = (list, field) => list.reduce((total, entry) => total + entry[field], 0);
    const last5 = since(5 * 60_000), last60 = since(60 * 60_000);
    const active = cutoff => { let count = 0; for (const seen of visitors.values()) if (seen >= time - cutoff) count++; return count; };
    const paths = new Map();
    for (const entry of last60) {
      for (const [path, count] of entry.paths) paths.set(path, (paths.get(path) ?? 0) + count);
    }
    const { sections, topPages } = summarizePaths(paths, 30);
    const requests60 = sum(last60, 'requests');
    return {
      available: true,
      generatedAt: time,
      since: startedAt,
      windowMinutes: MINUTES,
      activeVisitors: { last1: active(60_000), last5: active(5 * 60_000), last30: active(30 * 60_000), last60: active(60 * 60_000) },
      last5: {
        requests: sum(last5, 'requests'),
        pages: sum(last5, 'pages'),
        api: sum(last5, 'api'),
        bots: sum(last5, 'bots'),
        probes: sum(last5, 'probes'),
        errors5xx: sum(last5, 'errors5xx'),
        errors4xx: sum(last5, 'errors4xx'),
        slow: sum(last5, 'slow'),
      },
      lastHour: {
        requests: requests60,
        pages: sum(last60, 'pages'),
        bots: sum(last60, 'bots'),
        probes: sum(last60, 'probes'),
        errors4xx: sum(last60, 'errors4xx'),
        errors5xx: sum(last60, 'errors5xx'),
        avgMs: requests60 ? Math.round(sum(last60, 'totalMs') / requests60) : 0,
      },
      series,
      sections,
      topPages,
      recent: [...recent].reverse(),
    };
  }

  function history(days) { return store ? store.history(days) : null; }

  return { record, snapshot, history };
}

// Wraps Node's HTTP request handler without changing responses.
function defaultRecorder() {
  let store = null;
  const database = process.env.LESELAUT_SQLITE_PATH;
  if (database) {
    try {
      store = createTrafficStore(join(dirname(database), 'traffic.sqlite'));
      const timer = setInterval(() => { try { store.flush(); } catch (error) { console.error(JSON.stringify({ event: 'traffic_flush_failed', message: String(error?.message ?? error).slice(0, 200) })); } }, 60_000);
      timer.unref();
      process.once('exit', () => { try { store.flush(); } catch { /* shutting down */ } });
    } catch (error) {
      store = null;
      console.error(JSON.stringify({ event: 'traffic_store_unavailable', message: String(error?.message ?? error).slice(0, 200) }));
    }
  }
  return createTrafficRecorder({ store });
}

// CloudFront appends the real viewer IP and Nginx appends CloudFront's edge IP
// (`client-spoofed..., viewer, cloudfront-edge`), so the second-to-last hop
// prevents callers from forging arbitrary leftmost X-Forwarded-For addresses.
export function clientAddress(headers, remoteAddress = '') {
  const raw = Array.isArray(headers?.['x-forwarded-for'])
    ? headers['x-forwarded-for'].join(',')
    : String(headers?.['x-forwarded-for'] ?? '');
  const hops = raw.split(',').map(part => part.trim()).filter(Boolean);
  if (hops.length >= 2) return hops[hops.length - 2];
  if (hops.length === 1) return hops[0];
  return String(remoteAddress || '');
}

export function installTrafficRecorder(http, recorder = defaultRecorder()) {
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
            const address = clientAddress(request.headers, request.socket?.remoteAddress);
            const prefetch = isPrefetchRequest(request.headers);
            const rsc = isRscUrl(request.url) || String(request.headers?.rsc ?? '') === '1';
            recorder.record({
              method: request.method,
              url: request.url,
              status: response.statusCode,
              durationMs: Number(process.hrtime.bigint() - started) / 1e6,
              address,
              userAgent: String(request.headers['user-agent'] ?? ''),
              prefetch,
              rsc,
            });
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
