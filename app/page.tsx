"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Headphones, Play, Sparkles } from "lucide-react";

import { SiteHeader } from "@/app/components/site-header";
import { StoryReader } from "@/app/components/story-reader";
import { getUnitCopy, LEVEL_LABELS } from "@/app/course-copy";
import { getCurriculum, LEVELS, type CefrLevel, type Story } from "@/app/curriculum";
import { useStoryProgress } from "@/app/hooks/use-story-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

const DEFAULT_LEVEL: CefrLevel = "A1";
const INITIAL_STORY_LIMIT = 30;

const COURSE_COPY: Record<CefrLevel, string> = {
  A1: "Build a strong foundation through 100 everyday stories. Read, listen, and meet essential words repeatedly in meaningful situations.",
  A2: "Move through 160 connected everyday stories. Link ideas, explain decisions, and handle daily life with growing independence.",
  B1: "Develop confident independent German through 180 stories about work, society, media, culture, and real B1 situations.",
  B2: "",
};

export default function Home() {
  const [activeLevel, setActiveLevel] = useState<CefrLevel>(DEFAULT_LEVEL);
  const [activeUnit, setActiveUnit] = useState("all");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyLimit, setStoryLimit] = useState(INITIAL_STORY_LIMIT);
  const { completedIds, hydrated, setStoryCompleted, toggleStoryCompleted } = useStoryProgress();

  const curriculum = getCurriculum(activeLevel) ?? getCurriculum(DEFAULT_LEVEL)!;
  const selectedUnit = activeUnit === "all" ? undefined : curriculum.units.find((unit) => unit.id === Number(activeUnit));
  const selectedUnitCopy = selectedUnit ? getUnitCopy(curriculum.id, selectedUnit) : undefined;
  const allVisibleStories = selectedUnit?.stories ?? curriculum.stories;
  const visibleStories = allVisibleStories.slice(0, storyLimit);
  const hasAudio = curriculum.stories.every((story) => story.audioReady !== false);
  const availableCurricula = useMemo(() => LEVELS.flatMap((level) => {
    const item = getCurriculum(level.id);
    return item ? [item] : [];
  }), []);
  const totalStories = availableCurricula.reduce((sum, item) => sum + item.stories.length, 0);
  const completedTotal = availableCurricula.reduce((sum, item) => sum + item.stories.filter((story) => completedIds.has(story.id)).length, 0);
  const overallPercent = totalStories ? Math.round((completedTotal / totalStories) * 100) : 0;
  const completedInLevel = curriculum.stories.filter((story) => completedIds.has(story.id)).length;
  const levelPercent = Math.round((completedInLevel / curriculum.stories.length) * 100);
  const nextStory = curriculum.stories.find((story) => !completedIds.has(story.id)) ?? curriculum.stories[0];

  function selectLevel(level: CefrLevel) {
    if (!getCurriculum(level)) return;
    setActiveLevel(level);
    setActiveUnit("all");
    setStoryLimit(INITIAL_STORY_LIMIT);
    setSelectedStory(null);
  }

  function selectUnit(unitId: number) {
    setActiveUnit(String(unitId));
    setStoryLimit(INITIAL_STORY_LIMIT);
    document.getElementById("stories")?.scrollIntoView({ behavior: "smooth" });
  }

  function changeUnit(value: string) {
    setActiveUnit(value);
    setStoryLimit(INITIAL_STORY_LIMIT);
  }

  return (
    <TooltipProvider delayDuration={70}>
      <main className="site-shell">
        <SiteHeader active="stories" />

        <section className="hero" id="start">
          <div className="hero-copy">
            <div className="level-switcher" aria-label="Choose a course level">
              {LEVELS.map((level) => (
                <button key={level.id} type="button" className={level.id === activeLevel ? "is-active" : ""} disabled={!level.available} onClick={() => selectLevel(level.id)}>
                  <b>{level.id}</b><span>{LEVEL_LABELS[level.id]}</span>{!level.available && <small>Coming soon</small>}
                </button>
              ))}
            </div>
            <Badge className="eyebrow"><Sparkles /> German · Level {curriculum.id}</Badge>
            <h1>Learn German<br />one <em>story</em> at a time.</h1>
            <p>{COURSE_COPY[curriculum.id]}</p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => setSelectedStory(nextStory)}>
                {hasAudio ? <Play /> : <BookOpen />}
                {completedInLevel ? `Continue with Story ${String(nextStory.number).padStart(3, "0")}` : "Start Story 001"}
              </Button>
              <a href="#stories">Browse stories <ArrowRight /></a>
            </div>
          </div>

          <aside className={`course-progress-panel${hydrated ? " is-ready" : ""}`} aria-label="Overall course progress">
            <div className="progress-panel-heading">
              <div><span>Your course</span><h2>Overall progress</h2></div>
              <div className="progress-ring" style={{ "--course-progress": `${overallPercent * 3.6}deg` } as CSSProperties}><strong>{overallPercent}%</strong></div>
            </div>
            <p>{completedTotal} of {totalStories} stories completed across A1–B1.</p>
            <div className="level-progress-list">
              {availableCurricula.map((item) => {
                const done = item.stories.filter((story) => completedIds.has(story.id)).length;
                const percent = Math.round((done / item.stories.length) * 100);
                return (
                  <button key={item.id} type="button" onClick={() => selectLevel(item.id)} className={item.id === activeLevel ? "is-active" : ""}>
                    <span><b>{item.id}</b><small>{LEVEL_LABELS[item.id]}</small></span>
                    <Progress value={percent} aria-label={`${item.id}: ${percent}% complete`} />
                    <strong>{done}/{item.stories.length}</strong>
                  </button>
                );
              })}
            </div>
            <button type="button" className="next-story-card" onClick={() => setSelectedStory(nextStory)}>
              <span>Up next · {curriculum.id} · {String(nextStory.number).padStart(3, "0")}</span>
              <strong lang="de">{nextStory.title}</strong><ArrowRight />
            </button>
          </aside>
        </section>

        <section className="curriculum" id="course">
          <div className="section-intro">
            <span>{curriculum.units.length} units · {curriculum.stories.length} stories</span>
            <h2>A clear path through every level.</h2>
            <p>Each unit combines stories, audio, grammar, vocabulary, and repeated exposure. Your completed stories are saved on this device.</p>
          </div>

          <div className="current-level-progress">
            <div><span>{curriculum.id} progress</span><strong>{completedInLevel} / {curriculum.stories.length} stories</strong></div>
            <Progress value={levelPercent} aria-label={`${curriculum.id}: ${levelPercent}% complete`} /><b>{levelPercent}%</b>
          </div>

          <div className="unit-track">
            {curriculum.units.map((unit) => {
              const copy = getUnitCopy(curriculum.id, unit);
              const completedInUnit = unit.stories.filter((story) => completedIds.has(story.id)).length;
              return (
                <button key={unit.id} type="button" onClick={() => selectUnit(unit.id)} style={{ "--unit-color": unit.color } as CSSProperties}>
                  <span>{String(unit.id).padStart(2, "0")}</span><strong>{copy.shortTitle}</strong><small>{completedInUnit}/{unit.stories.length} complete</small>
                </button>
              );
            })}
          </div>

          <div className="coverage-strip">
            <div><b>Reading</b><span>{curriculum.stats.totalWords.toLocaleString("en-US")} words in this level</span></div>
            <div><b>Listening</b><span>Built-in narration at adjustable speeds</span></div>
            <div><b>Expression</b><span>Speaking and writing prompts</span></div>
            <div><b>Vocabulary</b><span>Words repeated in meaningful context</span></div>
          </div>
        </section>

        <section className="library" id="stories">
          <div className="library-heading">
            <div><span>Story library · {curriculum.id}</span><h2>{selectedUnitCopy ? `Unit ${selectedUnit!.id}: ${selectedUnitCopy.title}` : `All ${curriculum.stories.length} stories`}</h2></div>
            <p>{selectedUnitCopy?.description ?? "Choose a unit or continue with your next unfinished story. Each story includes German text, built-in audio, word help, and practice prompts."}</p>
          </div>

          <Tabs value={activeUnit} onValueChange={changeUnit} className="unit-tabs">
            <TabsList variant="line" className="unit-tabs-list">
              <TabsTrigger value="all">All</TabsTrigger>
              {curriculum.units.map((unit) => <TabsTrigger key={unit.id} value={String(unit.id)}>{String(unit.id).padStart(2, "0")}</TabsTrigger>)}
            </TabsList>
          </Tabs>

          <div className="story-grid">
            {visibleStories.map((story) => {
              const completed = completedIds.has(story.id);
              const unit = curriculum.units.find((item) => item.id === story.unitId)!;
              const unitCopy = getUnitCopy(curriculum.id, unit);
              return (
                <button key={story.id} type="button" className={`story-card${completed ? " is-completed" : ""}`} onClick={() => setSelectedStory(story)} style={{ "--story-color": story.color } as CSSProperties}>
                  <div className="card-top"><span>{String(story.number).padStart(3, "0")}</span><Badge variant={completed ? "default" : "outline"}>{completed ? <><CheckCircle2 /> Completed</> : <><Circle /> Not completed</>}</Badge></div>
                  <div className="card-rule" /><small>Unit {story.unitId} · {unitCopy.shortTitle}</small>
                  <h3 lang="de">{story.title}</h3><p lang="de">{story.text.split(" ").slice(0, 14).join(" ")}…</p>
                  <div className="card-meta"><span>{story.audioReady === false ? <BookOpen /> : <Headphones />}{story.audioReady === false ? " Read" : " Audio"}</span><span><BookOpen /> {story.text.split(/\s+/).length} words</span><ArrowRight /></div>
                </button>
              );
            })}
          </div>

          {visibleStories.length < allVisibleStories.length && <Button className="show-more-stories" variant="outline" onClick={() => setStoryLimit((current) => current + INITIAL_STORY_LIMIT)}>Show more stories</Button>}
        </section>

        <footer>
          <a href="#start" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through stories</small></span></a>
          <p>The course follows CEFR learning goals and draws on Goethe-Institut vocabulary and grammar coverage.</p>
          <div><a href="https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions" target="_blank" rel="noreferrer">CEFR framework</a><a href="https://www.goethe.de/en/spr/prf/ueb.html" target="_blank" rel="noreferrer">Goethe practice</a></div>
        </footer>

        <Dialog open={Boolean(selectedStory)} onOpenChange={(open) => { if (!open) setSelectedStory(null); }}>
          {selectedStory && <DialogContent className="reader-dialog" showCloseButton><StoryReader curriculum={curriculum} story={selectedStory} completed={completedIds.has(selectedStory.id)} onComplete={(completed) => setStoryCompleted(selectedStory.id, completed)} onStoryChange={setSelectedStory} onToggleComplete={() => toggleStoryCompleted(selectedStory.id)} /></DialogContent>}
        </Dialog>
      </main>
    </TooltipProvider>
  );
}
