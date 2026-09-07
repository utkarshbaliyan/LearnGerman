"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  Languages,
  Lightbulb,
  Mic,
  PenLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { GrammarPracticePanel } from "@/app/components/grammar-practice-panel";
import dynamic from "next/dynamic";
const WritingRepairWorkspace = dynamic(() => import("@/app/components/writing-repair-workspace").then((module) => module.WritingRepairWorkspace), { loading: () => <p>Loading writing practice…</p> });
import { writingMission } from "@/app/lib/writing-mission";
const SpeakingWorkspace = dynamic(() => import("@/app/components/speaking-workspace").then((module) => module.SpeakingWorkspace), { loading: () => <p>Loading speaking practice…</p> });
import { SiteHeader } from "@/app/components/site-header";
import { NarratedTranslatedStory } from "@/app/components/translated-story-text";
import type { CourseChapterContent } from "@/app/course/course-data";
import type { ChapterQuestion, ChapterVocabulary } from "@/app/course/a1/chapter-one";
import type { GrammarLevel } from "@/app/grammar/course";
import {

  EMPTY_CHAPTER_PROGRESS,
  type CourseSkill,
  useCourseProgress,
} from "@/app/hooks/use-course-progress";
import { useStoryProgress } from "@/app/hooks/use-story-progress";
import { useVocabularyProgress } from "@/app/hooks/use-vocabulary-progress";
import { syncGrammarLessonToLibrary } from "@/app/lib/progress-sync";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const CHECKED_SKILLS: CourseSkill[] = ["reading", "listening", "vocabulary", "grammar"];
const SKILLS: Array<{ id: CourseSkill; label: string; icon: typeof BookOpen }> = [
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "vocabulary", label: "Vocabulary", icon: Languages },
  { id: "grammar", label: "Grammar", icon: GraduationCap },
  { id: "speaking", label: "Speaking", icon: Mic },
  { id: "writing", label: "Writing", icon: PenLine },
];

function QuizBlock({ questions, eyebrow, title, savedScore, onScore }: {
  questions: ChapterQuestion[];
  eyebrow: string;
  title: string;
  savedScore: number;
  onScore: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = Math.round((questions.filter((question) => answers[question.id] === question.answer).length / questions.length) * 100);

  function submit() {
    setSubmitted(true);
    onScore(score);
  }

  return (
    <div className="chapter-quiz">
      <div className="chapter-quiz-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div>{savedScore > 0 && <Badge variant="outline">Best {savedScore}%</Badge>}</div>
      <div className="chapter-question-list">
        {questions.map((question, index) => <article key={question.id} className={submitted ? (answers[question.id] === question.answer ? "is-correct" : "is-wrong") : ""}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h4>{question.prompt}</h4>
          <div>{question.options.map((option) => <button key={option} type="button" disabled={submitted} aria-pressed={answers[question.id] === option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}>{option}</button>)}</div>
          {submitted && <p><b>{answers[question.id] === question.answer ? "Correct." : `Answer: ${question.answer}.`}</b> {question.explanation}</p>}
        </article>)}
      </div>
      {submitted
        ? <div className="chapter-quiz-result"><strong>{score}%</strong><span>{score >= 80 ? "Strong result. This skill is ready." : "Review the feedback, then try again."}</span><Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); }}><RotateCcw /> Try again</Button></div>
        : <Button onClick={submit} disabled={Object.keys(answers).length < questions.length}>Check all answers <ArrowRight /></Button>}
    </div>
  );
}

function courseChapterHref(level: GrammarLevel, number: number) {
  return `/course/${level.toLowerCase()}/chapter-${number}`;
}

export function IntegratedCourseChapter({ content }: { content: CourseChapterContent }) {
  const { level, number } = content;
  const { progress, hydrated, updateChapter } = useCourseProgress();
  const { setStoryCompleted } = useStoryProgress();
  const { hydrated: vocabularyHydrated, importLearned, isLearned, setLearned } = useVocabularyProgress();
  const chapter = progress.chapters[content.id] ?? EMPTY_CHAPTER_PROGRESS;
  const grammarGroups = useMemo(() => [...new Set(content.grammar.exercises.map((exercise) => exercise.group ?? "Core practice"))], [content.grammar.exercises]);
  const [showAllWords, setShowAllWords] = useState(false);
  const knownWordIds = useMemo(() => new Set(content.vocabulary
    .filter(isLearned)
    .map((word) => word.id)), [content.vocabulary, isLearned]);
  const vocabularyScore = Math.round((knownWordIds.size / content.vocabulary.length) * 100);

  const chapterPercent = useMemo(() => {
    const skillTotal = CHECKED_SKILLS.reduce((sum, skill) => sum + (chapter.skillScores[skill] ?? 0), 0);
    return Math.round((skillTotal + (chapter.checkpointScore ?? 0)) / (CHECKED_SKILLS.length + 1));
  }, [chapter]);
  const readyForMastery = CHECKED_SKILLS.every((skill) => (chapter.skillScores[skill] ?? 0) >= 70)
    && (chapter.checkpointScore ?? 0) >= 80
    && grammarGroups.every((group) => chapter.grammarSets[group] !== undefined);
  const previousHref = number > 1 ? courseChapterHref(level, number - 1) : level === "A1" ? "/" : courseChapterHref(level === "A2" ? "A1" : "A2", 24);
  const nextHref = number < 24 ? courseChapterHref(level, number + 1) : level === "B1" ? "/" : courseChapterHref(level === "A1" ? "A2" : "B1", 1);

  useEffect(() => {
    if (!vocabularyHydrated || !chapter.knownWords.length) return;
    importLearned(content.vocabulary.filter((word) => chapter.knownWords.includes(word.id)));
    updateChapter(content.id, (current) => ({ ...current, knownWords: [] }));
  }, [chapter.knownWords, content.id, content.vocabulary, importLearned, updateChapter, vocabularyHydrated]);

  useEffect(() => {
    if (!hydrated || !vocabularyHydrated || vocabularyScore <= (chapter.skillScores.vocabulary ?? 0)) return;
    updateChapter(content.id, (current) => ({
      ...current,
      skillScores: { ...current.skillScores, vocabulary: vocabularyScore },
    }));
  }, [chapter.skillScores.vocabulary, content.id, hydrated, updateChapter, vocabularyHydrated, vocabularyScore]);

  function toggleKnownWord(word: ChapterVocabulary) {
    const wordId = word.id;
    const willBeKnown = !knownWordIds.has(wordId);
    setLearned(word, willBeKnown);
    updateChapter(content.id, (current) => {
      const nextKnownCount = Math.max(0, knownWordIds.size + (willBeKnown ? 1 : -1));
      const score = Math.round((nextKnownCount / content.vocabulary.length) * 100);
      return { ...current, knownWords: [], skillScores: { ...current.skillScores, vocabulary: Math.max(current.skillScores.vocabulary ?? 0, score) } };
    });
  }

  function finishGrammarSet(setName: string, score: number) {
    const sets = { ...chapter.grammarSets, [setName]: Math.max(chapter.grammarSets[setName] ?? 0, score) };
    const average = Math.round(Object.values(sets).reduce((sum, value) => sum + value, 0) / grammarGroups.length);
    updateChapter(content.id, (current) => ({ ...current, grammarSets: sets, skillScores: { ...current.skillScores, grammar: Math.max(current.skillScores.grammar ?? 0, average) } }));
    queueCloudProgress("grammar", syncGrammarLessonToLibrary(localStorage, content.id, sets, average, grammarGroups.every((group) => sets[group] !== undefined)));
  }

  function saveStoryScore(score: number) {
    updateChapter(content.id, (current) => ({
      ...current,
      skillScores: {
        ...current.skillScores,
        listening: Math.max(current.skillScores.listening ?? 0, score),
        reading: Math.max(current.skillScores.reading ?? 0, score),
      },
    }));
  }

  function completeChapter() {
    if (!readyForMastery) return;
    updateChapter(content.id, (current) => ({ ...current, completed: true }));
    setStoryCompleted(content.story.id, true);
  }

  return (
    <main className="site-shell chapter-page" id="top">
      <SiteHeader active="course" />

      <header className="chapter-topbar">
        <Link href="/"><ArrowLeft /> {level} course</Link>
        <div><span>Chapter {String(number).padStart(2, "0")} of 24</span><Progress value={chapterPercent} aria-label={`Chapter ${number} ${chapterPercent}% complete`} /><strong>{chapterPercent}%</strong></div>
      </header>

      <section className="chapter-hero">
        <div>
          <div className="chapter-kicker"><Badge>{level}</Badge><span>Module {content.module.number} · {content.module.title}</span></div>
          <h1 lang="de">{content.heroTitle}</h1>
          <p>{content.heroDescription}</p>
          <div className="chapter-facts"><span><BookOpen /> 1 narrated story</span><span><Languages /> {content.vocabulary.length} core words</span><span><GraduationCap /> {content.grammar.exercises.length} grammar exercises</span><span><Mic /> Speaking mission</span></div>
        </div>
        <aside className="chapter-skill-card">
          <span>Chapter progress</span>
          <div>{SKILLS.map(({ id, label, icon: Icon }) => { const score = chapter.skillScores[id] ?? 0; return <a key={id} href={id === "listening" || id === "reading" ? "#story" : `#${id}`}><Icon /><span>{label}</span>{id === "writing" || id === "speaking" ? <b>Practice</b> : <><Progress value={score} /><b>{score}%</b></>}</a>; })}</div>
          <p>Every skill must reach at least 70%. The final checkpoint requires 80%.</p>
        </aside>
      </section>

      <nav className="chapter-section-nav" aria-label="Chapter sections">
        <a href="#story"><Headphones /><span>Story</span>{(chapter.skillScores.listening ?? 0) >= 70 && (chapter.skillScores.reading ?? 0) >= 70 ? <CheckCircle2 /> : <Circle />}</a>
        <a href="#vocabulary"><Languages /><span>Vocabulary</span>{(chapter.skillScores.vocabulary ?? 0) >= 70 ? <CheckCircle2 /> : <Circle />}</a>
        <a href="#grammar"><GraduationCap /><span>Grammar</span>{(chapter.skillScores.grammar ?? 0) >= 70 ? <CheckCircle2 /> : <Circle />}</a>
        <a href="#writing"><PenLine /><span>Writing</span>{(chapter.skillScores.writing ?? 0) >= 70 ? <CheckCircle2 /> : <Circle />}</a>
        <a href="#speaking"><Mic /><span>Speaking</span>{(chapter.skillScores.speaking ?? 0) >= 70 ? <CheckCircle2 /> : <Circle />}</a>
        <a href="#checkpoint"><ClipboardCheck /><span>Checkpoint</span>{(chapter.checkpointScore ?? 0) >= 80 ? <CheckCircle2 /> : <Circle />}</a>
      </nav>

      <section className="chapter-outcomes">
        <div><span>Before you begin</span><h2>What you will be able to do.</h2></div>
        <div>{content.outcomes.map((outcome) => <p key={outcome}><Check />{outcome}</p>)}</div>
      </section>

      <section className="chapter-learning-section chapter-story-lesson" id="story">
        <div className="chapter-section-copy"><span>01 · Story</span><h2>Listen, read, and understand.</h2><p>Play the story once with the text covered and listen for the situation. Then listen again while reading. Use a word translation only after trying to infer its meaning from context.</p></div>
        <article className="chapter-story chapter-story-interactive" lang="de">
          <div className="chapter-story-meta"><Badge>Story {String(content.story.number).padStart(3, "0")}</Badge><span>{content.story.text.split(/\s+/).length} words</span></div>
          <h3>{content.story.title}</h3>
          <NarratedTranslatedStory curriculum={content.curriculum} story={content.story} playbackRate={level === "A1" ? 0.92 : level === "A2" ? 0.96 : 1} speedLabel={level === "A1" ? "learning speed" : "natural speed"} />
        </article>
        <QuizBlock questions={[...content.listening, ...content.reading]} eyebrow="Story check" title="What did you understand?" savedScore={Math.min(chapter.skillScores.listening ?? 0, chapter.skillScores.reading ?? 0)} onScore={saveStoryScore} />
      </section>

      <section className="chapter-learning-section chapter-vocabulary" id="vocabulary">
        <div className="chapter-section-copy"><span>02 · Vocabulary · synced</span><h2>Recall language from the story.</h2><p>Say the meaning before revealing it mentally, then read the complete story sentence. Mark a word only when you can recall it without help. Matching cards update automatically on the Vocabulary page.</p><div className="vocabulary-mastery-line"><strong>{knownWordIds.size}/{content.vocabulary.length} recalled</strong><Progress value={vocabularyScore} /></div></div>
        <div className="chapter-vocab-grid">{content.vocabulary.slice(0, showAllWords ? undefined : 12).map((word) => { const known = knownWordIds.has(word.id); return <article key={word.id} className={known ? "is-known" : ""}><span>{word.english}</span><h3 lang="de">{word.german}</h3>{word.note && <small>{word.note}</small>}<p lang="de">{word.example}</p><button type="button" aria-pressed={known} onClick={() => toggleKnownWord(word)}><Check /> {known ? "I can recall this" : "Mark after recalling"}</button></article>; })}</div>
        {!showAllWords && content.vocabulary.length > 12 && <Button variant="outline" className="show-chapter-words" onClick={() => setShowAllWords(true)}>Show all {content.vocabulary.length} chapter words</Button>}
      </section>

      <section className="chapter-learning-section chapter-grammar" id="grammar">
        <div className="chapter-section-copy"><span>03 · Grammar · synced</span><h2>{content.lesson.title}.</h2><p>{content.grammar.lead}</p></div>
        <div className="chapter-grammar-pattern"><span>Core pattern</span><strong lang="de">{content.grammar.pattern}</strong></div>
        <div className="chapter-explanation">{content.grammar.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <details className="tutor-optional"><summary>More examples & reference tables</summary>
        {content.grammar.sections?.map((section) => <article className="chapter-grammar-detail" key={section.title}><h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.examples?.map((example) => <p key={example.german}><b lang="de">{example.german}</b> — {example.english}</p>)}</article>)}
        <div className="chapter-tables">{content.grammar.tables?.map((table) => <article key={table.title}><h3>{table.title}</h3>{table.caption && <p>{table.caption}</p>}<div><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`} lang={index > 0 ? "de" : undefined}>{cell}</td>)}</tr>)}</tbody></table></div></article>)}</div>
        <div className="chapter-examples"><div><span>See it in use</span><h3>Useful examples</h3></div><div>{content.grammar.examples.map((example) => <article key={example.german}><strong lang="de">{example.german}</strong><span>{example.english}</span>{example.note && <small>{example.note}</small>}</article>)}</div></div>
        <div className="chapter-memory-tip"><Lightbulb /><div><span>Memory strategy</span><p>{content.grammar.memoryTip}</p></div></div>
        </details>
        <GrammarPracticePanel exercises={content.grammar.exercises} completedSets={chapter.grammarSets} onFinish={finishGrammarSet} />
      </section>

      <section className="chapter-learning-section chapter-writing" id="writing">
        <div className="chapter-section-copy"><span>04 · Writing</span><h2>{content.writingTitle}</h2></div>
        <WritingRepairWorkspace key={content.id} taskId={content.id} prompt={writingMission(content)} suggestedWords={content.writingMinimum} />
      </section>

      <section className="chapter-learning-section chapter-speaking" id="speaking">
        <div className="chapter-section-copy"><span>05 · Speaking</span><h2>Try it aloud.</h2></div>
        <SpeakingWorkspace key={content.id} taskId={content.id} />
      </section>

      <section className="chapter-learning-section chapter-checkpoint" id="checkpoint">
        <div className="chapter-section-copy"><span>06 · Integrated checkpoint</span><h2>Prove that the chapter works together.</h2><p>This final check mixes the story, contextual vocabulary, grammar patterns, correction, and communicative outcome. You need at least 80%.</p></div>
        <QuizBlock questions={content.checkpoint} eyebrow="Chapter checkpoint" title="Ready to use what you learned?" savedScore={chapter.checkpointScore ?? 0} onScore={(score) => updateChapter(content.id, (current) => ({ ...current, checkpointScore: Math.max(current.checkpointScore ?? 0, score) }))} />
      </section>

      <section className={`chapter-finish${chapter.completed ? " is-complete" : ""}`}>
        <div>{chapter.completed ? <CheckCircle2 /> : <Sparkles />}</div>
        <span>{chapter.completed ? "Chapter completed" : "Finish this chapter"}</span>
        <h2>{chapter.completed ? content.completionOutcome : readyForMastery ? "Ready for the next chapter." : "Finish the practice checks."}</h2>
        <p>{chapter.completed ? `${level} is now one chapter closer to completion. Review remains available at any time.` : `Aim for 70% in the practice checks and 80% in the checkpoint. Speaking and writing are for practice, without a score requirement.`}</p>
        <div className="mastery-requirements">{SKILLS.filter(({ id }) => CHECKED_SKILLS.includes(id)).map(({ id, label }) => <span key={id} className={(chapter.skillScores[id] ?? 0) >= 70 ? "is-ready" : ""}>{(chapter.skillScores[id] ?? 0) >= 70 ? <Check /> : <Circle />}{label} {chapter.skillScores[id] ?? 0}%</span>)}<span className={(chapter.checkpointScore ?? 0) >= 80 ? "is-ready" : ""}>{(chapter.checkpointScore ?? 0) >= 80 ? <Check /> : <Circle />}Checkpoint {chapter.checkpointScore ?? 0}%</span></div>
        <div className="chapter-finish-actions"><Button variant="outline" asChild><Link href={previousHref}><ArrowLeft /> Previous chapter</Link></Button>{chapter.completed ? <Button asChild><Link href={nextHref}>Continue to next chapter <ArrowRight /></Link></Button> : <Button size="lg" disabled={!readyForMastery || !hydrated} onClick={completeChapter}>Complete Chapter {number} <ArrowRight /></Button>}</div>
      </section>

      <footer><Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through complete courses</small></span></Link><p>{level} Chapter {number} integrates all six language skills and a chapter checkpoint.</p><div><a href="#top">Back to top</a><Link href="/">Course roadmap</Link></div></footer>
    </main>
  );
}
