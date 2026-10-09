import { ALL_VOCABULARY } from '@/app/vocabulary/data';
import { vocabularyCardKey, vocabularyProgressKeys } from '@/app/lib/progress-sync';
import { TRANSLATION_LEVELS } from '@/app/lib/translation-practice';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const level = params.get('level') ?? 'A1', query = (params.get('q') ?? '').trim().toLocaleLowerCase('de');
  if (!TRANSLATION_LEVELS.some(l => l === level) || query.length > 80) return Response.json({ error: 'Choose a valid level and a search of up to 80 characters.' }, { status: 400 });
  const seen = new Set<string>();
  const words = ALL_VOCABULARY.filter(w => w.level === level && (!query || `${w.english} ${w.german}`.toLocaleLowerCase('de').includes(query))).filter(w => {
    const key = vocabularyCardKey(w); if (seen.has(key)) return false; seen.add(key); return true;
  }).slice(0, 24).map(w => ({ key: vocabularyCardKey(w), german: w.german, english: w.english, progressByHeadword: true as const }));
  return Response.json({ words }, { headers: { 'cache-control': 'no-store' } });
}

// Resolve only explicit progress keys, across all levels. Empty input stays empty.
export async function POST(request: Request) {
  let keys: string[];
  try {
    const body = await request.json() as { keys?: unknown };
    if (!body || !Array.isArray(body.keys) || body.keys.length > 500 || body.keys.some(key => typeof key !== 'string' || !key || key.length > 200)) throw new Error('Invalid keys.');
    keys = body.keys;
  } catch { return Response.json({ error: 'Send up to 500 review word keys.' }, { status: 400 }); }
  const requested = new Set(keys), seen = new Set<string>();
  const words = ALL_VOCABULARY.filter(word => vocabularyProgressKeys(word).some(key => requested.has(key))).filter(word => {
    const key = vocabularyCardKey(word);
    if (seen.has(key)) return false; seen.add(key); return true;
  }).map(word => ({ id: word.id, german: word.german, english: word.english, progressAliases: word.progressAliases }));
  return Response.json({ words }, { headers: { 'cache-control': 'no-store' } });
}
