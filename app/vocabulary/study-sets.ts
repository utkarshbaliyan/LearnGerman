import {
  VOCABULARY_CATEGORIES,
  type VocabularyCategory,
  type VocabularyWord,
} from "@/app/vocabulary/data";

export const MIN_STUDY_SET_SIZE = 30;
export const MAX_STUDY_SET_SIZE = 60;

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

function balancedGroups(words: VocabularyWord[]): VocabularyWord[][] {
  if (words.length < MIN_STUDY_SET_SIZE) return [words];
  const groupCount = Math.ceil(words.length / MAX_STUDY_SET_SIZE);
  const baseSize = Math.floor(words.length / groupCount);
  const largerGroups = words.length % groupCount;
  const groups: VocabularyWord[][] = [];
  let cursor = 0;

  for (let index = 0; index < groupCount; index += 1) {
    const size = baseSize + (index < largerGroups ? 1 : 0);
    groups.push(words.slice(cursor, cursor + size));
    cursor += size;
  }

  return groups;
}

function categoriesIn(words: VocabularyWord[]): VocabularyCategory[] {
  return VOCABULARY_CATEGORIES.filter((category) => words.some((word) => word.category === category));
}

export function buildVocabularyStudySets(words: VocabularyWord[]): VocabularyStudySet[] {
  if (words.length === 0) return [];

  const groupedWords: VocabularyWord[][] = [];
  let pending: VocabularyWord[] = [];

  for (const category of VOCABULARY_CATEGORIES) {
    let categoryWords = words.filter((word) => word.category === category);
    if (categoryWords.length === 0) continue;

    if (pending.length > 0) {
      const needed = MIN_STUDY_SET_SIZE - pending.length;
      pending = [...pending, ...categoryWords.slice(0, needed)];
      categoryWords = categoryWords.slice(needed);
      if (pending.length >= MIN_STUDY_SET_SIZE) {
        groupedWords.push(pending);
        pending = [];
      } else {
        continue;
      }
    }

    if (categoryWords.length < MIN_STUDY_SET_SIZE) {
      pending = categoryWords;
    } else {
      groupedWords.push(...balancedGroups(categoryWords));
    }
  }

  if (pending.length > 0) {
    const previous = groupedWords.pop() ?? [];
    groupedWords.push(...balancedGroups([...previous, ...pending]));
  }

  const categorySetNumbers = new Map<VocabularyCategory, number>();

  return groupedWords.map((setWords) => {
    const categories = categoriesIn(setWords);
    const primaryCategory = categories[0];
    let title: string;

    if (categories.length === 1) {
      const setNumber = (categorySetNumbers.get(primaryCategory) ?? 0) + 1;
      categorySetNumbers.set(primaryCategory, setNumber);
      title = `${CATEGORY_STUDY_LABELS[primaryCategory]} · Set ${setNumber}`;
    } else {
      title = categories.length === 2
        ? `${CATEGORY_STUDY_LABELS[categories[0]]} + ${CATEGORY_STUDY_LABELS[categories[1]]}`
        : `${CATEGORY_STUDY_LABELS[categories[0]]} + more`;
    }

    return {
      id: `${setWords[0].id}--${setWords.at(-1)?.id}`,
      title,
      primaryCategory,
      words: setWords,
    };
  });
}
