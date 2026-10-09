import { ALL_VOCABULARY } from '@/app/vocabulary/data';
import { vocabularyCardKey } from '@/app/lib/progress-sync';
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
