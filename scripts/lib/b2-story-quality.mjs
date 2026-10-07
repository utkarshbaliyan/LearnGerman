import {createHash} from 'node:crypto';
import {readingSentences} from '../../app/lib/reading-sentence-segmentation.mjs';
import {germanWordCount} from './b1-draft-quality.mjs';
import {quotedSpans, dialogueSegments} from './story-dialogue.mjs';

export {germanWordCount};
export const storyDigest = text => createHash('sha256').update(text).digest('hex');
export const normalizedStory = text => text.normalize('NFKC').toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function shingles(text, size) {
  const words = normalizedStory(text).split(' ');
  return new Set(words.slice(0, -size + 1).map((_, i) => words.slice(i, i + size).join(' ')));
}

export function storySimilarity(left, right) {
  const a = shingles(left, 4), b = shingles(right, 4);
  const intersection = [...a].filter(value => b.has(value)).length;
  return {jaccard: intersection / Math.max(1, a.size + b.size - intersection),
    containment: intersection / Math.max(1, Math.min(a.size, b.size))};
}

export function b2DraftIssues(blueprint, draft, existing = []) {
  const issues = [];
  if (typeof draft?.text !== 'string' || !draft.text.trim()) return ['missing German story'];
  const words = germanWordCount(draft.text);
  if (words < 900 || words > 1000) issues.push(`${words} German words; required 900–1000`);
  const paragraphs = draft.text.split('\n\n');
  if (paragraphs.length < 8 || paragraphs.length > 11) issues.push(`${paragraphs.length} paragraphs; expected 8–11`);
  if (/\*\*|^#{1,6}\s|\b(?:in dieser Geschichte|diese Geschichte zeigt|grammatische Struktur|Wortanzahl)\b/imu.test(draft.text)) issues.push('markdown, padding or reader-facing commentary');
  const sentences = paragraphs.flatMap(readingSentences).map(normalizedStory).filter(s => germanWordCount(s) >= 8);
  if (new Set(sentences).size !== sentences.length) issues.push('a full sentence repeats within the story');
  const quotes = quotedSpans(draft.text);
  if (quotes.length < 10) issues.push('fewer than ten direct speech exchanges');
  try {dialogueSegments(draft.text, draft.speakerAssignments ?? []);} catch (error) {issues.push(`speaker plan: ${error.message}`);}
  const priorSentences = new Set(existing.flatMap(s => s.text.split('\n\n').flatMap(readingSentences))
    .filter(s => germanWordCount(s) >= 18).map(normalizedStory));
  if (sentences.some(s => priorSentences.has(s))) issues.push('an extended sentence repeats from another story');
  for (const previous of existing) {
    if (normalizedStory(previous.title) === normalizedStory(blueprint.title)) issues.push(`title repeats ${previous.id}`);
    if (normalizedStory(previous.text) === normalizedStory(draft.text)) issues.push(`text repeats ${previous.id}`);
    const similarity = storySimilarity(previous.text, draft.text);
    if (similarity.containment > .28 || similarity.jaccard > .16) issues.push(`text overlaps ${previous.id}: ${(100 * similarity.containment).toFixed(1)}% phrase containment`);
  }
  return issues;
}
