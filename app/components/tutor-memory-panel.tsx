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
  if (error || !memory?.patterns.length) return null;
  return <details className="tutor-memory-panel"><summary>Extra practice</summary>
    {memory.recommendations.map((item) => <p key={item.taskId}><Link href={`/practice/tutor?task=${encodeURIComponent(item.taskId)}`}>{getPracticeTask(item.taskId)?.title}</Link></p>)}
    {!memory.recommendations.length && <p>No extra practice is due.</p>}
  </details>;
}
