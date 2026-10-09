import { z } from 'zod';
import { vocabularyCardKey, type VocabularyRecallAttempt } from './progress-sync';

export const MIN_RECALL_WORDS = 5;
export const MAX_RECALL_WORDS = 15;
export const MAX_RECALL_DECKS = 30;
const id = z.string().min(1).max(200).regex(/^[\p{L}\p{N}_: -]+$/u).refine(v => !['__proto__', 'constructor', 'prototype'].includes(v));
const time = z.number().int().min(0).max(8_640_000_000_000_000);
const wordSchema = z.object({
  key: id, german: z.string().trim().min(1).max(100), english: z.string().trim().min(1).max(600),
  progressByHeadword: z.literal(true), context: z.string().max(600).optional(),
  sourceHref: z.string().regex(/^\/(?:stories\/[a-zA-Z0-9_-]+|books\/(?:a1|a2|b1)\/[a-z0-9-]+\/[1-9]\d*)$/).optional(),
}).refine(w => w.key === vocabularyCardKey(w));
export type RecallDeckWord = z.infer<typeof wordSchema>;
const answerSchema = z.object({ id, key: id, at: time, correct: z.boolean(), assisted: z.boolean(), elapsedDays: z.number().min(0).max(100000) });
const runSchema = z.object({ id, startedAt: time, updatedAt: time, order: z.array(id).min(MIN_RECALL_WORDS).max(MAX_RECALL_WORDS), answers: z.record(answerSchema) });
const deckSchema = z.object({
  id, name: z.string().trim().min(1).max(80), createdAt: time, updatedAt: time,
  words: z.array(wordSchema).min(MIN_RECALL_WORDS).max(MAX_RECALL_WORDS), run: runSchema.optional(),
}).superRefine((d, ctx) => {
  const keys = new Set(d.words.map(w => w.key));
  if (keys.size !== d.words.length) ctx.addIssue({ code: 'custom', message: 'Choose different words.' });
  if (d.run && (d.run.order.length !== keys.size || new Set(d.run.order).size !== keys.size || d.run.order.some(k => !keys.has(k)) || Object.entries(d.run.answers).some(([key, a]) => !keys.has(key) || a.key !== key || a.at < d.run!.startedAt))) ctx.addIssue({ code: 'custom', message: 'Invalid recall round.' });
});
export type RecallDeck = z.infer<typeof deckSchema>;

export function readRecallDecks(value: unknown): Record<string, RecallDeck> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, raw]) => {
    const parsed = deckSchema.safeParse(raw);
    return parsed.success && parsed.data.id === key ? [[key, parsed.data]] : [];
  }).sort((a, b) => (a[1] as RecallDeck).updatedAt - (b[1] as RecallDeck).updatedAt || String(a[0]).localeCompare(String(b[0])))) as Record<string, RecallDeck>;
}

export function createRecallDeck(id: string, name: string, words: RecallDeckWord[], now = Date.now()): RecallDeck {
  return deckSchema.parse({ id, name: name.trim() || 'German recall deck', words, createdAt: now, updatedAt: now });
}

export function startRecallDeck(deck: RecallDeck, runId: string, now = Date.now(), random = Math.random): RecallDeck {
  const order = deck.words.map(w => w.key);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return deckSchema.parse({ ...deck, updatedAt: Math.max(now, deck.updatedAt + 1), run: { id: runId, startedAt: now, updatedAt: now, order, answers: {} } });
}

export function recordDeckAnswer(deck: RecallDeck, runId: string, answer: VocabularyRecallAttempt): RecallDeck {
  if (!deck.run || deck.run.id !== runId || !deck.run.order.includes(answer.key)) throw new Error('This recall round has changed.');
  if (deck.run.answers[answer.key]) return deck;
  return deckSchema.parse({ ...deck, updatedAt: Math.max(answer.at, deck.updatedAt + 1), run: { ...deck.run, updatedAt: Math.max(answer.at, deck.run.updatedAt + 1), answers: { ...deck.run.answers, [answer.key]: answer } } });
}

export function mergeRecallDecks(a: unknown, b: unknown): Record<string, RecallDeck> {
  const result = readRecallDecks(a);
  for (const [key, incoming] of Object.entries(readRecallDecks(b))) {
    const local = result[key];
    if (!local) { result[key] = incoming; continue; }
    const latest = (x: RecallDeck, y: RecallDeck) => x.updatedAt > y.updatedAt || (x.updatedAt === y.updatedAt && JSON.stringify(x) > JSON.stringify(y)) ? x : y;
    let merged = latest(local, incoming);
    if (local.run && incoming.run && local.run.id === incoming.run.id) {
      const answers = { ...local.run.answers };
      for (const [k, answer] of Object.entries(incoming.run.answers)) {
        const previous = answers[k];
        if (!previous || answer.at < previous.at || (answer.at === previous.at && answer.id < previous.id)) answers[k] = answer;
      }
      merged = { ...merged, run: { ...merged.run!, updatedAt: Math.max(local.run.updatedAt, incoming.run.updatedAt), answers } };
    } else if (local.run && incoming.run) {
      const newestRun = local.run.startedAt > incoming.run.startedAt || (local.run.startedAt === incoming.run.startedAt && local.run.id > incoming.run.id) ? local.run : incoming.run;
      merged = { ...merged, run: newestRun };
    }
    result[key] = merged;
  }
  return readRecallDecks(result);
}
