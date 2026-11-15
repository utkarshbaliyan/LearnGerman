import { cleanWord } from '@/app/curriculum';
import { readingGlosses } from './reading-glossary';
import type { ReadingStory } from './reading-path';
import type { PreviewToken, StoryPreviewData } from '@/app/components/story-preview';

const WORD = /([\p{L}]+(?:[-’'][\p{L}]+)*)/u;

export function storyPreview(story: ReadingStory, storyCount: number, maxParagraphs = 6): StoryPreviewData {
  const all = readingGlosses(story), glosses: Record<string, string> = {};
  const paragraphs = story.text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).slice(0, maxParagraphs).map(paragraph => paragraph.split(WORD).filter(Boolean).map((text): PreviewToken => {
    if (!WORD.test(text)) return { text };
    const key = cleanWord(text);
    if (all[key]) glosses[key] = all[key];
    return all[key] ? { text, key } : { text };
  }));
  return { id: story.id, title: story.title, level: story.level, goal: story.goal, paragraphs, glosses, storyCount };
}
