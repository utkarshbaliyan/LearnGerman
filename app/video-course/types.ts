export type Speaker = 'T' | 'A' | 'N' | 'Y' | 'M' | 'O' | 'S';
export type AudioRef = { who: Speaker; text: string };
export type ToneName = 'sky' | 'peach' | 'sage' | 'lilac' | 'butter';

type Base = { audio?: AudioRef; at?: string; image?: string };
export type ChoiceItem = Base & { type: 'choice'; prompt: string; options: string[]; answer: string; note?: string };
export type GapItem = Base & { type: 'gap'; before: string; after: string; answer: string | string[]; hint?: string };
export type TypeItem = Base & { type: 'type'; prompt: string; answer: string | string[] };
export type FixItem = Base & { type: 'fix'; wrong: string; answer: string | string[] };
export type OrderItem = Base & { type: 'order'; tokens: string[]; answer: string; en?: string };
export type MatchItem = Base & { type: 'match'; prompt?: string; pairs: [string, string][] };
export type SortBucket = { id: string; label: string; tone?: ToneName };
export type SortCard = { text: string; bucket: string; note?: string };
export type SortItem = Base & { type: 'sort'; prompt?: string; buckets: SortBucket[]; cards: SortCard[] };
export type ChatReply = { prompt: string; options: string[]; answer: string; note?: string };
export type ChatTurn = { who: Speaker; text: string; en?: string; audio?: AudioRef; reply?: ChatReply };
export type ChatItem = Base & { type: 'chat'; title: string; setting?: string; turns: ChatTurn[] };
export type FormItem = Base & { type: 'form'; prompt: string; fields: { label: string; answer: string }[] };
export type WriteItem = Base & { type: 'write'; prompt: string; checks: { label: string; pattern: string }[]; warnings: { pattern: string; message: string }[]; model: string };
export type SpeakItem = Base & { type: 'speak'; prompt: string; modelText: string; model?: AudioRef };
export type ExerciseItem =
  | ChoiceItem
  | GapItem
  | TypeItem
  | FixItem
  | OrderItem
  | MatchItem
  | SortItem
  | ChatItem
  | FormItem
  | WriteItem
  | SpeakItem;

export type ReadingStyle = 'notice' | 'sign' | 'chat' | 'menu' | 'receipt' | 'email' | 'ad' | 'card';
export type ReadingText = { title: string; body: string; glossary: [string, string][]; style?: ReadingStyle; meta?: string };
/** `at`: video moment (m:ss) that teaches this set; wrong answers offer to rewatch it. */
export type ExerciseSection = { id: string; title: string; instructions: string; items: ExerciseItem[]; text?: ReadingText; at?: string; bonus?: boolean };
export type BlockId = 'watch' | 'words' | 'grammar' | 'skills' | 'test';
export type Block = { id: BlockId; title: string; intro: string; flashcards?: boolean; sections: ExerciseSection[] };
export type EpisodeContent = { episode: number; blocks: Block[] };

export type VocabEntry = { section: string; de: string; plural: string; en: string };
export type Episode = {
  n: number; slug: string; title: string; english: string; location: string; chapter: string; goal: string;
  grammarTitle: string; board: string[]; mistake: { wrong: string; right: string } | null;
  examples: { de: string; en: string }[]; vocab: VocabEntry[]; chapters: { t: string; title: string }[];
  exercises: { articles: { word: string; answer: string; en: string }[]; meanings: { de: string; options: string[]; answer: string }[] };
};
