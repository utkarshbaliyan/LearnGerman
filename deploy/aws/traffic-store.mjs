// Daily traffic history for /admin/live, kept in its own SQLite file next to
// (never inside) the learner database. Only daily counts and page-view counts
// are kept long term. To count each visitor once per day, a salted hash of
// (address + user agent) is stored for today and yesterday only; the salt and
// hashes are deleted after that, so older days cannot be re-identified.
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const OFFSET_MS = 330 * 60_000; // Asia/Kolkata (UTC+5:30), the owner's calendar
const MAX_PATHS_PER_FLUSH = 400, KEEP_DAYS = 400, KEEP_PAGE_DAYS = 120;

const BOT_AGENT = /bot|crawl|spider|slurp|curl|wget|python|httpclient|headless|lighthouse|monitor|uptime|preview|facebookexternalhit|node-fetch|go-http|okhttp|java\/|ahrefs|semrush|mj12|dotbot|bytespider|petalbot|gptbot|claudebot|anthropic|oai-searchbot|perplexity|ccbot|yandex|bingpreview|duckduckbot|applebot|baiduspider|sogou|exabot|facebot|ia_archiver|scrapy|axios|undici|libwww|lwp-|nikto|sqlmap|nuclei|masscan|zgrab|censys|shodan|nmap|wpscan|dirbuster|gobuster|ffuf|httpx|aiohttp|playwright|puppeteer|selenium|phantomjs|pingdom|statuscake|datadog|newrelic|site24x7|check_http|amazon-route53|cloudfront/i;
const PROBE_PATH = /^\/(?:wp-|wordpress|xmlrpc|phpmyadmin|pma|cgi-bin|boaform|actuator|solr|vendor\/|admin\.php|shell|setup\.php|config\.|backup|dbadmin|mysql|manager\/html|\.(?:env|git|svn|hg|htaccess|htpasswd|ds_store|aws|ssh|well-known))|\.(?:php|phtml|asp|aspx|jsp|jspx|cgi|pl|sh|py|rb|sql|bak|old|orig|swp|tar|gz|zip|rar|7z|log|ini|yml|yaml|toml|conf|config|key|pem|crt)$/i;
const INTERNAL_PATH = /^\/(?:admin|auth)(?:\/|$)/i;
const ASSET_PATH = /^\/(?:assets|audio|media|images|fonts|_next|icons?|illustrations|video-course\/(?:audio|img|pdf))\/|\.(?:js|mjs|css|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|webm|m4a|mp3|mp4|ogg|wav|vtt|pdf|json|txt|xml|webmanifest)$/i;

export function isRscUrl(url) {
  const path = String(url || '/').split('?')[0].split('#')[0] || '/';
  return path.endsWith('.rsc');
}

export function normalisePath(url) {
  let path = String(url || '/').split('?')[0].split('#')[0] || '/';
  if (path.endsWith('.rsc')) {
    path = path.slice(0, -4) || '/';
    if (path === '/index') path = '/';
  }
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path.length > 160 ? `${path.slice(0, 157)}...` : path;
}

export function isBotAgent(userAgent) {
  const value = String(userAgent ?? '').trim();
  return !value || BOT_AGENT.test(value);
}

export function isProbePath(path) {
  return PROBE_PATH.test(String(path || ''));
}

export function isInternalPath(path) {
  return INTERNAL_PATH.test(String(path || ''));
}

export function isPrefetchRequest(headers) {
  if (!headers || typeof headers !== 'object') return false;
  const header = name => {
    const raw = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(raw) ? raw.join(',') : String(raw ?? '');
  };
  if (/prefetch|prerender/i.test(header('sec-purpose')) || /prefetch|prerender/i.test(header('purpose'))) return true;
  if (/^(?:1|true)$/i.test(header('next-router-prefetch').trim())) return true;
  if (/^(?:1|true)$/i.test(header('x-middleware-prefetch').trim())) return true;
  return false;
}

export function classify(path, { prefetch = false } = {}) {
  const clean = normalisePath(path);
  if (clean === '/api/health' || clean === '/api/admin' || clean.startsWith('/api/admin/')) return 'ignored';
  if (prefetch) return 'prefetch';
  if (clean.startsWith('/api/')) return 'api';
  if (ASSET_PATH.test(clean)) return 'asset';
  return 'page';
}

export function sectionForPath(path) {
  const clean = normalisePath(path).toLowerCase();
  if (clean === '/') return 'Home';
  if (clean === '/stories' || clean.startsWith('/stories/')) return 'Stories';
  if (clean === '/books' || clean.startsWith('/books/')) return 'Books';
  if (clean === '/grammar' || clean.startsWith('/grammar/')) return 'Grammar';
  if (clean === '/vocabulary' || clean.startsWith('/vocabulary/')) return 'Vocabulary';
  if (clean === '/course' || clean.startsWith('/course/')) return 'Course';
  if (clean === '/video-course' || clean.startsWith('/video-course/')) return 'Video course';
  if (clean === '/practice' || clean.startsWith('/practice/') || clean === '/review' || clean === '/active-learning' || clean.startsWith('/active-learning/')) return 'Practice & review';
  if (clean === '/account' || clean.startsWith('/account/') || clean === '/about' || clean === '/privacy' || clean === '/support') return 'Account & info';
  return 'Other';
}

export function isRealPageView({ kind, method = 'GET', status = 200, bot = false, probe = false, path = '' }) {
  return kind === 'page'
    && String(method || 'GET').toUpperCase() === 'GET'
    && status >= 200 && status < 300
    && !bot && !probe
    && !isInternalPath(path);
}

export function isRealVisitorEvent({ kind, method = 'GET', status = 200, bot = false, probe = false, path = '' }) {
  if (bot || probe || isInternalPath(path)) return false;
  if (isRealPageView({ kind, method, status, bot, probe, path })) return true;
  return kind === 'api' && status >= 200 && status < 300 && !String(path).endsWith('/config');
}

export function summarizePaths(entries, limit = 30) {
  const merged = new Map();
  let total = 0;
  for (const [rawPath, rawViews] of entries) {
    const views = Number(rawViews ?? 0);
    if (!views || views < 0) continue;
    const path = normalisePath(rawPath);
    if (isProbePath(path) || isInternalPath(path) || classify(path) !== 'page') continue;
    merged.set(path, (merged.get(path) ?? 0) + views);
    total += views;
  }
  const bySection = new Map();
  for (const [path, views] of merged) {
    const section = sectionForPath(path);
    bySection.set(section, (bySection.get(section) ?? 0) + views);
  }
  const share = views => (total > 0 ? Math.round((views / total) * 1000) / 10 : 0);
  const sections = [...bySection]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([section, views]) => ({ section, views, share: share(views) }));
  const topPages = [...merged]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([path, views]) => ({ path, views, section: sectionForPath(path), share: share(views) }));
  return { total, sections, topPages };
}

export const trafficDay = time => new Date(time + OFFSET_MS).toISOString().slice(0, 10);
const shiftDay = (day, delta) => new Date(Date.parse(`${day}T00:00:00Z`) + delta * 86_400_000).toISOString().slice(0, 10);

export function createTrafficStore(filename, { now = () => Date.now() } = {}) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  if (filename !== ':memory:') db.exec('PRAGMA journal_mode=WAL;');
  db.exec(`PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS traffic_daily (day TEXT PRIMARY KEY, visitors INTEGER NOT NULL DEFAULT 0, pageviews INTEGER NOT NULL DEFAULT 0, requests INTEGER NOT NULL DEFAULT 0, api INTEGER NOT NULL DEFAULT 0, bots INTEGER NOT NULL DEFAULT 0, errors4xx INTEGER NOT NULL DEFAULT 0, errors5xx INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS traffic_daily_pages (day TEXT NOT NULL, path TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, path));
    CREATE TABLE IF NOT EXISTS traffic_day_visitors (day TEXT NOT NULL, visitor TEXT NOT NULL, PRIMARY KEY (day, visitor));
    CREATE TABLE IF NOT EXISTS traffic_salts (day TEXT PRIMARY KEY, salt BLOB NOT NULL);`);
  const q = {
    salt: db.prepare('SELECT salt FROM traffic_salts WHERE day = ?'),
    putSalt: db.prepare('INSERT OR IGNORE INTO traffic_salts(day, salt) VALUES (?, ?)'),
    addDaily: db.prepare(`INSERT INTO traffic_daily(day, pageviews, requests, api, bots, errors4xx, errors5xx) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(day) DO UPDATE SET pageviews = pageviews + excluded.pageviews, requests = requests + excluded.requests, api = api + excluded.api, bots = bots + excluded.bots, errors4xx = errors4xx + excluded.errors4xx, errors5xx = errors5xx + excluded.errors5xx`),
    addVisitor: db.prepare('INSERT OR IGNORE INTO traffic_day_visitors(day, visitor) VALUES (?, ?)'),
    countVisitors: db.prepare('UPDATE traffic_daily SET visitors = (SELECT COUNT(*) FROM traffic_day_visitors WHERE day = ?1) WHERE day = ?1'),
    addPage: db.prepare('INSERT INTO traffic_daily_pages(day, path, views) VALUES (?, ?, ?) ON CONFLICT(day, path) DO UPDATE SET views = views + excluded.views'),
    days: db.prepare('SELECT day, visitors, pageviews, requests, api, bots, errors4xx, errors5xx FROM traffic_daily WHERE day >= ? AND day <= ? ORDER BY day'),
    pages: db.prepare('SELECT path, SUM(views) AS views FROM traffic_daily_pages WHERE day >= ? AND day <= ? GROUP BY path'),
  };
  const salts = new Map();
  let pending = new Map(), lastPrune = '';

  function saltFor(day) {
    let salt = salts.get(day);
    if (!salt) {
      q.putSalt.run(day, randomBytes(16));
      salt = Buffer.from(q.salt.get(day).salt);
      salts.set(day, salt);
      for (const key of salts.keys()) if (key < shiftDay(day, -1)) salts.delete(key);
    }
    return salt;
  }
  function entry(day) {
    let value = pending.get(day);
    if (!value) pending.set(day, value = { pageviews: 0, requests: 0, api: 0, bots: 0, errors4xx: 0, errors5xx: 0, visitors: new Set(), pages: new Map() });
    return value;
  }

  // Called for every counted request (same filtering as the live view).
  function add({ time = now(), kind, method = 'GET', status = 200, bot = false, probe = false, address = '', userAgent = '', path = '' }) {
    const cleanPath = normalisePath(path);
    const isProbe = Boolean(probe) || isProbePath(cleanPath);
    const isBot = Boolean(bot) || isProbe;
    const day = trafficDay(time), value = entry(day);
    value.requests++;
    if (isBot) value.bots++;
    if (kind === 'api') value.api++;
    if (status >= 500) value.errors5xx++; else if (status >= 400) value.errors4xx++;
    const realPage = isRealPageView({ kind, method, status, bot: isBot, probe: isProbe, path: cleanPath });
    if (realPage) {
      value.pageviews++;
      if (cleanPath && (value.pages.has(cleanPath) || value.pages.size < MAX_PATHS_PER_FLUSH)) {
        value.pages.set(cleanPath, (value.pages.get(cleanPath) ?? 0) + 1);
      }
    }
    if (isRealVisitorEvent({ kind, method, status, bot: isBot, probe: isProbe, path: cleanPath })) {
      value.visitors.add(createHash('sha256').update(saltFor(day)).update(String(address)).update('\0').update(String(userAgent).slice(0, 300)).digest('base64url').slice(0, 22));
    }
  }

  function flush() {
    if (!pending.size) return;
    const batch = pending; pending = new Map();
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const [day, value] of batch) {
        q.addDaily.run(day, value.pageviews, value.requests, value.api, value.bots, value.errors4xx, value.errors5xx);
        for (const visitor of value.visitors) q.addVisitor.run(day, visitor);
        q.countVisitors.run(day);
        for (const [path, views] of value.pages) q.addPage.run(day, path, views);
      }
      const today = trafficDay(now());
      if (lastPrune !== today) {
        lastPrune = today;
        const yesterday = shiftDay(today, -1);
        db.prepare('DELETE FROM traffic_day_visitors WHERE day < ?').run(yesterday);
        db.prepare('DELETE FROM traffic_salts WHERE day < ?').run(yesterday);
        db.prepare('DELETE FROM traffic_daily_pages WHERE day < ?').run(shiftDay(today, -KEEP_PAGE_DAYS));
        db.prepare('DELETE FROM traffic_daily WHERE day < ?').run(shiftDay(today, -KEEP_DAYS));
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      for (const [day, value] of batch) if (!pending.has(day)) pending.set(day, value);
      throw error;
    }
  }

  function history(days) {
    flush();
    const span = Math.max(1, Math.min(Math.floor(days), 365)), to = trafficDay(now()), from = shiftDay(to, -(span - 1));
    const rows = new Map(q.days.all(from, to).map(row => [row.day, row]));
    const series = [];
    for (let day = from; day <= to; day = shiftDay(day, 1)) {
      const row = rows.get(day);
      series.push({
        day,
        visitors: Number(row?.visitors ?? 0),
        pageviews: Number(row?.pageviews ?? 0),
        requests: Number(row?.requests ?? 0),
        errors4xx: Number(row?.errors4xx ?? 0),
        errors5xx: Number(row?.errors5xx ?? 0),
        bots: Number(row?.bots ?? 0),
      });
    }
    const total = field => series.reduce((sum, row) => sum + row[field], 0);
    const peak = series.reduce((best, row) => row.visitors > best.visitors ? row : best, series[0]);
    const pageRows = q.pages.all(from, to).map(row => [row.path, row.views]);
    const { total: cleanPageviews, sections, topPages } = summarizePaths(pageRows, 30);
    return {
      days: span, from, to, series,
      totals: {
        visitorDays: total('visitors'),
        pageviews: total('pageviews'),
        cleanPageviews,
        requests: total('requests'),
        errors4xx: total('errors4xx'),
        errors5xx: total('errors5xx'),
        bots: total('bots'),
        activeDays: series.filter(row => row.visitors > 0).length,
        averageDailyVisitors: Math.round(total('visitors') / span * 10) / 10,
        peakDay: peak.visitors ? { day: peak.day, visitors: peak.visitors } : null,
      },
      sections,
      topPages,
    };
  }

  return { add, flush, history, close: () => { try { flush(); } finally { db.close(); } } };
}
