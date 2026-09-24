import book from './book-data.json';
import bookGlosses from './book-glosses.json';
import audio from './book-audio-manifest.json';
import { glossesForText } from './reading-glossary';

export const A1_BOOK = book;
export const BOOK_AUDIO = audio as Record<string, { src: string; timingSrc: string; textHash: string; wordCount: number; duration: number }[]>;
export const BOOK_CHAPTERS = Array.from({ length: 10 }, (_, index) => ({
  number: index + 1,
  title: book.pages[index * 20].chapterTitle,
  pages: book.pages.slice(index * 20, (index + 1) * 20),
}));

export function getBookPage(pageNumber: number) {
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > book.pages.length) return null;
  const page = book.pages[pageNumber - 1];
  return {
    ...page,
    glosses: glossesForText(page.paragraphs.join(' '), bookGlosses),
    audio: BOOK_AUDIO[String(pageNumber)] ?? [],
  };
}
