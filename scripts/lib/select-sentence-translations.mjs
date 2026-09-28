// Context may change wording, but must not silently move a translation to another line.
const stop = new Set('a an the i me my we us our you your he him his she her it its they them their and but or so to of in on at for from with by as is are was were be been being have has had do does did will would can could shall should not this that these those there then'.split(' '));
const words = text => new Set((text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
  .filter(word => !stop.has(word)).map(word => word.replace(/(?:ing|ed|s)$/, '')));
const english = new Intl.Segmenter('en', { granularity: 'sentence' });
function supportsSameSentence(candidate, reference) {
  const a = words(candidate), b = words(reference);
  if (candidate.split(/\s+/).length > reference.split(/\s+/).length * 1.5 + 3) return false;
  if (!a.size || !b.size) return candidate.trim() === reference.trim();
  const common = [...a].filter(word => b.has(word)).length;
  return 2 * common / (a.size + b.size) >= 0.5;
}
export function chooseSentenceTranslations(context, reference) {
  const lines = context ? [...english.segment(context)].map(s => s.segment.trim()) : [];
  if (lines.length !== reference.length || lines.some((line, i) => !supportsSameSentence(line, reference[i]))) return reference;
  return lines;
}
