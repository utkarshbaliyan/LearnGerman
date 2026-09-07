import Link from "next/link";
import { WritingRepairWorkspace } from "@/app/components/writing-repair-workspace";
import { SiteHeader } from "@/app/components/site-header";
import { getPracticeTask } from "@/app/lib/tutor-practice";

export default async function TutorPracticePage({ searchParams }: { searchParams: Promise<{ task?: string }> }) {
  const { task: id } = await searchParams;
  const task = getPracticeTask(id ?? "");
  return <main className="site-shell chapter-page"><SiteHeader active="course" /><Link href="/">← Back to course</Link>
    {task ? <section className="chapter-learning-section"><div className="chapter-section-copy"><span>{task.level} · Personal practice</span><h1>{task.title}</h1><p>Write your own response. A new situation helps show which constructions you can use independently.</p></div><WritingRepairWorkspace key={task.id} taskId={task.id} prompt={task.prompt} suggestedWords={task.level === "A1" ? 40 : 80} /></section> : <p>Choose a personal practice task from your chapter’s learning profile.</p>}
  </main>;
}
