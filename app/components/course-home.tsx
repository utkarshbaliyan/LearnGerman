"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
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
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { SiteHeader } from "@/app/components/site-header";
import { getCurriculum, LEVELS as CURRICULUM_LEVELS } from "@/app/curriculum";
import type { GrammarLesson, GrammarLevel, GrammarModule } from "@/app/grammar/course";
import { COURSE_SKILLS, useCourseProgress } from "@/app/hooks/use-course-progress";
import { useStoryProgress } from "@/app/hooks/use-story-progress";
import { useVocabularyProgress } from "@/app/hooks/use-vocabulary-progress";
import { readGrammarProgress } from "@/app/lib/progress-sync";
import { ALL_VOCABULARY } from "@/app/vocabulary/data";
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
  { id: "A1", title: "Foundation", chapters: 24, words: "1,000", status: "available" },
  { id: "A2", title: "Everyday independence", chapters: 24, words: "2,200 cumulative", status: "available" },
  { id: "B1", title: "Independent German", chapters: 24, words: "4,000 cumulative", status: "available" },
  { id: "B2", title: "Complex communication", chapters: 30, words: "6,000 cumulative", status: "planned" },
  { id: "C1", title: "Advanced command", chapters: 36, words: "8,500+ cumulative", status: "planned" },
] as const;

function courseChapterHref(level: GrammarLevel, number: number) {
  return `/course/${level.toLowerCase()}/chapter-${number}`;
}

export function CourseHome({
  courseLevels,
  grammarModules,
  allGrammarLessons,
}: {
  courseLevels: GrammarLevel[];
  grammarModules: GrammarModule[];
  allGrammarLessons: GrammarLesson[];
}) {
  const { progress, hydrated } = useCourseProgress();
  const { completedIds, hydrated: storiesHydrated } = useStoryProgress();
  const { isLearned, hydrated: vocabularyHydrated } = useVocabularyProgress(ALL_VOCABULARY);
  const [completedGrammarIds, setCompletedGrammarIds] = useState<string[]>([]);
  const publishedLessons = allGrammarLessons.filter((lesson) => courseLevels.some((level) => lesson.id.startsWith(`${level.toLowerCase()}-`)));
  const completedChapters = publishedLessons.filter((lesson) => progress.chapters[lesson.id]?.completed).length;
  const coursePercent = Math.round((completedChapters / publishedLessons.length) * 100);
  const availableStories = useMemo(() => CURRICULUM_LEVELS.flatMap((level) => getCurriculum(level.id)?.stories ?? []), []);
  const completedStories = availableStories.filter((story) => completedIds.has(story.id)).length;
  const completedGrammar = publishedLessons.filter((lesson) => completedGrammarIds.includes(lesson.id)).length;
  const learnedVocabulary = ALL_VOCABULARY.filter(isLearned).length;
  const nextLesson = publishedLessons.find((lesson) => !progress.chapters[lesson.id]?.completed) ?? publishedLessons[0];
  const nextLevel = nextLesson.id.slice(0, 2).toUpperCase() as GrammarLevel;
  const activeChapter = progress.chapters[nextLesson.id];

  useEffect(() => {
    const refresh = () => setCompletedGrammarIds(readGrammarProgress(localStorage).completed);
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const learningProgress = [
    { label: "Course", value: completedChapters, total: publishedLessons.length, suffix: "chapters", ready: hydrated },
    { label: "Stories", value: completedStories, total: availableStories.length, suffix: "stories", ready: storiesHydrated },
    { label: "Grammar", value: completedGrammar, total: publishedLessons.length, suffix: "lessons", ready: Boolean(completedGrammarIds.length) || hydrated },
    { label: "Vocabulary", value: learnedVocabulary, total: ALL_VOCABULARY.length, suffix: "words", ready: vocabularyHydrated },
  ];

  return (
    <main className="site-shell course-home" id="top">
      <SiteHeader active="course" />

      <section className="course-home-hero">
        <div>
          <Badge className="course-home-eyebrow"><Sparkles /> Complete German · A1–C1</Badge>
          <h1>Learn every skill.<br /><em>Master every level.</em></h1>
          <p>One structured course where every chapter combines listening, reading, vocabulary, grammar, speaking, writing, and real communication.</p>
          <div className="course-home-actions"><Button size="lg" asChild><Link href={courseChapterHref(nextLevel, nextLesson.number)}>{completedChapters ? `Continue ${nextLevel} Chapter ${nextLesson.number}` : "Begin A1 Chapter 1"}<ArrowRight /></Link></Button><a href="#roadmap">View all 72 chapters</a></div>
        </div>

        <aside className={`course-mastery-card${hydrated ? " is-ready" : ""}`}>
          <div className="course-mastery-heading"><div><span>Your published course</span><h2>{coursePercent}% complete</h2></div><div className="course-master-ring" style={{ "--mastery": `${coursePercent * 3.6}deg` } as CSSProperties}><strong>{completedChapters}/72</strong></div></div>
          <Progress value={coursePercent} aria-label={`Published course ${coursePercent}% complete`} />
          <p>A chapter counts only after reading, listening, vocabulary, grammar, speaking, and writing requirements are met.</p>
          <div className="course-skill-preview">
            {COURSE_SKILLS.map((skill) => {
              const Icon = SKILL_META[skill].icon;
              const score = activeChapter?.skillScores[skill] ?? 0;
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

      <section className="learning-progress-overview" aria-labelledby="learning-progress-title">
        <div className="course-section-heading"><span>Your learning data</span><h2 id="learning-progress-title">Progress across every part of LeseLaut.</h2><p>Each graph uses its own completed items, so a story, grammar lesson, vocabulary card, and full course chapter are counted separately and accurately.</p></div>
        <div className="learning-progress-grid">
          {learningProgress.map((item) => {
            const percent = item.total ? Math.round((item.value / item.total) * 100) : 0;
            return <article key={item.label} className={item.ready ? "is-ready" : ""}>
              <div><span>{item.label}</span><strong>{percent}%</strong></div>
              <Progress value={percent} aria-label={`${item.label}: ${percent}% complete`} />
              <p>{item.value.toLocaleString("en")} of {item.total.toLocaleString("en")} {item.suffix} completed</p>
            </article>;
          })}
        </div>
      </section>

      <section className="level-journey" aria-labelledby="level-journey-title">
        <div className="course-section-heading"><span>The complete journey</span><h2 id="level-journey-title">From first introductions to advanced German.</h2><p>A1, A2, and B1 now contain 72 complete six-skill chapters. B2 and C1 remain clearly separated until their full curricula meet the same standard.</p></div>
        <div className="level-journey-grid">
          {LEVELS.map((level) => <article key={level.id} className={level.status === "available" ? "is-active" : ""}><div><strong>{level.id}</strong><Badge variant={level.status === "available" ? "default" : "outline"}>{level.status === "available" ? "Available" : "Planned"}</Badge></div><h3>{level.title}</h3><p>{level.chapters} integrated chapters</p><span>{level.words} words</span>{level.status === "available" ? <Button variant="outline" asChild><Link href={`#roadmap-${level.id.toLowerCase()}`}>Open {level.id} roadmap</Link></Button> : <LockKeyhole />}</article>)}
        </div>
      </section>

      <section className="a1-roadmap" id="roadmap" aria-labelledby="course-roadmap-title">
        <div className="course-section-heading"><span>A1–B1 · 72 chapters</span><h2 id="course-roadmap-title">A complete path through independent German.</h2><p>Each level contains four modules. Every chapter combines story, audio, contextual vocabulary, deep grammar practice, speaking, writing, and a mastery checkpoint.</p></div>
        {courseLevels.map((level) => {
          const lessons = allGrammarLessons.filter((lesson) => lesson.id.startsWith(`${level.toLowerCase()}-`));
          const done = lessons.filter((lesson) => progress.chapters[lesson.id]?.completed).length;
          return <section className="course-level-roadmap" id={`roadmap-${level.toLowerCase()}`} key={level}>
            <header><div><Badge>{level}</Badge><span>{done}/24 chapters mastered</span></div><h2>{level === "A1" ? "Build a complete foundation." : level === "A2" ? "Become independent in everyday life." : "Communicate with confidence and detail."}</h2><Progress value={(done / 24) * 100} aria-label={`${level}: ${done} of 24 chapters mastered`} /></header>
            <div className="a1-module-list">
              {grammarModules.filter((module) => module.level === level).map((module) => <section key={module.id} className="a1-module"><header><span>Module {module.number}</span><h3>{module.title}</h3><p>{module.description}</p></header><div>{module.lessons.map((lesson) => {
                const complete = progress.chapters[lesson.id]?.completed;
                return <Link key={lesson.id} href={courseChapterHref(level, lesson.number)} className="is-available"><span>{String(lesson.number).padStart(2, "0")}</span><div><strong>{lesson.title}</strong><small>{lesson.outcome}</small></div>{complete ? <CheckCircle2 /> : <ArrowRight />}</Link>;
              })}</div></section>)}
            </div>
          </section>;
        })}
      </section>

      <section className="resource-safety-net">
        <div><span>Your existing library remains available</span><h2>Explore freely without leaving the course behind.</h2><p>Stories, vocabulary cards, and the complete grammar reference remain useful for extra exposure and revision.</p></div>
        <div><Button variant="outline" asChild><Link href="/stories">Story library</Link></Button><Button variant="outline" asChild><Link href="/vocabulary">Vocabulary library</Link></Button><Button variant="outline" asChild><Link href="/grammar">Grammar reference</Link></Button></div>
      </section>

      <footer><Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through complete courses</small></span></Link><p>72 mastery-based A1–B1 chapters, with B2 and C1 next.</p><div><Link href="/stories">Stories</Link><Link href="/vocabulary">Vocabulary</Link><Link href="/grammar">Grammar</Link></div></footer>
    </main>
  );
}
