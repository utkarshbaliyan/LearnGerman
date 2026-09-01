import {
  CHAPTER_ONE_CHECKPOINT,
  CHAPTER_ONE_LISTENING,
  CHAPTER_ONE_OUTCOMES,
  CHAPTER_ONE_READING,
  CHAPTER_ONE_VOCABULARY,
  type ChapterQuestion,
  type ChapterVocabulary,
} from "@/app/course/a1/chapter-one";
import { getCurriculum, meaningFor, type Story } from "@/app/curriculum";
import {
  ALL_GRAMMAR_LESSONS,
  LIVE_GRAMMAR_LESSONS,
  getGrammarModuleForLesson,
  type GrammarLevel,
} from "@/app/grammar/course";

export const COURSE_LEVELS: GrammarLevel[] = ["A1", "A2", "B1"];
export const CHAPTERS_PER_LEVEL = 24;

const LEVEL_COPY: Record<GrammarLevel, { title: string; label: string; target: string }> = {
  A1: { title: "Complete foundation", label: "Foundation", target: "Handle essential personal and everyday situations." },
  A2: { title: "Everyday independence", label: "Everyday", target: "Connect ideas and manage familiar life with growing independence." },
  B1: { title: "Independent German", label: "Independent", target: "Explain experiences, opinions, problems, and plans in connected German." },
};

const COMMON_WORDS = new Set([
  "aber", "auch", "auf", "aus", "bei", "das", "dass", "dem", "den", "der", "die", "ein", "eine", "einem", "einen",
  "einer", "er", "es", "für", "hat", "haben", "ich", "ihr", "im", "in", "ist", "mit", "nach", "nicht", "noch", "oder",
  "sich", "sie", "sind", "und", "von", "vor", "war", "wenn", "wie", "wir", "zu", "zum", "zur",
]);

function chapterId(level: GrammarLevel, number: number) {
  const moduleNumber = Math.ceil(number / 6);
  const lessonNumber = ((number - 1) % 6) + 1;
  return `${level.toLowerCase()}-${moduleNumber}-${lessonNumber}`;
}

function splitSentences(text: string) {
  return (text.match(/[^.!?]+[.!?]?/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24);
}

function shortSentence(story: Story) {
  return splitSentences(story.text).find((sentence) => sentence.length <= 120) ?? splitSentences(story.text)[0] ?? story.title;
}

function uniqueOptions(answer: string, candidates: string[]) {
  const options = [answer, ...candidates, "Not stated in this chapter", "A different chapter focus"]
    .filter((item, index, all) => item && all.indexOf(item) === index)
    .slice(0, 3);
  return options.sort((left, right) => (left.length + answer.length) % 3 - (right.length + answer.length) % 3);
}

function contextualVocabulary(story: Story, level: GrammarLevel): ChapterVocabulary[] {
  const sentences = splitSentences(story.text);
  const seen = new Set<string>();
  const words: ChapterVocabulary[] = [];

  for (const sentence of sentences) {
    const tokens = sentence.match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß-]*/g) ?? [];
    for (const token of tokens) {
      const normalized = token.toLocaleLowerCase("de");
      const english = meaningFor(token);
      if (
        normalized.length < 3
        || seen.has(normalized)
        || COMMON_WORDS.has(normalized)
        || !english
        || english === "name / place"
      ) continue;
      seen.add(normalized);
      words.push({
        id: `${level.toLowerCase()}-${story.number}-${normalized}`,
        german: token,
        english,
        example: sentence,
        note: "Seen in this chapter’s story",
      });
      if (words.length === 30) return words;
    }
  }

  return words;
}

function generatedQuestions(level: GrammarLevel, number: number, story: Story, storyIndex: number) {
  const curriculum = getCurriculum(level)!;
  const lessonId = chapterId(level, number);
  const lesson = ALL_GRAMMAR_LESSONS.find((item) => item.id === lessonId)!;
  const grammar = LIVE_GRAMMAR_LESSONS[lessonId];
  const vocabulary = contextualVocabulary(story, level);
  const otherStories = [
    Math.ceil(curriculum.stories.length / 4),
    Math.ceil(curriculum.stories.length / 2),
    Math.ceil((curriculum.stories.length * 3) / 4),
    1,
  ].map((offset) => curriculum.stories[(storyIndex + offset) % curriculum.stories.length]);
  const heardSentence = shortSentence(story);
  const detailSentence = splitSentences(story.text).at(-2) ?? splitSentences(story.text).at(-1) ?? heardSentence;
  const mainWord = vocabulary[0] ?? { german: lesson.title, english: lesson.outcome };
  const firstExample = grammar.examples[0];
  const firstMistake = grammar.mistakes[0];
  const levelLessons = ALL_GRAMMAR_LESSONS.filter((item) => item.id.startsWith(level.toLowerCase()));
  const lessonIndex = levelLessons.findIndex((item) => item.id === lessonId);
  const otherLessons = [3, 9, 15].map((offset) => levelLessons[(lessonIndex + offset) % levelLessons.length]);

  const listening: ChapterQuestion[] = [
    {
      id: `${lessonId}-listen-title`,
      prompt: "Which title belongs to the story you heard?",
      options: uniqueOptions(story.title, otherStories.map((item) => item.title)),
      answer: story.title,
      explanation: `The narrated story is “${story.title}”.`,
    },
    {
      id: `${lessonId}-listen-line`,
      prompt: "Which complete sentence did you hear?",
      options: uniqueOptions(heardSentence, otherStories.map(shortSentence)),
      answer: heardSentence,
      explanation: "This sentence appears word for word in the narration.",
    },
    {
      id: `${lessonId}-listen-goal`,
      prompt: "What is the main communicative goal of this story?",
      options: uniqueOptions(story.canDo, otherStories.map((item) => item.canDo)),
      answer: story.canDo,
      explanation: story.canDo,
    },
  ];

  const reading: ChapterQuestion[] = [
    {
      id: `${lessonId}-read-detail`,
      prompt: "Which detail is stated in this story?",
      options: uniqueOptions(detailSentence, otherStories.map((item) => splitSentences(item.text).at(-2) ?? shortSentence(item))),
      answer: detailSentence,
      explanation: "The detail appears in the final part of the text.",
    },
    {
      id: `${lessonId}-read-theme`,
      prompt: "Which theme best describes the text?",
      options: uniqueOptions(story.theme, otherStories.map((item) => item.theme)),
      answer: story.theme,
      explanation: `This story belongs to the theme “${story.theme}”.`,
    },
    {
      id: `${lessonId}-read-purpose`,
      prompt: "Which ability should you practise after reading?",
      options: uniqueOptions(story.canDo, otherStories.map((item) => item.canDo)),
      answer: story.canDo,
      explanation: "This is the practical can-do goal connected to the text.",
    },
  ];

  const checkpoint: ChapterQuestion[] = [
    {
      id: `${lessonId}-check-meaning`,
      prompt: `What does “${firstExample.german}” mean?`,
      options: uniqueOptions(firstExample.english, grammar.examples.slice(1, 4).map((item) => item.english)),
      answer: firstExample.english,
      explanation: "This is one of the chapter’s model sentences.",
    },
    {
      id: `${lessonId}-check-correction`,
      prompt: `Correct this sentence: ${firstMistake.wrong}`,
      options: uniqueOptions(firstMistake.right, grammar.mistakes.slice(1, 4).map((item) => item.wrong)),
      answer: firstMistake.right,
      explanation: firstMistake.why,
    },
    {
      id: `${lessonId}-check-pattern`,
      prompt: `Which pattern belongs to “${lesson.title}”?`,
      options: uniqueOptions(grammar.pattern, otherLessons.map((item) => LIVE_GRAMMAR_LESSONS[item.id].pattern)),
      answer: grammar.pattern,
      explanation: "This is the central structure practised in the grammar section.",
    },
    {
      id: `${lessonId}-check-story`,
      prompt: "Which sentence belongs to this chapter’s story?",
      options: uniqueOptions(heardSentence, otherStories.map(shortSentence)),
      answer: heardSentence,
      explanation: "You heard and read this sentence earlier in the chapter.",
    },
    {
      id: `${lessonId}-check-word`,
      prompt: `What does “${mainWord.german}” mean in this chapter?`,
      options: uniqueOptions(mainWord.english, vocabulary.slice(1, 4).map((item) => item.english)),
      answer: mainWord.english,
      explanation: `The chapter uses “${mainWord.german}” to mean “${mainWord.english}”.`,
    },
    {
      id: `${lessonId}-check-outcome`,
      prompt: "Which grammar ability have you trained?",
      options: uniqueOptions(lesson.outcome, otherLessons.map((item) => item.outcome)),
      answer: lesson.outcome,
      explanation: lesson.outcome,
    },
  ];

  return { listening, reading, checkpoint, vocabulary };
}

export function getCourseChapter(level: string, number: number) {
  const normalizedLevel = level.toUpperCase() as GrammarLevel;
  if (!COURSE_LEVELS.includes(normalizedLevel) || !Number.isInteger(number) || number < 1 || number > CHAPTERS_PER_LEVEL) return null;

  const curriculum = getCurriculum(normalizedLevel)!;
  const lessonId = chapterId(normalizedLevel, number);
  const lesson = ALL_GRAMMAR_LESSONS.find((item) => item.id === lessonId);
  const grammar = LIVE_GRAMMAR_LESSONS[lessonId];
  const grammarModule = getGrammarModuleForLesson(lessonId);
  if (!lesson || !grammar || !grammarModule) return null;

  const storyIndex = Math.round(((number - 1) * (curriculum.stories.length - 1)) / (CHAPTERS_PER_LEVEL - 1));
  const story = curriculum.stories[storyIndex];
  const generated = generatedQuestions(normalizedLevel, number, story, storyIndex);
  const isFirstChapter = normalizedLevel === "A1" && number === 1;

  return {
    id: lessonId,
    level: normalizedLevel,
    number,
    levelCopy: LEVEL_COPY[normalizedLevel],
    curriculum,
    story,
    storyIndex,
    lesson,
    grammar,
    module: grammarModule,
    outcomes: isFirstChapter ? CHAPTER_ONE_OUTCOMES : [
      lesson.outcome,
      `Understand the main ideas and key details in “${story.title}”.`,
      `Recall and use 30 expressions from the ${story.theme} context.`,
      story.canDo,
      "Complete a spoken response without reading a full script.",
      "Produce a connected written response and check it independently.",
    ],
    vocabulary: isFirstChapter ? CHAPTER_ONE_VOCABULARY : generated.vocabulary,
    listening: isFirstChapter ? CHAPTER_ONE_LISTENING : generated.listening,
    reading: isFirstChapter ? CHAPTER_ONE_READING : generated.reading,
    checkpoint: isFirstChapter ? CHAPTER_ONE_CHECKPOINT : generated.checkpoint,
    speakingPrompt: story.speakingPrompt ?? `Speak for 45–60 seconds about “${story.theme}”. Use the chapter grammar pattern and at least five new expressions.`,
    writingPrompt: story.writingPrompt ?? `Write 50–80 words about “${story.theme}”. Use the chapter grammar focus and connect at least four complete sentences.`,
  };
}

export function courseChapterHref(level: GrammarLevel, number: number) {
  return `/course/${level.toLowerCase()}/chapter-${number}`;
}
