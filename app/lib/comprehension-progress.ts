export type ComprehensionSkill = 'reading' | 'listening';
export type ComprehensionCheck = { score: number; checkedAt: string; usedText: boolean };
export type ComprehensionChecks = Partial<Record<ComprehensionSkill, ComprehensionCheck>>;

export function validCheck(value: unknown): value is ComprehensionCheck {
 const row = value as ComprehensionCheck | null;
 return !!row && Number.isFinite(row.score) && row.score >= 0 && row.score <= 100
  && typeof row.checkedAt === 'string' && Number.isFinite(Date.parse(row.checkedAt)) && typeof row.usedText === 'boolean';
}

// Keep each skill's latest check, including a lower result. Old combined scores
// remain in skillScores as history and cannot create separate check evidence.
export function mergeComprehensionChecks(left: unknown, right: unknown): ComprehensionChecks {
 const result: ComprehensionChecks = {};
 for (const skill of ['reading', 'listening'] as const) {
  const candidates = [left, right].map(value => (value as ComprehensionChecks | null)?.[skill]).filter(validCheck);
  candidates.sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt) || a.score - b.score || Number(b.usedText) - Number(a.usedText));
  if (candidates[0]) result[skill] = candidates[0];
 }
 return result;
}
