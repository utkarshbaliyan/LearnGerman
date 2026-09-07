import { TUTOR_PATTERNS, tutorPattern, type TutorPatternId } from "./tutor-patterns";
import { getSpeakingMission } from "./speaking-missions";
import type { WritingAttempt } from "./writing-repair";

export type MemorySource = { taskId: string; attempt: WritingAttempt };
export type PatternMemory = { patternId: TutorPatternId; label: string; errorScenarios: number; independentUses: number; assistedUses: number; delayedIndependentUses: number; nextDueAt: string; lastSeen: string };
export type TutorMemory = { patterns: PatternMemory[]; recommendations: { taskId: string; patternId: TutorPatternId; delayed: boolean; dueAt: string }[]; attemptsConsidered: number };
export const TRANSFER_DELAY = 7 * 24 * 60 * 60_000;

export function deriveTutorMemory(sources: MemorySource[], level: string, now = Date.now()): TutorMemory {
  const rows = sources.filter(({ attempt }) => attempt.status === "complete" && Number.isFinite(Date.parse(attempt.createdAt))).sort((a, b) => Date.parse(a.attempt.createdAt) - Date.parse(b.attempt.createdAt));
  const patterns = new Map<TutorPatternId, { errors: Map<string, number>; independent: Set<string>; assisted: Set<string>; delayed: Set<string>; answers: Set<string>; lastSeen: string }>();
  const seenAttempts = new Set<string>();
  for (const { taskId: sourceTaskId, attempt } of rows) {
    const mission = sourceTaskId.startsWith("speaking:") ? getSpeakingMission(sourceTaskId.slice(9)) : null;
    const taskId = mission ? `speaking:${mission.id}` : sourceTaskId;
    const key = `${sourceTaskId}:${attempt.id}`;
    if (seenAttempts.has(key)) continue;
    seenAttempts.add(key);
    const disputed = new Set(attempt.disputes?.map((x) => x.start) ?? []);
    const events = [
      ...(attempt.feedback?.issues ?? []).filter((x) => x.kind === "error" && !disputed.has(x.start)).map((x) => ({ patternId: tutorPattern(x.patternId ?? x.category), correct: false })),
      ...(disputed.size || attempt.feedback?.needsReview ? [] : attempt.feedback?.evidence ?? []).map((x) => ({ patternId: tutorPattern(x.patternId), correct: true })),
    ];
    for (const event of events) {
      if (!event.patternId || event.patternId === "other") continue;
      const state = patterns.get(event.patternId) ?? { errors: new Map(), independent: new Set(), assisted: new Set(), delayed: new Set(), answers: new Set(), lastSeen: attempt.createdAt };
      state.lastSeen = attempt.createdAt;
      const answer = attempt.answerFingerprint ?? attempt.answer.toLocaleLowerCase("de").replace(/[^\p{L}\p{N}]/gu, "");
      if (!event.correct) state.errors.set(taskId, Math.min(state.errors.get(taskId) ?? Infinity, Date.parse(attempt.createdAt)));
      else if (attempt.assistance !== "independent") state.assisted.add(taskId);
      else {
        if (!state.answers.has(answer)) {
          state.independent.add(taskId);
          if ([...state.errors].some(([sourceTask, date]) => sourceTask !== taskId && Date.parse(attempt.createdAt) - date >= TRANSFER_DELAY)) state.delayed.add(taskId);
        }
      }
      state.answers.add(answer);
      patterns.set(event.patternId, state);
    }
  }
  const summaries: PatternMemory[] = [...patterns].filter(([, p]) => p.errors.size > 0).map(([patternId, p]) => ({ patternId, label: TUTOR_PATTERNS[patternId].label,
    errorScenarios: p.errors.size, independentUses: p.independent.size, assistedUses: p.assisted.size, delayedIndependentUses: p.delayed.size,
    nextDueAt: new Date(Math.min(...p.errors.values()) + TRANSFER_DELAY).toISOString(), lastSeen: p.lastSeen,
  })).sort((a, b) => b.errorScenarios - a.errorScenarios || b.lastSeen.localeCompare(a.lastSeen));
  const recommendations = summaries.filter((p) => !p.delayedIndependentUses).flatMap((p) => {
    const variant = Date.parse(p.nextDueAt) <= now ? 2 : 1;
    const taskId = `practice-${level.toLowerCase()}-${p.patternId}-${variant}`;
    return rows.some((x) => x.taskId === taskId) ? [] : [{ taskId, patternId: p.patternId, delayed: variant === 2, dueAt: p.nextDueAt }];
  }).slice(0, 3);
  return { patterns: summaries, recommendations, attemptsConsidered: seenAttempts.size };
}

export async function loadTutorMemory(db: D1Database, userId: string, level: string, now = Date.now()) {
  // Read only complete attempts; photos, drafts and audio never enter the learning profile.
  const rows = await db.prepare("SELECT task_id AS taskId, j.value AS attempt FROM tutor_sessions, json_each(tutor_sessions.data, '$.attempts') AS j WHERE user_id = ? AND json_extract(j.value, '$.status') = 'complete' ORDER BY json_extract(j.value, '$.createdAt') DESC LIMIT 1000").bind(userId).all<{ taskId: string; attempt: string }>();
  return deriveTutorMemory(rows.results.map((row) => ({ taskId: row.taskId, attempt: JSON.parse(row.attempt) })), level, now);
}
