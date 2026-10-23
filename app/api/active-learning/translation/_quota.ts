import { DAILY_SENTENCE_LIMIT, type TranslationAllowance } from '@/app/lib/translation-practice';

export class DailyQuotaError extends Error {}

export async function translationAllowance(db: D1Database, user: string, now = new Date()): Promise<TranslationAllowance> {
  const day = now.toISOString().slice(0, 10);
  const row = await db.prepare('SELECT used, generated, checked FROM tutor_quotas WHERE user_id = ? AND day = ?').bind(user, day).first<{ used: number; generated: number; checked: number }>();
  const generated = row?.generated ?? 0, checked = row?.checked ?? 0;
  return { day, resetsAt: new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000).toISOString(), limit: DAILY_SENTENCE_LIMIT, generated, checked,
    generationRemaining: Math.max(0, DAILY_SENTENCE_LIMIT - generated), checkingRemaining: Math.max(0, DAILY_SENTENCE_LIMIT - checked), requestsRemaining: Math.max(0, 20 - (row?.used ?? 0)) };
}

// One atomic statement reserves both the shared request and the sentence budget.
// A rejected batch consumes neither; retries are deduplicated by the route first.
export async function reserveTranslationQuota(db: D1Database, user: string, action: 'generate' | 'check', count: number, now = new Date()) {
  if (!Number.isInteger(count) || count < 1 || count > DAILY_SENTENCE_LIMIT) throw new RangeError('Reserve 1–12 sentences.');
  if (action !== 'generate' && action !== 'check') throw new RangeError('Invalid sentence quota action.');
  const generated = action === 'generate' ? count : 0, checked = action === 'check' ? count : 0;
  const reserved = await db.prepare('INSERT INTO tutor_quotas (user_id, day, used, generated, checked) VALUES (?, ?, 1, ?, ?) ON CONFLICT (user_id, day) DO UPDATE SET used = used + 1, generated = generated + excluded.generated, checked = checked + excluded.checked WHERE used < 20 AND (excluded.generated = 0 OR generated + excluded.generated <= ?) AND (excluded.checked = 0 OR checked + excluded.checked <= ?) RETURNING used')
    .bind(user, now.toISOString().slice(0, 10), generated, checked, DAILY_SENTENCE_LIMIT, DAILY_SENTENCE_LIMIT).first();
  if (reserved) return;
  const allowance = await translationAllowance(db, user, now);
  const remaining = action === 'generate' ? allowance.generationRemaining : allowance.checkingRemaining;
  if (remaining < count) throw new DailyQuotaError(`Daily ${action === 'generate' ? 'generation' : 'checking'} limit: ${remaining} of ${DAILY_SENTENCE_LIMIT} sentences left. ${action === 'generate' && remaining ? 'Choose a smaller set or try' : 'Try'} again after midnight UTC.${action === 'check' ? ' Your answers are saved.' : ''}`);
  throw new DailyQuotaError('Daily AI limit reached (20 requests). Try again after midnight UTC. Your saved work is safe.');
}
