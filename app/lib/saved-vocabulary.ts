import { readLearningProgress } from './learning-state';
import { mergeVocabularyProgress, readCollectedWords, vocabularyCardKey, type VocabularyProgress } from './progress-sync';
import type { VocabularyWord } from '@/app/vocabulary/data';

/** Retain old personal words and FSRS state; a newer shared decision always wins. */
export function migrateReadingVocabulary(progress: VocabularyProgress, legacy: unknown): VocabularyProgress {
  const learning = readLearningProgress(legacy);
  const words = { ...progress.words }, cards = { ...progress.cards };
  for (const word of Object.values(learning.words)) {
    const key = vocabularyCardKey(word);
    const level = word.storyId.match(/reading-(a1|a2|b1|b2)-/i)?.[1].toUpperCase() ?? 'A1';
    if (!words[key]) words[key] = readCollectedWords({ [key]: { ...word, context: word.context.slice(0, 600), source: { kind: 'story', id: word.storyId, href: `/stories/${word.storyId}`, title: 'Saved story', level }, progressByHeadword: true } })[key];
    const card = word.card ?? { status: 'review' as const, updatedAt: word.updatedAt, dueAt: word.dueAt, intervalMinutes: Math.max(0, (word.dueAt - word.updatedAt) / 60000) };
    if (!cards[key] || card.updatedAt > cards[key].updatedAt) cards[key] = card;
  }
  return mergeVocabularyProgress({ ...progress, words: readCollectedWords(words), cards }, { recalls: learning.recalls });
}

export function connectedVocabulary(catalog: VocabularyWord[], progress: VocabularyProgress): VocabularyWord[] {
  const saved = readCollectedWords(progress.words), seen = new Set<string>();
  const result = catalog.map(word => {
    const key = vocabularyCardKey(word); seen.add(key);
    const personal = saved[key];
    return personal ? { ...word, german: personal.german, english: personal.english, progressByHeadword: true } : word;
  });
  for (const [key, word] of Object.entries(saved)) {
    if (!seen.has(key)) result.push({ id: `saved:${key}`, german: word.german, english: word.english, level: word.source.level, category: 'Grundlagen & Kommunikation', wordClass: 'phrase-other', progressByHeadword: true });
  }
  return result;
}
