import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {readingSentences} from '../app/lib/reading-sentence-segmentation.mjs';
import {dialogueSegments} from './lib/story-dialogue.mjs';
import {germanWordCount, storyDigest, b2DraftIssues} from './lib/b2-story-quality.mjs';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const blueprints = read('content/reading/b2/blueprints.json').stories;
const progress = read('content/reading/b2/manuscripts/progress.json');
const previous = [...read('app/lib/reading-path-data.json'), ...read('app/lib/reading-expanded-data.json')];
const topics = read('app/lib/reading-topics.json');
const stories = [], plans = {}, translations = {}, findings = [];
assert.equal(blueprints.length, 200);
for (const blueprint of blueprints) {
  const draft = read(`content/reading/b2/manuscripts/${blueprint.id}.json`);
  assert.equal(draft.id, blueprint.id);
  assert.equal(draft.level, 'B2');
  assert.equal(draft.number, blueprint.number);
  assert.equal(draft.section, blueprint.section);
  assert.ok(draft.topics.length && draft.topics.every(topic => Object.hasOwn(topics, topic)));
  assert.equal(progress.reviews[draft.id]?.sourceHash, storyDigest(draft.text), `${draft.id}: stale author review`);
  assert.equal(progress.reviews[draft.id]?.editorialStatus, 'author-reviewed');
  const issues = b2DraftIssues({...blueprint, title:draft.title}, draft, [...previous, ...stories]);
  assert.deepEqual(issues, [], `${draft.id}: ${issues.join('; ')}`);
  const paragraphs = draft.text.split('\n\n');
  const paired = draft.sentenceTranslations.paragraphs;
  assert.equal(paired.length, paragraphs.length, `${draft.id}: translation paragraph count`);
  paired.forEach((paragraph, index) => {
    assert.equal(paragraph.source, paragraphs[index], `${draft.id}: translation source`);
    assert.deepEqual(paragraph.sentences.map(s => s.de), readingSentences(paragraph.source), `${draft.id}: sentence order`);
    assert.ok(paragraph.sentences.every(s => typeof s.en === 'string' && s.en.trim()), `${draft.id}: missing English`);
  });
  assert.equal(draft.english, paired.map(p => p.sentences.map(s => s.en).join(' ')).join('\n\n'), `${draft.id}: paragraph English differs`);
  assert.equal(draft.questions.length, 4);
  assert.ok(draft.questions.every(q => q.prompt && q.explanation && q.options.length >= 3 && Number.isInteger(q.answer) && q.options[q.answer]));
  const sentences = paragraphs.flatMap(readingSentences);
  assert.ok(draft.vocabulary.length >= 8 && draft.vocabulary.length <= 12);
  assert.ok(draft.vocabulary.every(w => w.german && w.form && w.english && sentences.includes(w.example)), `${draft.id}: vocabulary evidence`);
  const wordGlosses = {};
  for (const word of draft.vocabulary) {
    const key = word.form.toLocaleLowerCase('de').replace(/[^\p{L}’'-]/gu, '');
    if (word.form.split(/\s+/).length === 1) wordGlosses[key] = word.english;
  }
  stories.push({id:draft.id, level:'B2', number:draft.number, section:draft.section, title:draft.title,
    goal:draft.goal, text:draft.text, english:draft.english, words:draft.vocabulary, questions:draft.questions,
    grammar:[draft.grammarFocus], grammarFocus:draft.grammarFocus, topics:draft.topics, courseChapter:null, revisit:[], wordGlosses});
  plans[draft.id] = {textHash:storyDigest(draft.text), assignments:draft.speakerAssignments,
    segments:dialogueSegments(draft.text, draft.speakerAssignments)};
  translations[draft.id] = draft.sentenceTranslations;
  findings.push({id:draft.id, textHash:storyDigest(draft.text), germanWords:germanWordCount(draft.text),
    voices:[...new Set(plans[draft.id].segments.map(s => s.voice))]});
}
const stage = resolve('.local-piper/b2-release');
mkdirSync(stage, {recursive:true});
for (const [name, value] of Object.entries({sources:stories.map(s => ({...s, paragraphSentences:s.text.split('\n\n').map(readingSentences)})),
  stories, plans, translations, validation:{count:stories.length, totalGermanWords:findings.reduce((n,s)=>n+s.germanWords,0), findings}})) {
  writeFileSync(`${stage}/${name}.json`, JSON.stringify(value,null,2)+'\n');
}
console.log(JSON.stringify({stage, count:stories.length, wordRange:[Math.min(...findings.map(s=>s.germanWords)),Math.max(...findings.map(s=>s.germanWords))],
  voices:[...new Set(findings.flatMap(s=>s.voices))]}));
