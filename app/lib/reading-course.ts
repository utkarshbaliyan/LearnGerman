import data from './reading-path-data.json';
import type { ReadingStory } from './reading-path';
import { withReadingQuiz } from './story-quizzes';

// Keep the paused 72-chapter course independent of the larger reading library.
export function getChapterReading(level: string, chapter: number): ReadingStory | undefined {
  const story = data.find(story => story.level === level.toUpperCase() && story.courseChapter === chapter);
  return story ? withReadingQuiz(story) as ReadingStory : undefined;
}
