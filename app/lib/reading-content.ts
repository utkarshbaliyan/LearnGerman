import { cleanWord, meaningFor } from '@/app/curriculum';
import additions from './reading-glosses.json';
import { getReadingStory, type ReadingStory } from './reading-path';

export function readingGlosses(story: ReadingStory) {
  const result: Record<string, string> = {};
  for (const token of story.text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
    const key = cleanWord(token);
    const meaning = (additions as Record<string, string>)[key] || meaningFor(token);
    if (meaning) result[key] = meaning;
  }
  return result;
}
export function getReadingContent(id: string) {
  const story = getReadingStory(id);
  return story ? { story, glosses: readingGlosses(story) } : null;
}
