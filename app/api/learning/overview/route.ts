import { ALL_VOCABULARY } from '@/app/vocabulary/data';
import { vocabularyOverview } from '@/app/lib/home-progress';
import { readVocabularyProgress, VOCABULARY_PROGRESS_STORAGE_KEY, VOCABULARY_LEGACY_STORAGE_KEYS } from '@/app/lib/progress-sync';

const headers = { 'cache-control': 'private, no-store' };

// Stateless calculation: no account reads, writes, progress migration or quotas.
export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > 1_000_000) return Response.json({ error: 'Your progress summary is too large.' }, { status: 413, headers });
  try {
    const body = JSON.parse(text) as { vocabulary?: unknown; legacy?: Record<string, unknown> };
    if (!body?.vocabulary || typeof body.vocabulary !== 'object' || Array.isArray(body.vocabulary)) throw new Error('Invalid progress.');
    const storage = { getItem(key: string) {
      if (key === VOCABULARY_PROGRESS_STORAGE_KEY) return JSON.stringify(body.vocabulary);
      const legacy = body.legacy?.[key];
      return VOCABULARY_LEGACY_STORAGE_KEYS.some(known => known === key) && typeof legacy === 'string' ? legacy : null;
    }, setItem() { throw new Error('Summary storage is read-only.'); } };
    return Response.json(vocabularyOverview(ALL_VOCABULARY, readVocabularyProgress(storage, ALL_VOCABULARY)), { headers });
  } catch { return Response.json({ error: 'Your word progress could not be summarised.' }, { status: 400, headers }); }
}
