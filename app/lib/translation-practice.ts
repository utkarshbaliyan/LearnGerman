import { z } from 'zod';

export const TRANSLATION_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type TranslationLevel = typeof TRANSLATION_LEVELS[number];
export const LEVEL_GUIDANCE: Record<TranslationLevel, { label: string; instruction: string; words: number }> = {
  A1: { label: 'Short sentences about everyday basics.', instruction: 'Concrete, high-frequency everyday language. Present tense, personal details, shopping, time, simple questions and basic nominative/accusative forms. Avoid subordinate clauses, idioms and abstract topics.', words: 12 },
  A2: { label: 'Everyday situations and simple connections.', instruction: 'Familiar situations, simple past events using German Perfekt, modal and separable verbs, basic reasons with weil and simple subordinate clauses. Avoid complex arguments and idioms.', words: 20 },
  B1: { label: 'Experiences, plans, opinions and reasons.', instruction: 'Familiar work, study, travel and everyday opinions. Connected reasons, past events, simple relative clauses, infinitives with zu, polite Konjunktiv II and straightforward passive constructions.', words: 28 },
  B2: { label: 'Detailed opinions and more complex situations.', instruction: 'Clear opinions and nuanced practical situations. Varied subordinate clauses, passive forms, concessions and appropriate register. Avoid obscure specialist vocabulary.', words: 35 },
  C1: { label: 'Nuance, register and abstract ideas.', instruction: 'Nuanced abstract or professional ideas, precise register, complex connectors, reported speech and natural nominal or verbal expressions. Avoid gratuitously rare vocabulary and C2 literary idioms.', words: 45 },
};
export const requestIdSchema = z.string().regex(/^[a-zA-Z0-9-]{16,80}$/);
export const exerciseIdSchema = z.string().regex(/^translation-[a-zA-Z0-9-]{16,80}$/);
export const levelSchema = z.enum(TRANSLATION_LEVELS);
export const countSchema = z.number().int().min(1).max(12);
export const answerSchema = z.string().max(1200);
const correctionSchema = z.object({ original: z.string().max(1200), corrected: z.string().min(1).max(1200), explanation: z.string().min(1).max(600), category: z.enum(['grammar', 'vocabulary', 'spelling', 'meaning', 'style']), kind: z.enum(['error', 'style']) }).strict();
export const sentenceFeedbackSchema = z.object({ number: z.number().int().min(1).max(12), verdict: z.enum(['correct', 'needs_work']), correctTranslation: z.string().trim().min(1).max(1200), explanation: z.string().trim().min(1).max(1000), corrections: z.array(correctionSchema).max(4) }).strict();
export type SentenceFeedback = z.infer<typeof sentenceFeedbackSchema>;
export type TranslationCheck = { id: string; createdAt: string; answers: string[]; feedback: SentenceFeedback[] };
export type TranslationOperation = { id: string; action: 'generate' | 'check' | 'speech' | 'photo'; fingerprint: string; createdAt: string; status: 'pending' | 'complete' | 'failed'; text?: string; uncertain?: boolean; sentenceIndex?: number; confirmedAt?: string; error?: string; errorStatus?: number };
export type TranslationSession = { kind: 'translation-v1'; level: TranslationLevel; count: number; createdAt: string; draftUpdatedAt: string; sentences: string[]; answers: string[]; checks: TranslationCheck[]; operations: TranslationOperation[] };
export type TranslationRecord = { exerciseId: string; version: number; session: TranslationSession };
export type TranslationResponse = TranslationRecord & { error?: string; recent?: { exerciseId: string; level: TranslationLevel; count: number }[] };

export const sentenceKey = (sentence: string) => sentence.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export function generatedSentences(value: unknown, level: TranslationLevel, count: number, previous: Iterable<string> = []): string[] {
  const result = z.object({ sentences: z.array(z.string().trim().min(3).max(400)).length(count) }).strict().parse(value).sentences;
  const used = new Set(Array.from(previous, sentenceKey));
  if (new Set(result.map(sentenceKey)).size !== count || result.some(s => used.has(sentenceKey(s)) || s.split(/\s+/).length > LEVEL_GUIDANCE[level].words || /[\r\n]/.test(s))) throw new Error('The generated sentences did not match the exercise or repeated previous work.');
  return result;
}
export function checkedTranslations(value: unknown, answers: string[]): SentenceFeedback[] {
  const items = z.object({ feedback: z.array(sentenceFeedbackSchema).length(answers.length) }).strict().parse(value).feedback;
  if (new Set(items.map(x => x.number)).size !== answers.length) throw new Error('Feedback sentence numbers do not match.');
  const ordered = items.sort((a, b) => a.number - b.number);
  ordered.forEach((item, i) => {
    if (item.number !== i + 1) throw new Error('Feedback sentence numbers do not match.');
    for (const correction of item.corrections) {
      if (correction.original ? !answers[i].includes(correction.original) : correction.category !== 'meaning' || correction.kind !== 'error') throw new Error('Feedback quoted text that was not in the answer.');
      if (correction.kind === 'style' && correction.category !== 'style') throw new Error('Optional style was classified inconsistently.');
    }
    if (item.verdict === 'correct' && item.corrections.some(c => c.kind === 'error')) throw new Error('Feedback was inconsistent.');
    if (item.verdict === 'needs_work' && !item.corrections.some(c => c.kind === 'error')) throw new Error('Feedback did not identify an actual error.');
  });
  return ordered;
}
export function photoAnswers(text: string, count: number): string[] {
  if (/\[unclear\]/i.test(text)) throw new Error('Replace every [unclear] marker before using this text.');
  if (count === 1) return [answerSchema.trim().min(1).parse(text.replace(/^\s*1[.)]\s*/, ''))];
  const matches = [...text.matchAll(/^\s*(\d{1,2})[.)]\s+(.+)/gm)];
  if (matches.length !== count || matches.some((m, i) => Number(m[1]) !== i + 1) || text.slice(0, matches[0]?.index).trim()) throw new Error(`Number your translations 1–${count}, each on a new line, to match the English sentences.`);
  return matches.map((m, i) => answerSchema.trim().min(1).parse(text.slice(m.index! + m[0].length - m[2].length, matches[i + 1]?.index ?? text.length).trim()));
}
export function sameAnswers(a: string[], b: string[]) { return a.length === b.length && a.every((v, i) => v === b[i]); }
