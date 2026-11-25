'use client';
// Progress lives in this browser for now; server sync comes with accounts for the paid course.
const KEY = 'leselaut.videoCourse.v2';
const META_KEY = 'leselaut.videoCourse.meta.v1';

export type BlockScore = { score: number; total: number };
export type EpisodeProgress = {
  blocks: Record<string, BlockScore>;
  cards?: { known: number; total: number };
  mistakes?: Record<string, unknown>;
  updatedAt?: number;
  passedAt?: number;
};
type Store = Record<string, EpisodeProgress>;
export type CourseMeta = {
  activeDays: string[];
  last?: { episode: number; block: string; at: number };
};

export function localDay(d = new Date()): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function load(): Store { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; } }
function save(s: Store) { try { localStorage.setItem(KEY, JSON.stringify(s)); window.dispatchEvent(new Event('vc-progress')); } catch { /* storage unavailable */ } }
function loadMeta(): CourseMeta {
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY) ?? '{}');
    return { activeDays: Array.isArray(raw.activeDays) ? raw.activeDays : [], last: raw.last };
  } catch { return { activeDays: [] }; }
}
function saveMeta(m: CourseMeta) {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); window.dispatchEvent(new Event('vc-progress')); } catch { /* storage unavailable */ }
}
function episode(s: Store, n: number) { return (s[n] ??= { blocks: {} }); }

export function touchActivity(n: number, block?: string) {
  const m = loadMeta();
  const today = localDay();
  if (!m.activeDays.includes(today)) m.activeDays = [...m.activeDays.slice(-59), today];
  m.last = { episode: n, block: block ?? m.last?.block ?? 'words', at: Date.now() };
  saveMeta(m);
}

export const readEpisode = (n: number): EpisodeProgress => load()[n] ?? { blocks: {} };
export const readAllEpisodes = (): Store => load();
export const readCourseMeta = (): CourseMeta => loadMeta();

export function saveBlock(n: number, block: string, score: number, total: number) {
  const s = load(), e = episode(s, n), prev = e.blocks[block];
  if (!prev || score / total >= prev.score / prev.total) e.blocks[block] = { score, total };
  e.updatedAt = Date.now();
  if (block === 'test' && total > 0 && score / total >= 0.8 && !e.passedAt) e.passedAt = Date.now();
  save(s);
  touchActivity(n, block);
}
export function saveCards(n: number, known: number, total: number) {
  const s = load(), e = episode(s, n);
  if (!e.cards || known >= e.cards.known) e.cards = { known, total };
  e.updatedAt = Date.now();
  save(s);
  touchActivity(n, 'words');
}
/** Wrong answers are kept until answered correctly, so learners can retry just those. */
export function recordAnswers(n: number, results: { id: string; item: unknown; correct: boolean }[], block?: string) {
  const s = load(), e = episode(s, n), m = (e.mistakes ??= {});
  for (const r of results) { if (r.correct) delete m[r.id]; else m[r.id] = r.item; }
  e.updatedAt = Date.now();
  save(s);
  touchActivity(n, block);
}
export function onProgressChange(cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('vc-progress', cb); window.addEventListener('storage', cb);
  return () => { window.removeEventListener('vc-progress', cb); window.removeEventListener('storage', cb); };
}
