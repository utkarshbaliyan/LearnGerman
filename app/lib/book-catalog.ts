import { A1_BOOK_ID } from './book-bookmark';
import { A2_BOOK_INFO, A2_BOOK_PATH } from './a2-book-info';
import { B1_BOOK_INFO, B1_BOOK_PATH } from './b1-book-info';
import { absoluteUrl, organization } from './seo';

export type BookCatalogEntry = {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  title: string;
  englishTitle: string;
  path: string;
  artKind: 'home' | 'technology' | 'work';
  hook: string;
  synopsis: string;
  pages: number;
  chapters: number;
};

export const BOOK_CATALOG: readonly BookCatalogEntry[] = [
  {
    id: A1_BOOK_ID,
    level: 'A1',
    title: 'Der Schlüssel im blauen Korb',
    englishTitle: 'The Key in the Blue Basket',
    path: '/books/a1/der-schluessel-im-blauen-korb',
    artKind: 'home',
    hook: 'A young baker moves from a village to Lindenstadt and discovers a mysterious key.',
    synopsis: 'Follow Mila as she starts a new bakery job in Lindenstadt, finds a small allotment garden, and uncovers the story behind a key left in a blue basket. Written in clear A1 German, about one minute per page, with synced audio and English help.',
    pages: 200,
    chapters: 10,
  },
  {
    id: A2_BOOK_INFO.id,
    level: 'A2',
    title: A2_BOOK_INFO.title,
    englishTitle: 'Not Just a Profile',
    path: A2_BOOK_PATH,
    artKind: 'technology',
    hook: 'Modern dating, missed signals, and real friendship in a new city.',
    synopsis: 'Follow Ben as he navigates dating apps, a cooking class, and everyday conversations while looking for genuine connection in Lindenstadt. Built for A2 learners with multi-voice narration, tap-to-translate words, and paragraph-by-paragraph English.',
    pages: 200,
    chapters: 10,
  },
  {
    id: B1_BOOK_INFO.id,
    level: 'B1',
    title: B1_BOOK_INFO.title,
    englishTitle: 'Between Lecture Hall and Work',
    path: B1_BOOK_PATH,
    artKind: 'work',
    hook: 'An international Master’s student balances rent, German student jobs, and exams.',
    synopsis: 'Follow Amir as he applies for student jobs, learns German workplace culture, and juggles university exams with making ends meet. Natural B1 German with character voices, full word meanings, and toggleable English translations.',
    pages: 200,
    chapters: 10,
  },
] as const;

export function bookForLevel(level: string): BookCatalogEntry | undefined {
  return BOOK_CATALOG.find(book => book.level === level);
}

export function bookStructuredData(entry: BookCatalogEntry) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: entry.title,
    alternateName: entry.englishTitle,
    description: entry.synopsis,
    url: absoluteUrl(entry.path),
    inLanguage: 'de',
    educationalLevel: entry.level,
    numberOfPages: entry.pages,
    isAccessibleForFree: true,
    publisher: organization,
  };
}

export function readingMinutes(wordCount: number) {
  return Math.max(1, Math.round(wordCount / 130));
}
