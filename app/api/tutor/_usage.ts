import { getD1 } from '@/db';
import { ProviderRequestError } from './_errors';

// Count outbound provider attempts, including retries and failed calls, before
// sending them. The database makes the allowance shared across all accounts.
export async function providerFetch(input: string, init: RequestInit) {
  const configured = process.env.LESELAUT_AI_DAILY_CALL_LIMIT ?? '200';
  const limit = /^\d+$/.test(configured) ? Number(configured) : 0;
  if (process.env.LESELAUT_AI_ENABLED === '0' || !Number.isSafeInteger(limit) || limit <= 0 || limit > 100_000) {
    throw new ProviderRequestError(429, 'AI practice is paused. Your saved work is safe.');
  }
  const db = await getD1();
  const reserved = await db.prepare('INSERT INTO ai_provider_usage (day, calls) VALUES (?, 1) ON CONFLICT (day) DO UPDATE SET calls = calls + 1 WHERE calls < ? RETURNING calls')
    .bind(new Date().toISOString().slice(0, 10), limit).first();
  if (!reserved) throw new ProviderRequestError(429, 'The shared daily AI allowance is used. Try again after midnight UTC.');
  return fetch(input, init);
}
