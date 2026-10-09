import { getReadingContent } from '@/app/lib/reading-content';
import { ALL_VOCABULARY } from '@/app/vocabulary/data';
import { vocabularyCardKey } from '@/app/lib/progress-sync';
import { TRANSLATION_LEVELS, type TranslationLevel } from '@/app/lib/translation-practice';
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams, storyId = p.get('storyId'), level = p.get('level') as TranslationLevel;
  if (!TRANSLATION_LEVELS.includes(level)) return Response.json({ error: 'Choose a valid level.' }, { status: 400 });
  const keys = p.getAll('key');
  if (keys.length > 8 || keys.some(k => k.length > 200)) return Response.json({ error: 'Too many review words.' }, { status: 400 });
  const content = storyId ? getReadingContent(storyId) : null;
  if (storyId && !content) return Response.json({ error: 'Story not found.' }, { status: 404 });
  const requested = new Set(keys);
  const seen = new Set<string>();
  const words = (keys.length ? ALL_VOCABULARY.filter(w => requested.has(vocabularyCardKey(w))) : ALL_VOCABULARY.filter(w => w.level === level)).filter(w => { const k = vocabularyCardKey(w); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
  return Response.json({ content, words }, { headers: { 'cache-control': 'no-store' } });
}
