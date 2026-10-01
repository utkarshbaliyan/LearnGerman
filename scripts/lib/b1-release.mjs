import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { b1DraftIssues, germanWordCount } from './b1-draft-quality.mjs';
import { readingSentences } from '../../app/lib/reading-sentence-segmentation.mjs';

export const digest = text => createHash('sha256').update(text).digest('hex');
export const replacementId = id => id.replace(/-v1$/, '-v2');

export function buildB1Release({ originals, drafts, support, translations, reviews, questions, speakers }) {
  assert.equal(originals.length, 200, 'Exactly 200 archived B1 stories are required');
  assert.equal(new Set(originals.map(story => story.id)).size, 200);
  const stories = [], plans = {};
  for (const original of originals) {
    const id = replacementId(original.id), draft = drafts[original.id];
    assert.equal(draft?.reviewStatus, 'editorially-accepted', `${id}: German review missing`);
    assert.equal(draft.sourceHash, digest(original.text), `${id}: original edition changed`);
    assert.deepEqual(b1DraftIssues(original.text, draft.text), [], `${id}: German source checks`);
    const text = draft.text, hash = digest(text), paragraphs = text.split('\n\n');
    const english = translations[id], review = reviews[id], help = support[id], quiz = questions[id];
    assert.equal(review?.sourceHash, hash, `${id}: English review is stale or missing`);
    assert.equal(help?.sourceHash, hash, `${id}: vocabulary support is stale or missing`);
    assert.equal(quiz?.sourceHash, hash, `${id}: question review is stale or missing`);
    assert.equal(english?.paragraphs.length, paragraphs.length, `${id}: translation paragraph count`);
    let sentenceCount = 0;
    for (const [index, paragraph] of paragraphs.entries()) {
      const translated = english.paragraphs[index], sentences = readingSentences(paragraph);
      assert.equal(translated.source, paragraph, `${id}: stale translation paragraph`);
      assert.deepEqual(translated.sentences.map(row => row.de), sentences, `${id}: sentence order`);
      assert.ok(translated.sentences.every(row => typeof row.en === 'string' && row.en.trim()), `${id}: empty English`);
      sentenceCount += sentences.length;
    }
    assert.equal(review.sentenceCount, sentenceCount, `${id}: incomplete English review`);
    const sourceSentences = new Set(paragraphs.flatMap(readingSentences));
    assert.equal(quiz.questions.length, 2, `${id}: question count`);
    assert.notEqual(quiz.questions[0].prompt, quiz.questions[1].prompt, `${id}: repeated question`);
    for (const question of quiz.questions) {
      assert.equal(new Set(question.options).size, 3, `${id}: duplicate options`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 3, `${id}: invalid answer`);
      assert.ok(question.explanation?.length > 15 && question.evidence?.length, `${id}: missing explanation/evidence`);
      assert.ok(question.evidence.every(sentence => sourceSentences.has(sentence)), `${id}: stale evidence`);
    }
    assert.equal(help.words.length, original.words.length, `${id}: missing vocabulary`);
    for (const word of help.words) {
      assert.ok(sourceSentences.has(word.example) && word.example.toLowerCase().includes(word.form.toLowerCase()), `${id}: vocabulary example`);
    }
    for (const token of text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
      const clean = token.toLocaleLowerCase('de-DE').replace(/[^\p{L}\p{N}]/gu, '');
      assert.ok(help.wordGlosses[clean]?.trim(), `${id}: missing hover meaning for ${token}`);
    }
    const quotes = [...text.matchAll(/„[^“]+“/gu)], attribution = speakers[id] ?? [];
    assert.equal(attribution.length, quotes.length, `${id}: incomplete dialogue attribution`);
    const segments = [], assignments = [];
    let cursor = 0;
    for (const [index, quote] of quotes.entries()) {
      const row = attribution[index];
      assert.equal(row.quote, quote[0], `${id}: stale dialogue attribution`);
      assert.ok(['male', 'female', 'narrator'].includes(row.voice) && row.speaker && row.evidence, `${id}: unsupported voice`);
      if (quote.index > cursor) segments.push({ text: text.slice(cursor, quote.index), voice: 'female', speaker: 'Narrator' });
      segments.push({ text: quote[0], voice: row.voice === 'narrator' ? 'female' : row.voice, speaker: row.speaker });
      assignments.push({ index, voice: row.voice, speaker: row.speaker, evidence: row.evidence });
      cursor = quote.index + quote[0].length;
    }
    if (cursor < text.length) segments.push({ text: text.slice(cursor), voice: 'female', speaker: 'Narrator' });
    assert.equal(segments.map(segment => segment.text).join(''), text);
    plans[id] = { textHash: hash, assignments, segments };
    stories.push({ ...original, id, text, english: english.paragraphs.map(paragraph => paragraph.sentences.map(row => row.en).join(' ')).join('\n\n'),
      words: help.words, revisit: help.revisit, wordGlosses: help.wordGlosses,
      questions: quiz.questions.map(({ evidence, ...question }) => question) });
  }
  return { stories, plans };
}

export function validateB1Audio(story, plan, entry, sidecar, waveformHeader) {
  const id = story.id, hash = digest(story.text);
  assert.equal(entry?.textHash, hash, `${id}: missing or stale audio`);
  assert.equal(entry.wordCount, germanWordCount(story.text), `${id}: audio word count`);
  const pythonJson = '[' + plan.segments.map(segment => '[' + JSON.stringify(segment.voice) + ', ' + JSON.stringify(segment.text) + ']').join(', ') + ']';
  const filename = `${id}-${hash.slice(0, 12)}-${digest(pythonJson).slice(0, 8)}-qwen-dialogue-opus16.webm`;
  assert.equal(entry.src, `/audio/reading/${filename}`, `${id}: stale voice plan or unexpected asset path`);
  assert.equal(entry.timingSrc, entry.src.replace(/\.webm$/, '.json'), `${id}: mismatched timing asset`);
  assert.equal(Buffer.from(waveformHeader).subarray(0, 4).toString('hex'), '1a45dfa3', `${id}: invalid WebM header`);
  assert.equal(sidecar.textHash, hash, `${id}: stale timing source`);
  assert.equal(sidecar.starts.length, entry.wordCount, `${id}: timing coverage`);
  assert.equal(sidecar.duration, entry.duration, `${id}: timing duration`);
  assert.ok(Number.isFinite(entry.duration) && entry.duration > 0, `${id}: invalid duration`);
  assert.ok(sidecar.starts.every((start, index) => Number.isFinite(start) && start >= 0 && start < entry.duration &&
    (index === 0 || start > sidecar.starts[index - 1])), `${id}: invalid timing order`);
}
