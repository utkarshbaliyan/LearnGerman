import data from './a1-sentence-translations.json';
import laterLevels from './a2-b1-sentence-translations.json';
import b2 from './b2-sentence-translations.json';

export type ReadingSentenceTranslation = { de: string; en: string };
export type ReadingSentenceParagraph = { source: string; sentences: ReadingSentenceTranslation[] };

const translations = { ...data, ...laterLevels, ...b2 } as Record<string, { paragraphs: ReadingSentenceParagraph[] }>;

export function getReadingSentenceTranslations(story: { id: string; level: string; text: string }) {
  const entry = translations[story.id];
  const paragraphs = story.text.split('\n\n');
  if (!entry || entry.paragraphs.length !== paragraphs.length ||
    entry.paragraphs.some((paragraph, index) => paragraph.source !== paragraphs[index])) return null;
  return entry.paragraphs.map(paragraph => paragraph.sentences);
}
