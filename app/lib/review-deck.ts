import { vocabularyCardKey, vocabularyProgressKeys, type VocabularyIdentity, type VocabularyProgress } from './progress-sync';
import { createReviewSession, startRecallDeck, type RecallDeck } from './recall-decks';

export const REVIEW_SIZES = [8, 10, 12] as const;
export type ReviewSize = typeof REVIEW_SIZES[number];
export type SharedReviewWord = VocabularyIdentity & { key: string; context?: string; sourceHref?: string; sourceTitle?: string; sourceKind: 'vocabulary' | 'story' | 'book' };

export function reviewLookupKeys(progress: VocabularyProgress): string[] {
  return [...new Set([...progress.reviewKeys, ...Object.entries(progress.cards ?? {}).filter(([, card]) => card.status === 'review').map(([key]) => key)])]
    .filter(key => key.startsWith('de:') && !progress.words?.[key] && (!progress.cards?.[key] || progress.cards[key].status === 'review')).sort();
}

function addedToReview(progress: VocabularyProgress, word: VocabularyIdentity) {
  const card = progress.cards?.[vocabularyCardKey(word)];
  if (card) return card.status === 'review';
  const keys = vocabularyProgressKeys(word).filter(key => key.startsWith('de:'));
  return !keys.some(key => progress.learnedKeys.includes(key)) && keys.some(key => progress.reviewKeys.includes(key));
}

/** Library marks and saved reading words form one deck; no catalog filler. */
export function sharedReviewWords(catalog: VocabularyIdentity[], progress: VocabularyProgress): SharedReviewWord[] {
  const result = new Map<string, SharedReviewWord>();
  for (const word of catalog) {
    if (addedToReview(progress, word)) {
      const key = vocabularyCardKey(word);
      if (!result.has(key)) result.set(key, { ...word, key, sourceKind: 'vocabulary' });
    }
  }
  for (const word of Object.values(progress.words ?? {})) {
    const key = vocabularyCardKey(word);
    if (addedToReview(progress, word)) result.set(key, { ...word, key, sourceHref: word.source.href, sourceTitle: word.source.title, sourceKind: word.source.kind });
    else result.delete(key);
  }
  return [...result.values()].sort((a, b) => (progress.cards?.[a.key]?.dueAt ?? 0) - (progress.cards?.[b.key]?.dueAt ?? 0) || a.german.localeCompare(b.german, 'de'));
}

export function startSharedReviewSession(id: string, runId: string, catalog: VocabularyIdentity[], progress: VocabularyProgress, size: ReviewSize, now = Date.now(), random = Math.random) {
  if (!REVIEW_SIZES.includes(size)) throw new Error('Choose 8, 10 or 12 words.');
  const words = sharedReviewWords(catalog, progress).slice(0, size).map(word => ({ key: word.key, german: word.german, english: word.english, context: word.context, sourceHref: word.sourceHref, progressByHeadword: true as const }));
  if (!words.length) throw new Error('Add words to Review before practising.');
  return startRecallDeck(createReviewSession(id, words, size, now), runId, now, random);
}

export function remainingReviewWords(session: RecallDeck, pool: SharedReviewWord[]): SharedReviewWord[] {
  const byKey = new Map(pool.map(word => [word.key, word]));
  return (session.run?.order ?? []).filter(key => !session.run!.answers[key]).flatMap(key => byKey.has(key) ? [byKey.get(key)!] : []);
}
