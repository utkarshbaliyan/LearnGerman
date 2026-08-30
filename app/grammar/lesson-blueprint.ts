import type { GrammarExercise, GrammarLessonContent } from "@/app/grammar/course";

export type GrammarSample = {
  german: string;
  english: string;
  cloze: string;
  answer: string | string[];
  wrong: string;
  focus: string;
};

export type GrammarBlueprint = {
  id: string;
  lead: string;
  pattern: string;
  rules: [string, string, string, string, string, string];
  forms: string[][];
  samples: GrammarSample[];
  memoryTip: string;
};

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const normaliseTokens = (sentence: string) => sentence
  .replace(/([,.!?;:])/g, " $1")
  .trim()
  .split(/\s+/);

function expandSamples(source: GrammarSample[]) {
  if (source.length < 5) throw new Error("Every grammar blueprint needs at least five core examples.");
  return Array.from({ length: 10 }, (_, index) => source[index % source.length]);
}

function makeExercises(blueprint: GrammarBlueprint): GrammarExercise[] {
  const prefix = blueprint.id.replaceAll("-", "");
  const groups = <T extends GrammarExercise>(group: string, items: T[]) => items.map((item) => ({ ...item, group }));
  const samples = expandSamples(blueprint.samples);

  return [
    ...groups("1 · Recognise the rule", samples.map((sample, index) => ({
      id: `${prefix}-${String(index + 1).padStart(2, "0")}`,
      type: "choice" as const,
      prompt: `Choose the correct German sentence: ${sample.english}`,
      options: [sample.german, sample.wrong, samples[(index + 1) % samples.length].wrong, samples[(index + 2) % samples.length].wrong],
      answer: sample.german,
      explanation: sample.focus,
    }))),
    ...groups("2 · Complete the form", samples.map((sample, index) => ({
      id: `${prefix}-${String(index + 11).padStart(2, "0")}`,
      type: "fill" as const,
      prompt: sample.cloze,
      answer: sample.answer,
      explanation: sample.focus,
    }))),
    ...groups("3 · Build and repair", samples.map((sample, index) => index < 5 ? ({
      id: `${prefix}-${String(index + 21).padStart(2, "0")}`,
      type: "order" as const,
      prompt: `Build the sentence: ${sample.english}`,
      tokens: normaliseTokens(sample.german).sort((a, b) => a.localeCompare(b, "de")),
      answer: sample.german,
      explanation: sample.focus,
    }) : ({
      id: `${prefix}-${String(index + 21).padStart(2, "0")}`,
      type: "correction" as const,
      prompt: `Correct: ${sample.wrong}`,
      answer: sample.german,
      explanation: sample.focus,
    }))),
    ...groups("4 · Translate both ways", samples.map((sample, index) => index < 5 ? ({
      id: `${prefix}-${String(index + 31).padStart(2, "0")}`,
      type: "translation" as const,
      direction: "en-de" as const,
      prompt: `Translate: ${sample.english}`,
      answer: sample.german,
      explanation: sample.focus,
    }) : ({
      id: `${prefix}-${String(index + 31).padStart(2, "0")}`,
      type: "translation" as const,
      direction: "de-en" as const,
      prompt: `Translate: ${sample.german}`,
      answer: sample.english,
      explanation: sample.focus,
    }))),
    ...groups("5 · Guided production", samples.map((sample, index) => ({
      id: `${prefix}-${String(index + 41).padStart(2, "0")}`,
      type: "production" as const,
      prompt: index % 2 === 0
        ? `Write a new personal example that follows this pattern: ${sample.german}`
        : `Change the person, time, or key noun in this model while preserving the grammar: ${sample.german}`,
      model: sample.german,
      explanation: `${sample.focus} Say your version aloud, then check the form and word order against the model.`,
    }))),
  ];
}

export function makeGrammarLesson(blueprint: GrammarBlueprint): GrammarLessonContent {
  const samples = expandSamples(blueprint.samples);
  return {
    id: blueprint.id,
    lead: blueprint.lead,
    pattern: blueprint.pattern,
    explanation: blueprint.rules,
    tables: [
      {
        title: "Core forms and structures",
        caption: "Use this table as a reference, then retrieve the forms without looking.",
        headers: ["Form", "Function", "German example", "English"],
        rows: blueprint.forms,
      },
      {
        title: "Patterns in complete sentences",
        headers: ["German", "English", "What to notice"],
        rows: samples.slice(0, 6).map((sample) => [sample.german, sample.english, sample.focus]),
      },
      {
        title: "Error diagnosis",
        caption: "Compare the incorrect and corrected versions before reading the reason.",
        headers: ["Incorrect", "Correct", "Reason"],
        rows: samples.slice(6, 10).map((sample) => [sample.wrong, sample.german, sample.focus]),
      },
    ],
    sections: [
      {
        title: "Understand the choice",
        paragraphs: [blueprint.rules[0], blueprint.rules[1]],
        examples: samples.slice(0, 3).map(({ german, english }) => ({ german, english })),
      },
      {
        title: "Control the sentence structure",
        paragraphs: [blueprint.rules[2], blueprint.rules[3]],
        examples: samples.slice(3, 6).map(({ german, english }) => ({ german, english })),
      },
      {
        title: "Use the pattern naturally",
        paragraphs: [blueprint.rules[4], blueprint.rules[5]],
        examples: samples.slice(6, 10).map(({ german, english }) => ({ german, english })),
      },
    ],
    examples: samples.slice(0, 5).map(({ german, english, focus }) => ({ german, english, note: focus })),
    mistakes: samples.slice(5, 10).map(({ wrong, german, focus }) => ({ wrong, right: german, why: focus })),
    memoryTip: blueprint.memoryTip,
    exercises: makeExercises(blueprint),
  };
}

export function buildGrammarLessons(blueprints: GrammarBlueprint[]) {
  return Object.fromEntries(blueprints.map((blueprint) => [blueprint.id, makeGrammarLesson(blueprint)]));
}

export const sample = (german: string, english: string, cloze: string, answer: string | string[], wrong: string, focus: string): GrammarSample => ({
  german, english, cloze, answer, wrong, focus: titleCase(focus),
});

export function blueprint(input: Omit<GrammarBlueprint, "rules"> & {
  notes: [string, string, string, string];
}): GrammarBlueprint {
  return {
    ...input,
    rules: [
      input.notes[0],
      `The central working pattern is ${input.pattern} Learn the complete pattern with its function rather than memorising an isolated ending or connector.`,
      input.notes[1],
      input.notes[2],
      input.notes[3],
      `Build accuracy in three passes: identify the intended meaning, select the required form, and check the complete sentence aloud. The examples and five practice sets below repeat this decision in recognition, completion, correction, translation, and free production.`,
    ],
  };
}

export function quickBlueprint(input: {
  id: string;
  lead: string;
  pattern: string;
  notes: [string, string, string, string];
  samples: GrammarSample[];
  memoryTip: string;
}): GrammarBlueprint {
  return blueprint({
    ...input,
    forms: input.samples.slice(0, 5).map((item, index) => [
      `Pattern ${index + 1}`,
      item.focus,
      item.german,
      item.english,
    ]),
  });
}
