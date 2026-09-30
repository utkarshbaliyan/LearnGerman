import { getReadingStory } from './reading-path';
import { readingGlosses } from './reading-glossary';
import { getReadingSentenceTranslations } from './reading-sentence-translations';
import manifest from './reading-audio-manifest.json';
import type { NarrationAsset } from './reading-narration';
export { readingGlosses } from './reading-glossary';
export function getReadingContent(id: string) {
  const story = getReadingStory(id);
  return story ? { story, audio: (manifest as Record<string, NarrationAsset>)[story.id], glosses: readingGlosses(story), sentenceTranslations: getReadingSentenceTranslations(story) } : null;
}
