import data from './a1-sentence-translations.json';

export type ReadingSentenceTranslation = { de: string; en: string };
export type ReadingSentenceParagraph = { source: string; sentences: ReadingSentenceTranslation[] };

const a1Translations = data as Record<string, { paragraphs: ReadingSentenceParagraph[] }>;

export function getA1SentenceTranslations(story: { id: string; level: string; text: string }) {
  if (story.level !== 'A1') return null;
  const entry = a1Translations[story.id];
  const paragraphs = story.text.split('\n\n');
  if (!entry || entry.paragraphs.length !== paragraphs.length ||
    entry.paragraphs.some((paragraph, index) => paragraph.source !== paragraphs[index])) return null;
  return entry.paragraphs.map(paragraph => paragraph.sentences);
}
