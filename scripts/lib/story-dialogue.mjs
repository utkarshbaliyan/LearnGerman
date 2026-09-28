// Offsets preserve the published story exactly; signs and ambiguous quotations
// remain with the narrator rather than inventing a character's identity.
export function quotedSpans(text) {
  return [...text.matchAll(/„[^“]*“|«[^»]*»|"[^"\n]+"/gu)].map((match, index) => ({ index, start: match.index, end: match.index + match[0].length, text: match[0] }));
}

export function dialogueSegments(text, assignments) {
  const quotes = quotedSpans(text);
  if (assignments.length !== quotes.length) throw new Error('Every quotation needs a speaker decision');
  const segments = [];
  let cursor = 0;
  for (const quote of quotes) {
    const role = assignments[quote.index];
    if (role.index !== quote.index || !['male', 'female', 'narrator'].includes(role.voice)) throw new Error('Invalid speaker decision');
    if (quote.start > cursor) segments.push({ text: text.slice(cursor, quote.start), voice: 'female', speaker: 'Narrator' });
    segments.push({ text: quote.text, voice: role.voice === 'narrator' ? 'female' : role.voice, speaker: role.voice === 'narrator' ? 'Narrator' : role.speaker });
    cursor = quote.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), voice: 'female', speaker: 'Narrator' });
  if (segments.map(segment => segment.text).join('') !== text) throw new Error('Story text changed');
  return segments;
}
