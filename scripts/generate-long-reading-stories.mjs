import { readFileSync, writeFileSync, renameSync } from 'node:fs';

// Resumable editorial draft generator. Run with: node --env-file=.env.local scripts/generate-long-reading-stories.mjs
// Review and compile the resulting content/reading/long-stories.json before publishing.
const destination = 'content/reading/long-stories.json';
const saved = JSON.parse(readFileSync(destination, 'utf8'));
const original = JSON.parse(readFileSync('app/lib/reading-path-data.json', 'utf8'));
const seeds = [];
for (const level of ['A1', 'A2', 'B1']) {
  const rows = readFileSync(`content/reading/${level.toLowerCase()}.psv`, 'utf8').trim().split('\n');
  for (const [index, row] of rows.entries()) {
    const [topics, title, grammar, marked, beginning, ending] = row.split('|');
    seeds.push({ id: `reading-${level.toLowerCase()}-${String(index + 25).padStart(2, '0')}-v1`, level, title, grammar, topics, text: marked.replace(/~([^~=]+)=[^~]+~/g, '$1').replaceAll(' // ', '\n\n'), beginning, ending });
  }
}
for (const story of original) seeds.push({ ...story, beginning: story.english, ending: story.english });
const ranges = { A1: [85, 135], A2: [220, 300], B1: [400, 800] };
const maxOutput = { A1: 650, A2: 1050, B1: 1700 };
const count = text => (text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
function save() {
  writeFileSync(`${destination}.tmp`, JSON.stringify(saved, null, 2) + '\n');
  renameSync(`${destination}.tmp`, destination);
}
function requestBody(seed, attempt = 0) {
  const [min, max] = ranges[seed.level];
  const target = seed.level === 'A1' ? '105–125' : seed.level === 'A2' ? '245–280' : '410–450';
  const levelGuide = seed.level === 'A1'
    ? 'Use mostly present tense, short clauses, common concrete words and basic questions. Keep each sentence understandable to an A1 learner. A little Perfekt is acceptable only if the seed needs it.'
    : seed.level === 'A2'
      ? 'Use clear conversational German with present, Perfekt and simple subordinate clauses. Vary accusative and dative naturally. Avoid rare literary vocabulary.'
      : 'Use natural B1 prose: varied but readable sentences, dialogue, Perfekt and Präteritum where natural, subordinate and relative clauses, dative and accusative. Write 4–5 paragraphs, each with a new event or exchange. Keep the seed narrator, family relationships, main characters and chronology exactly. Add a concrete obstacle and response, but no new relatives or major events. Never leave a child unsupervised. Check article gender, case and verb agreement before answering. Avoid procedural padding, repeated explanations and generic conclusions.';
  return {
      model: 'openai/gpt-oss-120b', reasoning_effort: 'low', temperature: 0.35,
      max_completion_tokens: maxOutput[seed.level],
      messages: [
        { role: 'system', content: 'You are a German native speaker and editor of graded readers for adults. Treat the supplied seed as the complete plot, not as a suggestion for a new plot. Expand its events in the same order through concrete observation, short dialogue and meaningful character reactions. Add no new obstacle, reversal, relative, or outcome. Check German grammar and factual continuity. Return only German prose: no title, foreign-language quotations, translation, notes, markdown or word count.' },
        { role: 'user', content: `Expand this ${seed.level} story titled “${seed.title}” to ${target} German words (absolute allowed range ${min}–${max}). ${levelGuide}\n\nThe seed already contains the entire chain of events. Keep every seed fact and the same narrator, people, relationships, order and ending. Turn each seed event into a scene with action, brief natural dialogue and a specific detail that matters to the next event. Do not invent another problem or event. Do not resolve an intentionally open ending. Avoid repeated concerns, filler, implausible actions and a moral. All prose and dialogue must be in German. Do not output the title, headings, lists or markdown.\n\nTopic: ${seed.topics || seed.goal || ''}. Grammar focus: ${seed.grammar || seed.grammarFocus || ''}.\nSeed: ${seed.text}\n${attempt ? `Previous attempt did not meet the exact word range. Ensure ${min}–${max} words this time.` : ''}` },
      ],
  };
}
async function generate(seed, attempt = 0) {
  const [min, max] = ranges[seed.level];
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody(seed, attempt)),
  });
  const data = await response.json();
  if (response.status === 429 || response.status >= 500) {
    const retryAfter = Number(response.headers.get('retry-after'));
    const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 12000;
    console.error(`retry ${seed.id} HTTP ${response.status} ${data.error?.code || data.error?.type || ''} after ${Math.round(wait / 1000)}s`);
    await pause(wait);
    return generate(seed, attempt);
  }
  if (!response.ok) throw new Error(`${seed.id}: HTTP ${response.status} ${data.error?.code || data.error?.type || 'unknown'}`);
  const text = data.choices?.[0]?.message?.content?.trim()
    .replaceAll('**', '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
  if (!text) throw new Error(`${seed.id}: empty response (${data.choices?.[0]?.finish_reason})`);
  const words = count(text);
  if (words < min || words > max) {
    if (attempt < 2) return generate(seed, attempt + 1);
    throw new Error(`${seed.id}: ${words} words outside ${min}–${max}`);
  }
  return { text, wordCount: words, generatedAt: new Date().toISOString() };
}
if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required');
for (const [index, seed] of seeds.entries()) {
  if (saved[seed.id]) continue;
  try {
    saved[seed.id] = await generate(seed);
    save();
    if ((index + 1) % 10 === 0) console.log(`saved ${index + 1}/${seeds.length} (${seed.id})`);
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
    break;
  }
}
console.log(`total saved ${Object.keys(saved).length}/${seeds.length}`);
