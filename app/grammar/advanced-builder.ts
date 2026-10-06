import { makeGrammarLesson, type GrammarBlueprint, type GrammarSample } from "./lesson-blueprint";
import type { GrammarLessonContent } from "./course";

// Brackets mark exactly the form under practice: [target~repairable error].
// Ten original contexts produce fifty tasks; no examples are repeated to fill a set.
export type AdvancedDefinition = {
  id: string;
  title: string;
  outcome: string;
  pattern: string;
  rules: GrammarBlueprint["rules"];
  rows: [string, string, string?][];
  sources: string[];
};

export function advancedLesson(definition: AdvancedDefinition): GrammarLessonContent {
  const samples: GrammarSample[] = definition.rows.map(([marked, english, note]) => {
    const match = marked.match(/\[([^~\]]+)~([^\]]+)\]/);
    if (!match || (marked.match(/\[/g) ?? []).length !== 1) throw new Error(`Invalid example in ${definition.id}: ${marked}`);
    const [marker, answer, error] = match;
    return {
      german: marked.replace(marker, answer), english,
      cloze: marked.replace(marker, "___"), answer,
      wrong: marked.replace(marker, error),
      focus: note ?? `Use ${answer} in this structure. ${definition.rules[0]}`,
    };
  });
  if (samples.length !== 10 || new Set(samples.map(s => s.german)).size !== 10) throw new Error(`${definition.id} needs ten distinct examples.`);
  const lesson = makeGrammarLesson({
    id: definition.id, lead: definition.outcome, pattern: definition.pattern,
    rules: definition.rules, samples,
    forms: samples.slice(0, 5).map(s => [String(s.answer), s.focus, s.german, s.english]),
    memoryTip: definition.rules[5],
  });
  lesson.sources = definition.sources;
  const revisions = lesson.tables?.[2];
  if (revisions) {
    revisions.title = "Target models and revisions";
    revisions.caption = "Restore the target structure. Some alternatives can be grammatical in another context or register.";
    revisions.headers = ["Version to revise", "Target model", "Reason"];
  }
  // Fixed-string checking is a controlled reconstruction task, not a judgement
  // that all other translations or focused word orders are ungrammatical.
  lesson.exercises = lesson.exercises.map(exercise => {
    if (exercise.type === "choice") {
      const hash = (value: string) => [...value].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
      return { ...exercise, caseSensitive: true,
        prompt: `Choose the taught target form for this meaning: ${samples[Number(exercise.id.slice(-2)) - 1].english}`,
        options: [...exercise.options].sort((a,b) => hash(exercise.id + a) - hash(exercise.id + b)) };
    }
    if (exercise.type === "order") return { ...exercise, caseSensitive: true,
      prompt: `${exercise.prompt} Reconstruct the model's neutral order.`,
      explanation: `${exercise.explanation} Other focused word orders may be grammatical; this task practises the neutral model.` };
    if (exercise.type === "translation") {
      const index = Number(exercise.id.slice(-2)) - 31;
      const model = exercise.direction === "en-de" ? samples[index].german : samples[index].english;
      const words = model.replace(/([,.!?;:])/g, " $1").trim().split(/\s+/).sort((a,b) => a.localeCompare(b));
      return { ...exercise, caseSensitive: true, prompt: `${exercise.prompt} Use these words in the model's neutral order: ${words.join(" · ")}`,
        explanation: `${exercise.explanation} This task checks the supplied model wording; other translations may also be valid.` };
    }
    if (exercise.type === "correction") return { ...exercise, caseSensitive: true, prompt: `${exercise.prompt} Restore the taught form and neutral standard order; retain the other words.` };
    if (exercise.type === "production") return { ...exercise, explanation: `${exercise.explanation} Self-check: meaning, case/agreement, verb position and punctuation. A model comparison is not an independent assessment.` };
    return { ...exercise, caseSensitive: true };
  });
  return lesson;
}
