import type { GrammarLessonContent } from './course';
import { grammarReferenceParagraphs } from './practice-sequence';

export type GuideExample = { german: string; english: string; note?: string };

export function lessonArticle(content: GrammarLessonContent) {
  const paragraphs = grammarReferenceParagraphs(content).filter(paragraph => paragraph !== content.memoryTip);
  // Teach the stem, endings and everyday time meaning before the spelling details.
  const core = content.id === 'a1-1-2' ? [paragraphs[0], paragraphs[1], paragraphs[5]] : paragraphs.slice(0, 3);
  return { core, details: paragraphs.filter(paragraph => !core.includes(paragraph)), memoryTip: content.memoryTip };
}

export function lessonGuideExamples(content: GrammarLessonContent): GuideExample[] {
  const seen = new Set<string>();
  return [...content.examples, ...(content.sections ?? []).flatMap(section => section.examples ?? [])]
    .filter(example => {
      if (seen.has(example.german)) return false;
      seen.add(example.german);
      return true;
    });
}

export function lessonGuideTables(content: GrammarLessonContent) {
  const tables = (content.tables ?? []).filter(table => !['Patterns in complete sentences', 'Error diagnosis', 'Target models and revisions'].includes(table.title));
  // These two source tables put the phrase before its ending; label that order accurately.
  if (['a2-1-6', 'a2-2-1'].includes(content.id)) {
    return tables.map((table, index) => index === 0 ? { ...table, headers: ['Case / gender', 'German phrase', 'Ending', 'English'] } : table);
  }
  // Start the sein lesson with its conjugation; pronoun and word-order tables stay selectable.
  if (content.id === 'a1-1-1') return [...tables].sort((a, b) => Number(b.title.includes('conjugation of sein')) - Number(a.title.includes('conjugation of sein')));
  return tables;
}

export function lessonGuideNotes(content: GrammarLessonContent): string[] {
  const paragraphs = grammarReferenceParagraphs(content);
  // The working rule introduces the topic; two existing notes explain how to apply it.
  if (content.id === 'a1-1-2') return [paragraphs[0], paragraphs[3]];
  return paragraphs.slice(1, 3);
}
