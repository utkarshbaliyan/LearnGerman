export const germanWordCount = (text) => (text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;

const proseOutsideQuotes = (text) => text.replace(/„[^“]*“|«[^»]*»|“[^”]*”|"[^"\n]*"/gu, '');
const firstPerson = (text) => /\b(?:ich|wir|mich|mir|uns|mein(?:e|em|en|er|es)?|unser(?:e|em|en|er|es)?)\b/iu.test(proseOutsideQuotes(text));

export function b1DraftIssues(seed, draft) {
  const issues = [];
  const words = germanWordCount(draft);
  if (words < 400 || words > 800) issues.push(`word count ${words} outside 400–800`);
  const paragraphs = draft.trim().split(/\n\s*\n/u);
  if (paragraphs.length < 4 || paragraphs.length > 5) issues.push(`${paragraphs.length} paragraphs, expected 4–5`);
  if (!firstPerson(seed) && firstPerson(draft)) issues.push('third-person seed changes to first-person narration');
  if (firstPerson(seed) && !firstPerson(draft)) issues.push('first-person seed loses its narrator');
  if (/\b(?:passive\s+Form|grammatische(?:n|r|s)?\s+(?:Form|Struktur)|in\s+diesem\s+Text|der\s+Leser)\b/iu.test(draft))
    issues.push('grammar explanation or reader-facing meta-text inside story');
  const sentences = draft.match(/[^.!?]+[.!?]+/gu) ?? [];
  const normalized = sentences.map((sentence) => sentence.trim().toLocaleLowerCase('de-DE')).filter((sentence) => germanWordCount(sentence) >= 6);
  if (new Set(normalized).size !== normalized.length) issues.push('repeated sentence');
  return issues;
}
