import data from '@/app/video-course/data/a1-episodes.json';
import youtubeIds from '@/app/video-course/data/youtube-ids.json';
import e01 from '@/app/video-course/data/a1-e01.json';
import e02 from '@/app/video-course/data/a1-e02.json';
import e03 from '@/app/video-course/data/a1-e03.json';
import e04 from '@/app/video-course/data/a1-e04.json';
import e05 from '@/app/video-course/data/a1-e05.json';
import e06 from '@/app/video-course/data/a1-e06.json';
import { A1_GRAMMAR_EXERCISES } from '@/app/video-course/data/a1-grammar-exercises';
import type { Block, Episode, EpisodeContent } from '@/app/video-course/types';

export const A1_EPISODES = data.episodes as Episode[];
export const A1_MOCKS = data.mocks as { id: string; afterEpisode: number }[];
const CONTENT: Record<number, EpisodeContent> = { 1: e01 as EpisodeContent, 2: e02 as EpisodeContent, 3: e03 as EpisodeContent, 4: e04 as EpisodeContent, 5: e05 as EpisodeContent, 6: e06 as EpisodeContent };

export const episodePath = (n: number) => `/video-course/a1/episode-${n}`;
export const youtubeIdFor = (n: number) => (youtubeIds as Record<string, string>)[String(n)] ?? '';
export const getEpisode = (slug: string) => A1_EPISODES.find(e => e.slug === slug);
export const hasFullPractice = (n: number) => !!CONTENT[n];
export const flashcardWords = (e: Episode) => e.vocab.filter(v => ['core', 'topic', 'sentence'].includes(v.section));
export const bonusWords = (e: Episode) => e.vocab.filter(v => v.section === 'website');

/** Full hand-written practice when available, otherwise vocabulary sets generated from the word list. */
export function blocksFor(e: Episode): Block[] {
  if (CONTENT[e.n]) return CONTENT[e.n].blocks;
  const blocks: Block[] = [{ id: 'words', title: 'Words', intro: 'Learn the words with the flashcards, then test yourself.', flashcards: true, sections: [
    { id: 'articles', title: 'der, die or das?', instructions: 'Choose the article for each noun.', items:
      e.exercises.articles.map(a => ({ type: 'choice' as const, prompt: `___ ${a.word}`, options: ['der', 'die', 'das'], answer: a.answer, note: a.en })) },
    { id: 'meanings', title: 'What does it mean?', instructions: 'Choose the English meaning.', items:
      e.exercises.meanings.map(m => ({ type: 'choice' as const, prompt: m.de, options: m.options, answer: m.answer })) },
  ].filter(s => s.items.length) }];
  const grammar = A1_GRAMMAR_EXERCISES[e.n];
  if (grammar?.length) blocks.push({ id: 'grammar', title: 'Grammar', intro: e.grammarTitle, sections: grammar });
  return blocks;
}
