import data from './reading-path-data.json';

export type ReadingLevel = 'A1' | 'A2' | 'B1';
export type ReadingStory = Omit<(typeof data)[number], 'level'> & { level: ReadingLevel };
export const READING_STORIES = data as ReadingStory[];
export const READING_LEVELS: ReadingLevel[] = ['A1', 'A2', 'B1'];
export const READING_SECTIONS = {
  A1: ['Meet Mia and Sam', 'Everyday discoveries', 'Make yourself at home', 'A little more independent'],
  A2: ['Life with other people', 'Choices and experiences', 'Plans and explanations', 'Make things happen'],
  B1: ['Understand the reasons', 'Changing perspectives', 'Find common ground', 'Take part in the world'],
};
export const READING_SECTION_GOALS = {
  A1: ['Names, familiar actions and tiny exchanges.', 'People, purchases and the things around you.', 'Daily routines, simple requests and a new home.', 'Journeys, plans and a first short account of the past.'],
  A2: ['Follow everyday requests and shared decisions.', 'Compare choices and understand personal experiences.', 'Follow past events, future plans and explanations.', 'Understand how people organise, cooperate and solve problems.'],
  B1: ['Compare information and follow different priorities.', 'Connect events, decisions and their consequences.', 'Understand disagreement, negotiate and explain a viewpoint.', 'Read accounts, reports and enquiries with a critical eye.'],
};
export function getReadingStory(id: string) { return READING_STORIES.find(story => story.id === id); }
export function getChapterReading(level: string, chapter: number) {
  return READING_STORIES.find(story => story.level === level.toUpperCase() && story.courseChapter === chapter);
}
export function readingWordCount(text: string) { return (text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? []).length; }
export function readingSummary(story: ReadingStory) {
  const { id, level, number, section, title, goal, topics } = story;
  return { id, level, number, section, title, goal, topics, wordCount: readingWordCount(story.text) };
}
export type ReadingSummary = ReturnType<typeof readingSummary>;
