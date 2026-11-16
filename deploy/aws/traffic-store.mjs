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
const MAX_PATHS_PER_FLUSH = 300, KEEP_DAYS = 400, KEEP_PAGE_DAYS = 120;

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
    pages: db.prepare('SELECT path, SUM(views) AS views FROM traffic_daily_pages WHERE day >= ? AND day <= ? GROUP BY path ORDER BY views DESC, path LIMIT ?'),
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
  function add({ time = now(), kind, status, bot, address, userAgent, path }) {
    const day = trafficDay(time), value = entry(day);
    value.requests++;
    if (bot) value.bots++;
    if (kind === 'page') value.pageviews++; else if (kind === 'api') value.api++;
    if (status >= 500) value.errors5xx++; else if (status >= 400) value.errors4xx++;
    if (!bot && kind !== 'asset') {
      value.visitors.add(createHash('sha256').update(saltFor(day)).update(String(address)).update('\0').update(String(userAgent).slice(0, 300)).digest('base64url').slice(0, 22));
      if (kind === 'page' && path && (value.pages.has(path) || value.pages.size < MAX_PATHS_PER_FLUSH)) value.pages.set(path, (value.pages.get(path) ?? 0) + 1);
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
      series.push({ day, visitors: Number(row?.visitors ?? 0), pageviews: Number(row?.pageviews ?? 0), requests: Number(row?.requests ?? 0), errors5xx: Number(row?.errors5xx ?? 0), bots: Number(row?.bots ?? 0) });
    }
    const total = field => series.reduce((sum, row) => sum + row[field], 0);
    const peak = series.reduce((best, row) => row.visitors > best.visitors ? row : best, series[0]);
    return {
      days: span, from, to, series,
      totals: { visitorDays: total('visitors'), pageviews: total('pageviews'), requests: total('requests'), errors5xx: total('errors5xx'), bots: total('bots'), activeDays: series.filter(row => row.visitors > 0).length, averageDailyVisitors: Math.round(total('visitors') / span * 10) / 10, peakDay: peak.visitors ? { day: peak.day, visitors: peak.visitors } : null },
      topPages: q.pages.all(from, to, 15).map(row => ({ path: row.path, views: Number(row.views) })),
    };
  }

  return { add, flush, history, close: () => { try { flush(); } finally { db.close(); } } };
}
