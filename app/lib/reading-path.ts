import data from './reading-path-data.json';
import expanded from './reading-expanded-data.json';
import expandedSections from './reading-expanded-sections.json';
import audio from './reading-audio-manifest.json';
import b2 from './reading-b2-data.json';
import b2Sections from './reading-b2-sections.json';
import b2Audio from '../../content/reading/b2/audio-manifest.json';

export type ReadingLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type ReadingStory = Omit<(typeof data)[number], 'level' | 'courseChapter'> & { level: ReadingLevel; courseChapter: number | null; grammarFocus?: string; wordGlosses?: Record<string, string> };
export const READING_STORIES = [...data, ...expanded, ...b2].sort((a, b) => ['A1', 'A2', 'B1', 'B2'].indexOf(a.level) - ['A1', 'A2', 'B1', 'B2'].indexOf(b.level) || a.number - b.number) as ReadingStory[];
export const READING_LEVELS: ReadingLevel[] = ['A1', 'A2', 'B1', 'B2'];
export const READING_SECTIONS = {
  B2: b2Sections.titles,
  A1: ['Meet Mia and Sam', 'Everyday discoveries', 'Make yourself at home', 'A little more independent', ...expandedSections.A1],
  A2: ['Life with other people', 'Choices and experiences', 'Plans and explanations', 'Make things happen', ...expandedSections.A2],
  B1: ['Understand the reasons', 'Changing perspectives', 'Find common ground', 'Take part in the world', ...expandedSections.B1],
};
export const READING_SECTION_GOALS = {
  B2: b2Sections.goals,
  A1: ['Names, familiar actions and tiny exchanges.', 'People, purchases and the things around you.', 'Daily routines, simple requests and a new home.', 'Journeys, plans and a first short account of the past.'],
  A2: ['Follow everyday requests and shared decisions.', 'Compare choices and understand personal experiences.', 'Follow past events, future plans and explanations.', 'Understand how people organise, cooperate and solve problems.'],
  B1: ['Compare information and follow different priorities.', 'Connect events, decisions and their consequences.', 'Understand disagreement, negotiate and explain a viewpoint.', 'Read accounts, reports and enquiries with a critical eye.'],
};
export function getReadingStory(id: string) { return READING_STORIES.find(story => story.id === id); }
export { getChapterReading } from './reading-course';
export function readingWordCount(text: string) { return (text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) ?? []).length; }
export function readingSummary(story: ReadingStory) {
  const { id, level, number, section, title, goal, topics } = story;
  return { id, level, number, section, title, goal, topics, grammar: story.grammar, hasAudio: Object.hasOwn(audio, id) || Object.hasOwn(b2Audio, id), wordCount: readingWordCount(story.text) };
}
export type ReadingSummary = ReturnType<typeof readingSummary>;
