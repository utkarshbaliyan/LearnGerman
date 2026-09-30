import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { b1DraftIssues, germanWordCount } from './lib/b1-draft-quality.mjs';

// Drafts stay separate from the live catalog. No output from this script is
// publishable without editorial acceptance, translations, glosses and new audio.
const destination = 'content/reading/b1-rewrite-drafts.json';
const drafts = existsSync(destination) ? JSON.parse(readFileSync(destination, 'utf8')) : {};
const seeds = ['reading-path-data', 'reading-expanded-data']
  .flatMap((name) => JSON.parse(readFileSync(`app/lib/${name}.json`, 'utf8')))
  .filter((story) => story.level === 'B1');
const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice(7);
const maxNew = Number(process.argv.find((arg) => arg.startsWith('--max-new='))?.slice(10) ?? Infinity);
const regenerate = process.argv.includes('--regenerate');
if (!process.env.GROQ_API_KEY) throw new Error('Existing Groq credential is required');
if (maxNew !== Infinity && (!Number.isInteger(maxNew) || maxNew < 1)) throw new Error('--max-new must be a positive integer');
if (only && !seeds.some((story) => story.id === only)) throw new Error(`Unknown B1 story: ${only}`);

const model = process.env.B1_REWRITE_MODEL || 'openai/gpt-oss-120b';
const reviewModel = process.env.B1_REVIEW_MODEL || 'qwen/qwen3.8-27b';
const pipelineVersion = 2;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const save = () => {
  writeFileSync(`${destination}.tmp`, JSON.stringify(drafts, null, 2) + '\n');
  renameSync(`${destination}.tmp`, destination);
};

async function completion(messages, maxTokens, selectedModel = model, json = false) {
  for (let retry = 0; retry < 12; retry++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(90000),
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: selectedModel,
        ...(selectedModel.startsWith('openai/gpt-oss-') ? { reasoning_effort: 'low' } : {}),
        ...(json ? { response_format: { type: 'json_object' } } : {}),
        temperature: 0.2, max_completion_tokens: maxTokens, messages }),
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 429 || response.status >= 500) {
      if (/per day|daily|24.hour/i.test(body.error?.message || '')) throw new Error('Groq daily limit reached');
      const retryAfter = Number(response.headers.get('retry-after'));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 15000;
      console.error(`Groq ${response.status}; retrying in ${Math.round(wait / 1000)}s`);
      await pause(Math.min(wait, 60000));
      continue;
    }
    if (!response.ok) throw new Error(`Groq HTTP ${response.status} (${body.error?.code || body.error?.type || 'unknown'})`);
    const content = body.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Groq returned empty text');
    return content;
  }
  throw new Error('Groq retries exhausted');
}

async function review(seed, text) {
  const response = await completion([
    { role: 'system', content: 'You are a strict German graded-reader editor. Compare the rewrite with its source. Return only valid JSON: {"pass":boolean,"issues":[string]}. The writer may add plausible scenes, secondary details and dialogue to make a 600–800-word story, but must preserve the original narrator, main characters, central problem, chronology and outcome. Every source plot beat must remain in its original order. An intentionally open ending must remain open. Fail for contradictions, invented appointments or activities that interrupt the chronology, unexplained new relationships or plot turns, an outcome that changes the source, awkward or incorrect German, language well above B1, repeated filler, generic morals or meta commentary about the story. Fail if setting, weather, scents, metaphors or the narrator thinking through the same problem take substantial space without affecting events; every paragraph should contain a concrete action, dialogue or discovery. Check spatial logic, timing and who knows what. Do not reject ordinary fictional details merely because the short seed does not list them. State specific evidence for each issue.' },
    { role: 'user', content: JSON.stringify({ title: seed.title, source: seed.text, sourceEnglish: seed.english, expansion: text }) },
  ], 1400, reviewModel, true);
  let result;
  try { result = JSON.parse(response); } catch { return { pass: false, issues: ['review returned invalid JSON'] }; }
  if (typeof result.pass !== 'boolean' || !Array.isArray(result.issues) || !result.issues.every((issue) => typeof issue === 'string'))
    return { pass: false, issues: ['review returned invalid structure'] };
  return { pass: result.pass && result.issues.length === 0, issues: result.issues };
}

async function plan(seed) {
  const sourceParagraphs = seed.text.split(/\n\s*\n/u).map((part) => part.trim());
  if (sourceParagraphs.length >= 5) return sourceParagraphs;
  const response = await completion([
    { role: 'system', content: 'Plan a realistic 600–800-word B1 German story from a short source. Return ONLY JSON: {"beats":["...",...]}. Give 6–8 ordered beats in German. Each beat must describe a concrete action, conversation, discovery or decision involving the same problem. Preserve all source facts, original narrator, characters, causal relationships and ending. Add small, plausible steps between source events to deepen the conflict; no new subplot, moral, fantasy, new relationship or changed outcome. Never invent named weekdays, dates, prices, exact clock times or travel arrangements. Check that each beat can happen after the previous one. The final beat must match the source ending.' },
    { role: 'user', content: JSON.stringify({ title: seed.title, source: seed.text }) },
  ], 1200, model, true);
  const parsed = JSON.parse(response);
  if (!Array.isArray(parsed.beats) || parsed.beats.length < 5 || parsed.beats.length > 9 || !parsed.beats.every((beat) => typeof beat === 'string' && beat.length > 10))
    throw new Error('invalid story plan');
  return parsed.beats;
}

async function draft(seed, beats, feedback = [], previous = '') {
  const plot = seed.text.match(/[^.!?]+[.!?]+/gu)?.map((sentence) => sentence.trim()) ?? [seed.text];
  return (await completion([
    { role: 'system', content: 'Write a coherent, natural B1 German story for adult learners. Treat the source as an ordered plot outline. Preserve its narrator, main characters, central problem, EVERY plot beat in source order, and its ending. Do not insert an event between source beats if it would change the timeline or make a later beat impossible. You may add plausible actions and short dialogue within existing scenes, but no unrelated subplot or changed resolution. For longer sources with several paragraphs, expand the scenes in place and keep their paragraph order. For short sources, build 5–7 connected scenes around the same conflict while keeping the original outcome. If the source ends with a decision still pending, do not decide it. Every paragraph must contain a concrete action, exchange or discovery that moves the same problem forward. Use direct, natural B1 German. Avoid poetic description, weather, scents, generic scenery, internal monologues, repeated summaries, abstract filler and generic emotional statements. Keep reflection brief and specific. Check that times and locations are logically consistent. End on a concrete action or observation, never a symbolic image, moral, summary or statement about an open ending. No grammar talk, headings, translation or markdown. Return only the story in German.' },
    { role: 'user', content: JSON.stringify({ task: previous
      ? 'Revise the prior draft to resolve every listed issue while keeping its good scenes. Return the complete revised German story at 620–680 words (absolute 600–800), in 5–9 paragraphs. If it is too short, develop existing action and dialogue rather than adding a new outcome.'
      : 'Rewrite this B1 story to 620–680 German words; absolute range 600–800. Use 5–9 paragraphs. Follow every plot beat in its exact order; expand scenes in place. Do not switch from third person to first person or vice versa. Keep an open ending open. Do not add a friend merely to provide advice. Let each paragraph advance the same conflict through action, observation or dialogue.',
      title: seed.title, plot, sourceEnglish: seed.english, plannedBeats: beats,
      instruction: 'Write one paragraph for each planned beat, in the same order. Preserve source facts over any mistaken plan detail. Do not introduce named weekdays, dates, clock times, prices or travel arrangements absent from the source.',
      previousDraft: previous || undefined, previousIssues: feedback }) },
  ], 4000)).replaceAll('**', '').replace(/[ \t]{2,}/gu, ' ').replace(/\n{3,}/gu, '\n\n').trim();
}

let processed = 0;
for (const seed of seeds) {
  if (only && seed.id !== only) continue;
  const sourceHash = createHash('sha256').update(seed.text).digest('hex');
  if (!regenerate && drafts[seed.id]?.sourceHash === sourceHash && drafts[seed.id]?.reviewStatus === 'editorially-accepted') continue;
  if (!regenerate && drafts[seed.id]?.sourceHash === sourceHash && drafts[seed.id]?.pipelineVersion === pipelineVersion && drafts[seed.id]?.reviewStatus === 'unreviewed' && drafts[seed.id]?.wordCount >= 600 && drafts[seed.id]?.wordCount <= 800) continue;
  let candidate = !regenerate && drafts[seed.id]?.sourceHash === sourceHash && drafts[seed.id]?.reviewStatus === 'needs-revision'
    ? drafts[seed.id].text : '';
  let feedback = candidate ? drafts[seed.id].automatedReview?.issues ?? [] : [];
  let assessment = { pass: false, issues: ['no candidate'] };
  try {
    const beats = !regenerate && drafts[seed.id]?.sourceHash === sourceHash && Array.isArray(drafts[seed.id]?.plannedBeats)
      ? drafts[seed.id].plannedBeats : await plan(seed);
    for (let attempt = 0; attempt < 3; attempt++) {
      candidate = await draft(seed, beats, feedback, candidate);
      const mechanical = b1DraftIssues(seed.text, candidate);
      if (mechanical.length) { feedback = mechanical; assessment = { pass: false, issues: mechanical }; continue; }
      assessment = await review(seed, candidate);
      if (assessment.pass) break;
      feedback = assessment.issues;
    }
    drafts[seed.id] = { sourceHash, pipelineVersion, plannedBeats: beats, text: candidate, wordCount: germanWordCount(candidate),
      generatedAt: new Date().toISOString(), reviewStatus: assessment.pass ? 'unreviewed' : 'needs-revision',
      automatedReview: assessment };
    save();
    processed++;
    console.log(`${seed.id}: ${drafts[seed.id].wordCount} words; ${drafts[seed.id].reviewStatus} (${processed}/${seeds.length})`);
    if (processed >= maxNew) break;
  } catch (error) {
    console.error(`${seed.id}: ${String(error)}`);
    process.exitCode = 1;
    break;
  }
}
console.log(`B1 drafts stored: ${Object.keys(drafts).length}/${seeds.length}`);
