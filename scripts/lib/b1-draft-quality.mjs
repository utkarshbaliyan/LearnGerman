export const germanWordCount = (text) => (text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;

const proseOutsideQuotes = (text) => text.replace(/„[^“]*“|«[^»]*»|“[^”]*”|"[^"\n]*"/gu, '');
const firstPerson = (text) => /\b(?:ich|wir|mich|mir|uns|mein(?:e|em|er|es)?|unser(?:e|em|en|er|es)?)\b/iu.test(proseOutsideQuotes(text));

export function b1DraftIssues(seed, draft) {
  const issues = [];
  const words = germanWordCount(draft);
  if (words < 600 || words > 800) issues.push(`word count ${words} outside 600–800`);
  const paragraphs = draft.trim().split(/\n\s*\n/u);
  if (paragraphs.length < 5 || paragraphs.length > 9) issues.push(`${paragraphs.length} paragraphs, expected 5–9`);
  if (!firstPerson(seed) && firstPerson(draft)) issues.push('third-person seed changes to first-person narration');
  if (firstPerson(seed) && !firstPerson(draft)) issues.push('first-person seed loses its narrator');
  const weekdays = /\b(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonnabend|Sonntag)[a-zäöüß]*\b/giu;
  const sourceDays = new Set([...seed.matchAll(weekdays)].map((match) => match[1].toLocaleLowerCase('de-DE')));
  const inventedDays = [...draft.matchAll(weekdays)].filter((match) => !sourceDays.has(match[1].toLocaleLowerCase('de-DE'))).map((match) => match[0]);
  if (inventedDays.length) issues.push(`invented weekday: ${[...new Set(inventedDays)].join(', ')}`);
  if (/\b(?:passive\s+Form|grammatische(?:n|r|s)?\s+(?:Form|Struktur)|in\s+diesem\s+Text)\b/iu.test(draft))
    issues.push('grammar explanation or reader-facing meta-text inside story');
  if (/\b(?:offene[smn]?\s+Ende|Symbol\s+für|diese\s+Geschichte\s+zeigte)\b/iu.test(draft))
    issues.push('meta or symbolic ending');
  const sentences = draft.match(/[^.!?]+[.!?]+/gu) ?? [];
  const normalized = sentences.map((sentence) => sentence.trim().toLocaleLowerCase('de-DE')).filter((sentence) => germanWordCount(sentence) >= 6);
  if (new Set(normalized).size !== normalized.length) issues.push('repeated sentence');
  return issues;
}
