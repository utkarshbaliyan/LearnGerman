import book from '../../content/books/zwischen-hoersaal-und-arbeitswelt/book.json';
import translations from '../../content/books/zwischen-hoersaal-und-arbeitswelt/translations.json';
import glosses from '../../content/books/zwischen-hoersaal-und-arbeitswelt/glosses.json';
import audio from '../../content/books/zwischen-hoersaal-und-arbeitswelt/object-manifest.json';
import { glossesForText } from './reading-glossary';
import type { NarrationAsset } from './reading-narration';

export const B1_BOOK = book;
const english = translations as Record<string, { source: string; en: string }[]>;
const recordings = audio as Record<string, NarrationAsset>;
export const B1_BOOK_CHAPTERS = Array.from({ length: 10 }, (_, index) => ({
  number: index + 1, title: book.pages[index * 20].chapterTitle,
  pages: book.pages.slice(index * 20, (index + 1) * 20),
}));

export function getB1BookPage(number: number) {
  if (!Number.isInteger(number) || number < 1 || number > book.pages.length) return null;
  const page = book.pages[number - 1], translated = english[String(number)];
  return { ...page, audio: recordings[String(number)],
    glosses: glossesForText(page.paragraphs.join(' '), glosses),
    translations: translated?.length === 4 && translated.every((row, i) => row.source === page.paragraphs[i])
      ? translated.map(row => row.en) : [],
  };
}
