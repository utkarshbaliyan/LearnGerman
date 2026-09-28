const segmenter = new Intl.Segmenter('de', { granularity: 'sentence' });
const ordinalContinuation = /^(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Stock|Etage|Obergeschoss)\b/;

export function readingSentences(paragraph) {
  const rows = [...segmenter.segment(paragraph)].map(part => part.segment.trim());
  const sentences = [];
  for (const row of rows) {
    const previous = sentences.at(-1);
    if (previous && /\d+\.$/.test(previous) && ordinalContinuation.test(row)) {
      sentences[sentences.length - 1] = `${previous} ${row}`;
    } else sentences.push(row);
  }
  return sentences;
}
