import { sentenceFeedbackSchema, type SentenceFeedback, type TranslationRecord, type TranslationReviewSource } from './translation-practice';
import { TUTOR_PATTERNS, type TutorPatternId } from './tutor-patterns';
import { DAY } from './learning-state';

export function feedbackPattern(feedback: SentenceFeedback): TutorPatternId {
  const errors = feedback.corrections.filter(c => c.kind === 'error');
  const text = errors.map(c => c.explanation).join(' ').toLowerCase();
  if (/word order|verb.{0,20}(position|second|end\b)|subordinate/.test(text)) return 'verb-position';
  if (/verb ending|agreement|conjugat|singular|plural.{0,15}verb/.test(text)) return 'verb-agreement';
  if (/adjective ending/.test(text)) return 'adjective-endings';
  if (/preposition/.test(text)) return 'prepositions';
  if (/accusative|dative|genitive|article|gender|case/.test(text)) return 'case-articles';
  if (/tense|participle|perfekt|auxiliary|past/.test(text)) return 'tense';
  if (/negat|kein|nicht/.test(text)) return 'negation';
  if (errors.some(c => c.category === 'spelling')) return 'spelling';
  return 'other';
}
export const reviewSourceKey = (s: TranslationReviewSource) => `${s.exerciseId}:${s.checkId}:${s.number}`;
export type TranslationReview = { key: string; source: TranslationReviewSource; level: TranslationRecord['session']['level']; pattern: TutorPatternId; label: string; sourceAt: string; dueAt: number; attempts: number; latestCorrect?: boolean };
export function buildTranslationMemory(records: TranslationRecord[], now = Date.now()) {
  const reviews: TranslationReview[] = [];
  for (const r of records) {
    if (r.session.learning?.reviewSource) continue;
    const check = r.session.checks?.[0];
    if (!check || !Number.isFinite(Date.parse(check.createdAt))) continue;
    for (const raw of check.feedback ?? []) {
      const p = sentenceFeedbackSchema.safeParse(raw); if (!p.success) continue;
      const f = p.data;
      if (f.verdict !== 'needs_work' || !f.corrections.some(c => c.kind === 'error')) continue;
      const source = { exerciseId: r.exerciseId, checkId: check.id, number: f.number }, key = reviewSourceKey(source);
      const attempts = records.filter(x => x.session.learning?.reviewSource && reviewSourceKey(x.session.learning.reviewSource) === key && x.session.checks?.length).sort((a, b) => Date.parse(a.session.checks[0].createdAt) - Date.parse(b.session.checks[0].createdAt));
      const last = attempts.at(-1)?.session.checks[0], correct = last?.feedback.every(x => x.verdict === 'correct');
      const pattern = feedbackPattern(f);
      const label = pattern === 'other' ? (f.corrections.some(c => c.category === 'vocabulary') ? 'Word choice' : f.corrections.some(c => c.category === 'meaning') ? 'Conveying the meaning' : 'Language use') : TUTOR_PATTERNS[pattern].label;
      const lastPractice = Math.max(Date.parse(r.session.checks.at(-1)?.createdAt ?? check.createdAt), ...attempts.map(x => Date.parse(x.session.checks.at(-1)!.createdAt)));
      const dueAt = lastPractice + DAY * (correct ? 7 : 1);
      reviews.push({ key, source, level: r.session.level, pattern, label, sourceAt: check.createdAt, dueAt, attempts: attempts.length, ...(last ? { latestCorrect: correct } : {}) });
    }
  }
  const delayed = records.filter(r => {
    const c = r.session.checks?.[0], source = r.session.learning?.sourceAt;
    return c && c.usedHelp === false && source && Date.parse(c.createdAt) - Date.parse(source) >= 7 * DAY;
  }).flatMap(r => r.session.checks[0].feedback);
  const independent = records.filter(r => !r.session.learning?.reviewSource && r.session.checks?.[0]?.usedHelp === false).flatMap(r => r.session.checks[0].feedback);
  return { reviews: reviews.sort((a, b) => a.dueAt - b.dueAt || a.key.localeCompare(b.key)), due: reviews.filter(r => r.dueAt <= now).length, delayed: { correct: delayed.filter(f => f.verdict === 'correct').length, total: delayed.length }, independent: { correct: independent.filter(f => f.verdict === 'correct').length, total: independent.length } };
}
export type TranslationMemory = ReturnType<typeof buildTranslationMemory>;
