import { cleanWord, meaningFor } from '@/app/curriculum';
import additions from './reading-glosses.json';
import expandedGlosses from '../../content/reading/glosses.json';
import type { ReadingStory } from './reading-path';

export function readingGlosses(story: ReadingStory) {
  const result: Record<string, string> = {};
  for (const token of story.text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
    const key = cleanWord(token);
    const meaning = story.wordGlosses?.[key] || (expandedGlosses as Record<string, string>)[key] || (additions as Record<string, string>)[key] || meaningFor(token);
    if (meaning) result[key] = meaning;
  }
  return result;
}
