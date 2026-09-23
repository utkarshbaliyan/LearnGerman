import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

// Compiles authored scenes; never constructs story prose from recycled templates.
const topics = {
 home: 'Home & housing', family: 'Family & relationships', school: 'School & learning',
 health: 'Health, illness & hospital', travel: 'Travel & transport', work: 'Office & working life',
 cafe: 'Cafés & restaurants', shopping: 'Shopping & money', colours: 'Colours & descriptions',
 animals: 'Animals & pets', nature: 'Nature & outdoors', weather: 'Weather & seasons',
 food: 'Food & cooking', leisure: 'Hobbies & free time', town: 'Town & neighbourhood',
 time: 'Time & appointments', clothes: 'Clothes & appearance', plans: 'Plans & experiences',
 technology: 'Technology & communication', sport: 'Sport & clubs', services: 'Everyday services',
 culture: 'Culture & encounters',
};
const grammar = {
 present: 'Present-tense narration: notice the finite verb in statements and questions.',
 accusative: 'Objects in context: notice accusative forms after verbs such as nehmen, suchen and kaufen.',
 location: 'Location and direction: compare where something is with where someone puts or moves it.',
 plural: 'Singular and plural: notice noun forms and the matching verbs and articles.',
 negation: 'Negation in context: notice nicht and kein and what they negate.',
 separable: 'Separable verbs: look for a verb near the beginning and its prefix later in the clause.',
 possessive: 'Possession and reference: follow whose objects are described by mein, sein, ihr and related forms.',
 questions: 'Questions and clarification: notice how speakers ask for or check specific information.',
 colours: 'Colours and description: notice colour words before nouns and after sein.',
 modal: 'Modal verbs: notice how können, müssen or wollen work with an infinitive.',
 time: 'Time expressions: follow dates, clock times and the order of events.',
 imperative: 'Requests and instructions: notice how speakers ask someone to do something.',
 numbers: 'Numbers in everyday decisions: pay attention to quantities, prices and times.',
 comparison: 'Comparisons: notice how differences, choices and priorities are expressed.',
 dative: 'Dative in context: notice recipients and phrases with mit, bei, von or zu.',
 weather: 'Weather expressions: notice es and present-tense descriptions of changing conditions.',
 past: 'Past narration: notice war, hatte and other past forms, including the conversational Perfekt.',
 future: 'Plans: German often uses the present tense with a future time expression; also notice wollen and werden where used.',
 because: 'Reasons and consequences: notice how explanations are connected, including weil and deshalb where used.',
 when: 'Time and conditions: notice how clauses with wenn or als connect to the main clause.',
 polite: 'Polite requests: notice questions, indirect wording and forms such as könnte or würde where used.',
 perfect: 'Conversational past: notice haben or sein with a past participle.',
 without: 'Exclusions and alternatives: notice ohne, nicht and ways of describing what is left out.',
 sequence: 'Sequence: notice how actions, decisions and their consequences are ordered.',
 although: 'Concession and contrast: notice how obwohl or trotzdem connects two contrasting ideas.',
 passive: 'Passive voice: notice werden with a participle when the action or result matters more than who acts.',
 genitive: 'Genitive and noun phrases: notice expressions such as während des or the possessor after a noun.',
 relative: 'Relative clauses: follow the noun described by der, die or das and related pronoun forms.',
 conditional: 'Hypothetical choices: notice würde, könnte or hätte and the alternatives they describe.',
 pastperfect: 'Earlier past: notice hatte or war with a participle for something that happened before another past event.',
};
const root = process.cwd();
const vite = await createServer({ root, configFile: false, appType: 'custom', resolve: { alias: { '@': root } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false } });
try {
 const { meaningFor, cleanWord } = await vite.ssrLoadModule('/app/curriculum/index.ts');
 const existingGlosses = JSON.parse(readFileSync('app/lib/reading-glosses.json', 'utf8'));
 const extraGlosses = {};
 for (const entry of readFileSync('content/reading/glosses.psv', 'utf8').replaceAll('\n', '|').split('|').filter(Boolean)) {
  const [keys, value] = entry.split('=');
  assert.ok(keys && value);
  for (const key of keys.split(',')) extraGlosses[key] = value;
 }
 Object.assign(extraGlosses, JSON.parse(readFileSync('content/reading/generated-glosses.json', 'utf8')));
 Object.assign(extraGlosses, JSON.parse(readFileSync('content/reading/manual-glosses.json', 'utf8')));
 writeFileSync('content/reading/glosses.json', JSON.stringify(extraGlosses, null, 2) + '\n');
 const stories = [], sections = {}, counts = {}, missing = new Map();
 const old = JSON.parse(readFileSync('app/lib/reading-path-data.json', 'utf8'));
 const long = JSON.parse(readFileSync('content/reading/long-stories.json', 'utf8'));
 // B1 drafts remain private to editorial review until explicitly included.
 const includeB1Drafts = process.argv.includes('--include-b1-drafts');
 const editorialFixes = JSON.parse(readFileSync('content/reading/editorial-fixes.json', 'utf8'));
 const editedText = (id, raw) => {
  let text = raw.replaceAll('**', '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');
  for (const [from, to] of editorialFixes[id] ?? []) {
   assert.equal(text.split(from).length, 2, `${id}: editorial correction must match exactly once: ${from}`);
   text = text.replace(from, to);
  }
  return text;
 };
 const sentenceFor = (text, form) => (text.match(/[^.!?]+[.!?]+[“”]?/gu) ?? [text]).find(part => part.toLowerCase().includes(form.toLowerCase()))?.trim();
 for (const story of old) {
  if (!long[story.id] || (!includeB1Drafts && story.level === 'B1')) continue;
  story.text = editedText(story.id, long[story.id].text);
  story.words = story.words.filter(word => sentenceFor(story.text, word.form || word.german)).map(word => ({ ...word, example: sentenceFor(story.text, word.form || word.german) }));
  for (const token of new Set(story.text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? [])) {
   if (story.words.length >= 3) break;
   const key = cleanWord(token);
   const gloss = extraGlosses[key] || existingGlosses[key] || meaningFor(token);
   if (token.length < 6 || !gloss || /personal name|surname|given name/.test(gloss) || story.words.some(word => word.form?.toLowerCase() === token.toLowerCase())) continue;
   story.words.push({ german: token, english: gloss, form: token, example: sentenceFor(story.text, token), headword: token, headwordEnglish: gloss, contextOnly: true });
  }
  for (const token of new Set(story.text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? [])) {
   const key = cleanWord(token);
   if (!extraGlosses[key] && !existingGlosses[key] && !meaningFor(token)) missing.set(key, [...(missing.get(key) ?? []), story.title]);
  }
 }
 for (const level of ['A1', 'A2', 'B1']) {
  const lines = readFileSync(`content/reading/${level.toLowerCase()}.psv`, 'utf8').trim().split('\n');
  const topicOrder = [...new Set(lines.map(line => line.split('|')[0].split(',')[0]))];
  sections[level] = topicOrder.map(topic => topics[topic]);
  const group = lines.map((line, index) => {
   const fields = line.split('|');
   assert.equal(fields.length, 6, `${level}:${index + 1}: fields`);
   const [topicField, title, focus, marked, beginning, ending] = fields;
   const storyTopics = topicField.split(',');
   const topic = storyTopics[0];
   assert.ok(storyTopics.every(key => topics[key]));
   assert.ok(topics[topic] && grammar[focus], `${title}: topic/grammar`);
   const anchors = [...marked.matchAll(/~([^~=]+)=([^~]+)~/g)].map(([, form, english]) => ({ form, english }));
   const number = index + 25;
   const id = `reading-${level.toLowerCase()}-${String(number).padStart(2,'0')}-v1`;
   const text = long[id] && (includeB1Drafts || level !== 'B1')
    ? editedText(id, long[id].text) : marked.replace(/~([^~=]+)=[^~]+~/g, '$1').replaceAll(' // ', '\n\n');
   assert.ok(!text.includes('~'), title);
   const wordGlosses = {};
   for (const { form, english } of anchors) if (!/\s/.test(form)) wordGlosses[cleanWord(form)] = english;
   const words = anchors.filter(({ form }) => form.length > 2 && sentenceFor(text, form)).map(({ form, english }) => ({ german: form, english, form, example: sentenceFor(text, form), headword: form, headwordEnglish: english, contextOnly: true }));
   const tokens = [...new Set(text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? [])];
   for (const token of tokens) {
    const key = cleanWord(token);
    const gloss = wordGlosses[key] || extraGlosses[key] || existingGlosses[key] || meaningFor(token);
    if (!gloss) missing.set(key, [...(missing.get(key) ?? []), title]);
    // Choose additional contextual forms, not invented dictionary headwords.
    if (words.length < 4 && token.length >= 7 && gloss && !/personal name|surname|given name/.test(gloss) && !words.some(w => w.form.toLowerCase() === token.toLowerCase())) {
     words.push({ german: token, english: gloss, form: token, example: sentenceFor(text, token) ?? text, headword: token, headwordEnglish: gloss, contextOnly: true });
    }
   }
   return { id, level, number, section: topicOrder.indexOf(topic) + 5, title,
    goal: `Read about ${topics[topic].toLowerCase()}: ${title}.`, text, english: `${beginning} ${ending}`, words,
    questions: [], grammar: grammar[focus], grammarFocus: focus, topics: storyTopics, courseChapter: null, revisit: [], wordGlosses,
    beginning, ending,
   };
  });
  // Meaning-based distractors come from other authored situations in the same
  // level/topic. No fabricated fact is presented as part of the German story.
  for (const [index, story] of group.entries()) {
   const peers = group.filter(s => s.topics[0] === story.topics[0] && s.id !== story.id);
   const candidates = [...peers, ...group.filter(s => s.id !== story.id)];
   for (const [qIndex, key] of ['beginning', 'ending'].entries()) {
    const correct = story[key];
    const alternatives = [...new Set(candidates.map(s => s[key]))].filter(s => s !== correct).slice(index % 3, index % 3 + 2);
    assert.equal(alternatives.length, 2);
    const answer = (index + qIndex) % 3;
    const options = [...alternatives]; options.splice(answer, 0, correct);
    story.questions.push({ prompt: qIndex ? 'How does the situation develop or end?' : 'Which situation is described in this story?', options, answer, explanation: correct });
   }
  }
  for (const story of group) { delete story.beginning; delete story.ending; }
  counts[level] = old.filter(s => s.level === level).length + group.length;
  stories.push(...group);
 }
 assert.ok(counts.A1 >= 100 && counts.A2 >= 150 && counts.B1 >= 200);
 assert.equal(new Set([...old, ...stories].map(s=>s.id)).size, old.length + stories.length);
 assert.equal(new Set(stories.map(s=>s.text)).size, stories.length);
 const draft = process.argv.includes('--draft');
 if (!draft) assert.equal(Object.keys(long).length, old.length + stories.length, 'Every story must have an expanded authored draft');
 for (const story of [...old, ...stories]) {
  if (!draft) assert.ok(long[story.id], `${story.id}: missing long story`);
  if (!draft || story.level !== 'B1') {
   const words = (story.text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;
   const [min, max] = { A1: [70, 200], A2: [200, 400], B1: [400, 800] }[story.level];
   assert.ok(words >= min && words <= max, `${story.id}: ${words} words outside ${min}–${max}`);
   assert.doesNotMatch(story.text, /\*\*|(?:^|\n)Szene\s*\d+/i, `${story.id}: prose must have no headings`);
  }
 }
 writeFileSync('app/lib/reading-path-data.json', JSON.stringify(old, null, 2) + '\n');
 writeFileSync('/tmp/leselaut-missing-glosses.json', JSON.stringify(Object.fromEntries([...missing].sort()), null, 2));
 if (!draft) assert.equal(missing.size, 0, 'Add explicit glosses before publishing; see /tmp/leselaut-missing-glosses.json');
 writeFileSync('app/lib/reading-expanded-data.json', JSON.stringify(stories));
 writeFileSync('app/lib/reading-topics.json', JSON.stringify(topics, null, 2) + '\n');
 writeFileSync('app/lib/reading-expanded-sections.json', JSON.stringify(sections, null, 2) + '\n');
 writeFileSync('/tmp/leselaut-missing-glosses.json', JSON.stringify(Object.fromEntries([...missing].sort()), null, 2));
 const coverage = Object.entries(topics).map(([id, label])=>({id,label,...Object.fromEntries(['A1','A2','B1'].map(level=>[level,stories.filter(s=>s.level===level&&s.topics.includes(id)).map(s=>s.id)]))}));
 writeFileSync('docs/reading/expanded-coverage.json', JSON.stringify({counts, added: stories.length, topics:coverage},null,2)+'\n');
 console.log(JSON.stringify({counts, added: stories.length, missingGlosses: missing.size}));
} finally { await vite.close(); }
