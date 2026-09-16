import { mergeComprehensionChecks, validCheck, type ComprehensionChecks, type ComprehensionCheck } from './comprehension-progress';
export type ReadingEditionCheck = ComprehensionChecks & { checkpoint?: ComprehensionCheck; completedAt?: string };
export type ReadingEditionChecks = Record<string, ReadingEditionCheck>;
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
export const readingEditionId = (level: string, number: number) => `reading-${level.toLowerCase()}-${String(number).padStart(2, '0')}-v1`;
export function mergeReadingEditionChecks(left: unknown, right: unknown): ReadingEditionChecks {
  const a = object(left), b = object(right), result: ReadingEditionChecks = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!/^reading-(a1|a2|b1)-(0[1-9]|1[0-9]|2[0-4])-v\d+$/.test(id)) continue;
    const first = object(a[id]), second = object(b[id]);
    const checkpoint = mergeComprehensionChecks({ reading: first.checkpoint }, { reading: second.checkpoint }).reading;
    const dates = [first.completedAt, second.completedAt].filter((date): date is string => typeof date === 'string' && Number.isFinite(Date.parse(date))).sort();
    result[id] = { ...mergeComprehensionChecks(first, second), ...(checkpoint ? { checkpoint } : {}), ...(dates.length ? { completedAt: dates.at(-1) } : {}) };
  }
  return result;
}
export function readingEditionComplete(check: ReadingEditionCheck | undefined) {
  return !!check?.completedAt && validCheck(check.reading) && check.reading.score >= 70 && validCheck(check.listening) && check.listening.score >= 70 && validCheck(check.checkpoint) && check.checkpoint.score >= 80;
}
