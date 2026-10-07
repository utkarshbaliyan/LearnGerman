import ROWS from './c1-data.json';
import type { VocabularyCategory, VocabularyWord, VocabularyWordClass } from './data';
import { vocabularyHeadwordKey } from './headword';

// The independent lexical data file and source snapshot are CC BY-SA 4.0.
// Adapted from English Wiktionary contributors via Kaikki (2026-09-02 dump).
// Editorial C1 advanced/specialist placement; see docs/C1_VOCABULARY.md.
export const C1_LEXICON: VocabularyWord[] = ROWS.map(([german, english, category, wordClass, sourceWord]) => ({
  id: `lexicon-c1-${vocabularyHeadwordKey(german)}`, german, english,
  category: category as VocabularyCategory, wordClass: wordClass as VocabularyWordClass,
  level: 'C1', progressByHeadword: true,
  sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(sourceWord)}#German`,
}));
