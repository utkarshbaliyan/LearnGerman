"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  GraduationCap,
  Headphones,
  Languages,
  LockKeyhole,
  Mic,
  PenLine,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SiteHeader } from "@/app/components/site-header";
import { ALL_GRAMMAR_LESSONS, GRAMMAR_MODULES } from "@/app/grammar/course";
import { COURSE_SKILLS, useCourseProgress } from "@/app/hooks/use-course-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const SKILL_META = {
  reading: { label: "Reading", icon: BookOpen },
  listening: { label: "Listening", icon: Headphones },
  vocabulary: { label: "Vocabulary", icon: Languages },
  grammar: { label: "Grammar", icon: GraduationCap },
  speaking: { label: "Speaking", icon: Mic },
  writing: { label: "Writing", icon: PenLine },
} as const;

const LEVELS = [
  { id: "A1", title: "Foundation", chapters: 24, words: "1,000", status: "active" },
  { id: "A2", title: "Everyday independence", chapters: 24, words: "2,200 cumulative", status: "planned" },
  { id: "B1", title: "Independent German", chapters: 24, words: "4,000 cumulative", status: "planned" },
  { id: "B2", title: "Complex communication", chapters: 30, words: "6,000 cumulative", status: "planned" },
  { id: "C1", title: "Advanced command", chapters: 36, words: "8,500+ cumulative", status: "planned" },
] as const;

export default function CoursePage() {
  const { progress, hydrated } = useCourseProgress();
  const a1Lessons = ALL_GRAMMAR_LESSONS.filter((lesson) => lesson.id.startsWith("a1-"));
  const completedChapters = a1Lessons.filter((lesson) => progress.chapters[lesson.id]?.completed).length;
  const coursePercent = Math.round((completedChapters / a1Lessons.length) * 100);
  const chapterOne = progress.chapters["a1-1-1"];

  return (
    <main className="site-shell course-home" id="top">
      <SiteHeader active="course" />

      <section className="course-home-hero">
        <div>
          <Badge className="course-home-eyebrow"><Sparkles /> Complete German · A1–C1</Badge>
          <h1>Learn every skill.<br /><em>Master every level.</em></h1>
          <p>One structured course where every chapter combines listening, reading, vocabulary, grammar, speaking, writing, and real communication.</p>
          <div className="course-home-actions"><Button size="lg" asChild><Link href="/course/a1/chapter-1">{chapterOne ? "Continue Chapter 1" : "Begin A1 Chapter 1"}<ArrowRight /></Link></Button><a href="#roadmap">View the A1 roadmap</a></div>
        </div>

        <aside className={`course-mastery-card${hydrated ? " is-ready" : ""}`}>
          <div className="course-mastery-heading"><div><span>Your A1 course</span><h2>{coursePercent}% complete</h2></div><div className="course-master-ring" style={{ "--mastery": `${coursePercent * 3.6}deg` } as CSSProperties}><strong>{completedChapters}/24</strong></div></div>
          <Progress value={coursePercent} aria-label={`A1 course ${coursePercent}% complete`} />
          <p>A chapter counts only after reading, listening, vocabulary, grammar, speaking, and writing requirements are met.</p>
          <div className="course-skill-preview">
            {COURSE_SKILLS.map((skill) => {
              const Icon = SKILL_META[skill].icon;
              const score = chapterOne?.skillScores[skill] ?? 0;
              return <div key={skill}><Icon /><span>{SKILL_META[skill].label}</span><b>{score}%</b></div>;
            })}
          </div>
        </aside>
      </section>

      <section className="course-promise">
        <div><Target /><span><b>No isolated sections</b><small>Every skill is practised inside the chapter where it is needed.</small></span></div>
        <div><CheckCircle2 /><span><b>Mastery, not screen completion</b><small>Weak skills cannot be hidden by a high score elsewhere.</small></span></div>
        <div><Languages /><span><b>8,500+ useful words by C1</b><small>Learned in context, recalled actively, and recycled later.</small></span></div>
      </section>

      <section className="level-journey" aria-labelledby="level-journey-title">
        <div className="course-section-heading"><span>The complete journey</span><h2 id="level-journey-title">From first introductions to advanced German.</h2><p>We will publish this curriculum chapter by chapter. A1 Chapter 1 is the first complete reference chapter.</p></div>
        <div className="level-journey-grid">
          {LEVELS.map((level) => <article key={level.id} className={level.status === "active" ? "is-active" : ""}><div><strong>{level.id}</strong><Badge variant={level.status === "active" ? "default" : "outline"}>{level.status === "active" ? "In development" : "Planned"}</Badge></div><h3>{level.title}</h3><p>{level.chapters} integrated chapters</p><span>{level.words} words</span>{level.status === "active" ? <Button variant="outline" asChild><Link href="#roadmap">Open A1 roadmap</Link></Button> : <LockKeyhole />}</article>)}
        </div>
      </section>

      <section className="a1-roadmap" id="roadmap" aria-labelledby="a1-roadmap-title">
        <div className="course-section-heading"><span>A1 · 24 chapters</span><h2 id="a1-roadmap-title">Build a complete foundation.</h2><p>Four modules move from first sentences to connected everyday German. Each chapter will use the same six-skill mastery standard.</p></div>
        <div className="a1-module-list">
          {GRAMMAR_MODULES.filter((module) => module.level === "A1").map((module) => <section key={module.id} className="a1-module"><header><span>Module {module.number}</span><h3>{module.title}</h3><p>{module.description}</p></header><div>{module.lessons.map((lesson) => {
            const available = lesson.id === "a1-1-1";
            const complete = progress.chapters[lesson.id]?.completed;
            const content = <><span>{String(lesson.number).padStart(2, "0")}</span><div><strong>{lesson.title}</strong><small>{lesson.outcome}</small></div>{complete ? <CheckCircle2 /> : available ? <ArrowRight /> : <Circle />}</>;
            return available ? <Link key={lesson.id} href="/course/a1/chapter-1" className="is-available">{content}</Link> : <div key={lesson.id} className="is-planned" aria-label={`${lesson.title}, planned`}>{content}</div>;
          })}</div></section>)}
        </div>
      </section>

      <section className="resource-safety-net">
        <div><span>Your existing library remains available</span><h2>Explore freely without leaving the course behind.</h2><p>Stories, vocabulary cards, and the complete grammar reference remain useful for extra exposure and revision.</p></div>
        <div><Button variant="outline" asChild><Link href="/stories">Story library</Link></Button><Button variant="outline" asChild><Link href="/vocabulary">Vocabulary library</Link></Button><Button variant="outline" asChild><Link href="/grammar">Grammar reference</Link></Button></div>
      </section>

      <footer><Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through complete courses</small></span></Link><p>A mastery-based A1–C1 German course built chapter by chapter.</p><div><Link href="/stories">Stories</Link><Link href="/vocabulary">Vocabulary</Link><Link href="/grammar">Grammar</Link></div></footer>
    </main>
  );
}
