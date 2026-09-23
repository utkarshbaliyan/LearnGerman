import data from './reading-path-data.json';
import type { ReadingStory } from './reading-path';

// Keep the paused 72-chapter course independent of the larger reading library.
export function getChapterReading(level: string, chapter: number): ReadingStory | undefined {
  return data.find(story => story.level === level.toUpperCase() && story.courseChapter === chapter) as ReadingStory | undefined;
}
