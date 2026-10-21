import type { GrammarExercise, GrammarLessonContent } from './course';

const clean = (text: string) => text.normalize('NFC').replace(/\s+/gu, ' ').trim();

// Keep the authored bank intact. Only skip an identical task in the same set.
export function grammarTaskKey(exercise: GrammarExercise): string {
  return JSON.stringify([
    exercise.group ?? 'Core practice', exercise.type, clean(exercise.prompt),
    exercise.type === 'production' ? exercise.model : exercise.answer,
    exercise.type === 'order' ? [...exercise.tokens].sort() : undefined,
    exercise.type === 'choice' ? [...new Set(exercise.options)].sort() : undefined,
    exercise.type === 'translation' ? exercise.direction : undefined,
    exercise.caseSensitive ?? false,
  ]);
}

export function uniqueGrammarTasks(exercises: GrammarExercise[]): GrammarExercise[] {
  const seen = new Set<string>();
  return exercises.filter(exercise => {
    const key = grammarTaskKey(exercise);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const hash = (value: string) => [...value].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
export function grammarChoiceOptions(exercise: Extract<GrammarExercise, { type: 'choice' }>): string[] {
  return [...new Set(exercise.options)].sort((a, b) => hash(`${exercise.id}:${a}`) - hash(`${exercise.id}:${b}`) || a.localeCompare(b, 'de'));
}

// These two targets deliberately contrast equally valid infinitive arrangements.
export function grammarTaskFocus(exercise: GrammarExercise): string | undefined {
  if (['c113-04', 'c113-24', 'c113-34'].includes(exercise.id)) return 'Use the integrated infinitive before versucht.';
  if (['c113-05', 'c113-25', 'c113-35'].includes(exercise.id)) return 'Use the separate infinitive clause after versucht.';
}

export function grammarReferenceParagraphs(lesson: GrammarLessonContent): string[] {
  return [...new Set([...lesson.explanation, ...(lesson.sections ?? []).flatMap(section => section.paragraphs)].map(clean))]
    .filter(paragraph => !/^(The central working pattern is|Build accuracy in three passes:)/u.test(paragraph));
}
