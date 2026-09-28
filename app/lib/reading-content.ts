import { getReadingStory } from './reading-path';
import { readingGlosses } from './reading-glossary';
import { getReadingSentenceTranslations } from './reading-sentence-translations';
export { readingGlosses } from './reading-glossary';
export function getReadingContent(id: string) {
  const story = getReadingStory(id);
  return story ? { story, glosses: readingGlosses(story), sentenceTranslations: getReadingSentenceTranslations(story) } : null;
}
