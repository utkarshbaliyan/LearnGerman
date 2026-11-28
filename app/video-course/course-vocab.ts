import { ALL_VOCABULARY, type VocabularyWord } from '@/app/vocabulary/data';
import { vocabularyHeadwordKey } from '@/app/vocabulary/headword';
import type { Episode, VocabEntry } from '@/app/video-course/types';

/** How a course word is tracked: a card from the site's vocabulary catalogue, or a personal (saved) phrase. */
export type CourseWord = VocabEntry & {
  identity: { id?: string; german: string; english: string; progressByHeadword?: boolean; progressAliases?: { id: string; german: string; english: string }[] };
  personal: boolean;
  /** Row for the Vocabulary-style word table: the catalogue card, or a synthesized card for a phrase. */
  word: VocabularyWord;
};

const clean = (s: string) => s.normalize('NFC').replace(/[!?.]+$/, '').replace(/^\(sich\) /, 'sich ').trim().toLowerCase();
const isNoun = (s: string) => /^(der|die|das)\s/i.test(s);
const article = (s: string) => s.match(/^(der|die|das)\s/i)?.[1].toLowerCase();
const byGerman = new Map(ALL_VOCABULARY.map(w => [clean(w.german), w] as const));
const byHeadword = new Map(ALL_VOCABULARY.map(w => [vocabularyHeadwordKey(w.german), w] as const));

// Server-side only: keeps the 17k-word catalogue out of the course page's client bundle.
export function courseWords(e: Episode, sections: string[]): CourseWord[] {
  return e.vocab.filter(v => sections.includes(v.section)).map(v => {
    const single = !/[\s!?…/·–]/.test(v.de.replace(/^(der|die|das|\(sich\)|sich) /, ''));
    const hit = byGerman.get(clean(v.de)) ?? (single ? byHeadword.get(vocabularyHeadwordKey(v.de.replace(/^\(sich\) /, 'sich '))) : undefined);
    // Same word class, and for nouns the same article (never show a catalogue card with a wrong article, e.g. "der Disco").
    if (hit && isNoun(hit.german) === isNoun(v.de) && article(hit.german) === article(v.de)) {
      return { ...v, personal: false, identity: { id: hit.id, german: hit.german, english: hit.english, progressAliases: hit.progressAliases }, word: hit };
    }
    return { ...v, personal: true, identity: { german: v.de, english: v.en, progressByHeadword: true },
      word: { id: `vc-phrase-${e.n}-${clean(v.de).replace(/[^\p{L}\p{N}]+/gu, '-')}`, german: v.de, english: v.en, category: 'Grundlagen & Kommunikation', level: 'A1', wordClass: 'phrase-other', progressByHeadword: true } };
  });
}
