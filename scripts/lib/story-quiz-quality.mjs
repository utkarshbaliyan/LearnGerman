import { createHash } from 'node:crypto';

export const QUIZ_REVISION = 1;
export const quizCount = level => level === 'B2' ? 6 : 4;
export const storyHash = text => createHash('sha256').update(text).digest('hex');
export const quizHash = questions => storyHash(JSON.stringify(questions.map(q => ({
  prompt: q.prompt, options: [...q.options].sort(), correct: q.options[q.answer],
  explanation: q.explanation, skill: q.skill, evidence: q.evidence,
}))));
export const normalizeQuote = text => text.normalize('NFC').replace(/\s+/gu, ' ').trim();
const skills = new Set(['cause', 'sequence', 'reference', 'inference', 'perspective', 'evidence', 'fact-linking', 'summary']);

export function quizIssues(story, questions) {
  const issues = [];
  if (!Array.isArray(questions) || questions.length !== quizCount(story.level)) return ['Wrong question count'];
  const prompts = new Set(), coveredSkills = new Set();
  for (const [index, q] of questions.entries()) {
    const label = `Question ${index + 1}`;
    if (!q || typeof q.prompt !== 'string' || q.prompt.length < 20 || q.prompt.length > 240) { issues.push(`${label}: invalid prompt`); continue; }
    const prompt = q.prompt.toLowerCase().replace(/[^a-z0-9]/gu, '');
    if (prompts.has(prompt)) issues.push(`${label}: repeated prompt`);
    prompts.add(prompt);
    if (!Array.isArray(q.options) || q.options.length !== 3 || q.options.some(o => typeof o !== 'string' || o.trim().length < 8 || o.length > 240)
      || new Set(q.options.map(o => o.trim().toLowerCase())).size !== 3) issues.push(`${label}: invalid options`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 2) issues.push(`${label}: invalid answer`);
    if (typeof q.explanation !== 'string' || q.explanation.length < 40 || q.explanation.length > 650 || /\b(?:option|answer)\s+[ABC123]\b/iu.test(q.explanation)) issues.push(`${label}: invalid explanation`);
    if (!skills.has(q.skill)) issues.push(`${label}: invalid skill`);
    else coveredSkills.add(q.skill);
    if (!Array.isArray(q.evidence) || !q.evidence.length || q.evidence.length > 3
      || q.evidence.some(e => typeof e !== 'string' || normalizeQuote(e).length < 12 || e.length > 550 || !normalizeQuote(story.text).includes(normalizeQuote(e)))) issues.push(`${label}: evidence is not an exact source excerpt`);
  }
  if (coveredSkills.size < 3) issues.push('Use at least three different comprehension skills');
  if (questions.filter(q => Array.isArray(q.evidence) && q.evidence.length >= 2).length < 2) issues.push('At least two questions must connect two source excerpts');
  return issues;
}

export function publishedQuestions(questions) {
  return questions.map(({ prompt, options, answer, explanation }) => ({ prompt, options, answer, explanation }));
}

export function balanceAnswerPositions(story, questions) {
  const offset = parseInt(storyHash(story.id).slice(0, 8), 16) % 3;
  const positions = questions.map((_, index) => (index + offset) % 3);
  // Vary the sequence as well as the totals: a rotation alone is guessable.
  for (let index = positions.length - 1; index > 0; index--) {
    const swap = parseInt(storyHash(`${story.id}:answer-order:${index}`).slice(0, 8), 16) % (index + 1);
    [positions[index], positions[swap]] = [positions[swap], positions[index]];
  }
  return questions.map((q, index) => {
    const answer = positions[index];
    const correct = q.options[q.answer];
    const options = q.options.filter((_, i) => i !== q.answer);
    options.splice(answer, 0, correct);
    return { ...q, options, answer };
  });
}
