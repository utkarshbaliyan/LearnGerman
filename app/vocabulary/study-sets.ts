import {
  VOCABULARY_CATEGORIES,
  type VocabularyCategory,
  type VocabularyWord,
} from "@/app/vocabulary/data";

export const MAX_STUDY_SET_SIZE = 30;

export type VocabularyStudySet = {
  id: string;
  title: string;
  primaryCategory: VocabularyCategory;
  words: VocabularyWord[];
};

const CATEGORY_STUDY_LABELS: Record<VocabularyCategory, string> = {
  "Grundlagen & Kommunikation": "Basics & communication",
  "Familie & Menschen": "Family & people",
  "Zuhause & Wohnen": "Home & living",
  "Essen & Trinken": "Food & drink",
  "Einkaufen & Kleidung": "Shopping & clothing",
  "Schule & Lernen": "School & learning",
  "Arbeit & Beruf": "Work & careers",
  "Stadt & Verkehr": "City & transport",
  "Reisen & Unterkunft": "Travel & accommodation",
  "Gesundheit & Körper": "Health & body",
  "Freizeit, Kultur & Sport": "Leisure, culture & sport",
  "Natur, Wetter & Umwelt": "Nature & weather",
  "Zeit, Zahlen & Mengen": "Time & numbers",
  "Medien & Digitales": "Media & digital",
  "Dienstleistungen & Behörden": "Services & public life",
  Verben: "Verbs",
  "Adjektive & Adverbien": "Adjectives & adverbs",
};

// Keep each set within one topic and CEFR level. Short topic endings stay
// short instead of borrowing unrelated words to fill an arbitrary quota.
export function buildVocabularyStudySets(words: VocabularyWord[]): VocabularyStudySet[] {
  const sets: VocabularyStudySet[] = [];
  for (const level of ["A1", "A2", "B1"] as const) {
    for (const category of VOCABULARY_CATEGORIES) {
      const topicWords = words.filter((word) => word.level === level && word.category === category);
      for (let offset = 0; offset < topicWords.length; offset += MAX_STUDY_SET_SIZE) {
        const setWords = topicWords.slice(offset, offset + MAX_STUDY_SET_SIZE);
        const number = offset / MAX_STUDY_SET_SIZE + 1;
        sets.push({
          id: `${setWords[0].id}--${setWords.at(-1)?.id}`,
          title: `${level} · ${CATEGORY_STUDY_LABELS[category]} · Set ${number}`,
          primaryCategory: category,
          words: setWords,
        });
      }
    }
  }
  return sets;
}
