"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import type { TutorMemory } from "@/app/lib/tutor-memory";
import { getPracticeTask } from "@/app/lib/tutor-practice";

export function TutorMemoryPanel({ level }: { level: string }) {
  const [memory, setMemory] = useState<TutorMemory | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true, revision = 0;
    const refresh = () => {
      const token = ++revision;
      void authenticatedFetch(`/api/tutor/memory?level=${level}`).then(async (response) => {
        if (!response.ok) throw new Error("Your learning profile could not be loaded.");
        const payload = await response.json() as TutorMemory;
        if (active && token === revision) { setMemory(payload); setError(""); }
      }).catch((e) => { if (active && token === revision) setError(e.message); });
    };
    refresh(); window.addEventListener("leselaut-tutor-updated", refresh);
    return () => { active = false; revision++; window.removeEventListener("leselaut-tutor-updated", refresh); };
  }, [level]);
  return <section className="tutor-memory-panel" aria-label="Your learning profile"><h3>Your learning profile</h3>
    {error && <p role="status">{error}</p>}
    {memory && !memory.patterns.length && <p>Your recurring patterns will appear here after verified feedback. Writing and speaking share this profile.</p>}
    {memory?.patterns.slice(0, 5).map((pattern) => <article key={pattern.patternId}><b>{pattern.label}</b><p>{pattern.errorScenarios} {pattern.errorScenarios === 1 ? "scenario with an error" : "scenarios with errors"} · {pattern.independentUses} independent uses · {pattern.assistedUses} assisted uses · {pattern.delayedIndependentUses} delayed independent uses</p>{!pattern.delayedIndependentUses && <small>New-context review from {new Date(pattern.nextDueAt).toLocaleDateString()}.</small>}</article>)}
    {memory?.recommendations.map((item) => <p key={item.taskId}><Link href={`/practice/tutor?task=${encodeURIComponent(item.taskId)}`}>{item.delayed ? "Try a delayed review" : "Practise now"}: {getPracticeTask(item.taskId)?.title}</Link></p>)}
    <p className="writing-guidance">Based on your most recent {memory?.attemptsConsidered ?? 0} checked attempts (up to 1,000). Styles and disputed corrections are excluded. Independent means no help recorded in that task; these counts are evidence, not a mastery certificate.</p>
  </section>;
}
