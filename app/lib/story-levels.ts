import type { ReadingLevel } from './reading-path';
export const STORY_LEVELS: Record<ReadingLevel, { label: string; title: string; description: string; introduction: string }> = {
  A1: { label: 'Beginner', title: 'A1 German Stories for Beginners with Audio',
    description: 'Read free A1 German short stories for beginners, with audio, English translations, word meanings and comprehension quizzes.',
    introduction: 'Start with introductions, shopping, food and daily routines. Short sentences and familiar situations help you follow your first German stories. Listen once, read with the English help, then listen again.' },
  A2: { label: 'Elementary', title: 'A2 German Stories with Audio and English Translations',
    description: 'Practise elementary German with free A2 stories about everyday life. Read, listen, explore English translations and check your understanding.',
    introduction: 'Follow everyday requests, shared plans and personal experiences. These stories introduce longer exchanges and connected events, with audio and English help when you need it.' },
  B1: { label: 'Intermediate', title: 'B1 German Stories for Intermediate Reading Practice',
    description: 'Read free B1 German stories with audio and English translations. Practise following opinions, decisions and everyday situations in German.',
    introduction: 'Explore different opinions, explain decisions and follow how events connect. Read for the main idea first, then use the narration, word meanings and quiz to work through the details.' },
  B2: { label: 'Upper intermediate', title: 'B2 German Stories with Audio for Reading Practice',
    description: 'Build upper intermediate German reading skills with free B2 stories, audio, English help and comprehension questions about meaning and viewpoints.',
    introduction: 'Work with more detailed accounts, competing viewpoints and meaning that is not stated directly. Compare what characters say with what they imply, then check your reading with the comprehension questions.' },
};
export const storyLevelPath = (level: ReadingLevel) => `/stories/${level.toLowerCase()}`;
