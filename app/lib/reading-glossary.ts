import { cleanWord, meaningFor } from '@/app/curriculum';
import additions from './reading-glosses.json';
import expandedGlosses from '../../content/reading/glosses.json';
import type { ReadingStory } from './reading-path';

export function glossesForText(text: string, overrides: Record<string, string> = {}) {
  const result: Record<string, string> = {};
  for (const token of text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
    const key = cleanWord(token);
    const meaning = overrides[key] || (expandedGlosses as Record<string, string>)[key] || (additions as Record<string, string>)[key] || meaningFor(token);
    if (meaning) result[key] = meaning;
  }
  return result;
}

export function readingGlosses(story: ReadingStory) {
  return glossesForText(story.text, story.wordGlosses);
}
