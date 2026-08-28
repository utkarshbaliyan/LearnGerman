"use client";

import { useState, type CSSProperties } from "react";
import { ArrowRight, BookOpen, Headphones, Play, Sparkles } from "lucide-react";

import { StoryReader } from "@/app/components/story-reader";
import {
  getCurriculum,
  LEVELS,
  type CefrLevel,
  type Story,
} from "@/app/curriculum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

const DEFAULT_LEVEL: CefrLevel = "A1";

export default function Home() {
  const [activeLevel, setActiveLevel] = useState<CefrLevel>(DEFAULT_LEVEL);
  const [activeUnit, setActiveUnit] = useState("all");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const curriculum = getCurriculum(activeLevel) ?? getCurriculum(DEFAULT_LEVEL)!;
  const selectedUnit = activeUnit === "all"
    ? undefined
    : curriculum.units.find((unit) => unit.id === Number(activeUnit));
  const visibleStories = selectedUnit?.stories ?? curriculum.stories;
  const isA2 = curriculum.id === "A2";
  const courseCopy = isA2
    ? "Zehn A2-Einstiegsgeschichten führen dich durch Veränderungen, Beziehungen und typische Situationen. Du liest längere Sätze und übst, Gedanken zu verbinden und zu begründen."
    : "Hundert längere Geschichten vermitteln mehr als 800 wichtige Wörter im Zusammenhang. Du liest, hörst und erkennst, wie die Sprache im Alltag fließt.";

  function selectLevel(level: CefrLevel) {
    if (!getCurriculum(level)) return;
    setActiveLevel(level);
    setActiveUnit("all");
    setSelectedStory(null);
  }

  function selectUnit(unitId: number) {
    setActiveUnit(String(unitId));
    document.getElementById("geschichten")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <TooltipProvider delayDuration={70}>
      <main className="site-shell">
        <header className="topbar">
          <a href="#start" className="brand" aria-label="LeseLaut Startseite">
            <span className="brand-mark" aria-hidden="true">ä</span>
            <span><strong>LeseLaut</strong><small>Deutsch durch Geschichten</small></span>
          </a>
          <nav className="topnav" aria-label="Hauptnavigation">
            <a href="#kurs">Kurs</a>
            <a href="#geschichten">Geschichten</a>
            <a href="/vocabulary">Wortschatz</a>
          </nav>
        </header>

        <section className="hero" id="start">
          <div className="hero-copy">
            <div className="level-switcher" aria-label="Sprachniveau">
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className={level.id === activeLevel ? "is-active" : ""}
                  disabled={!level.available}
                  onClick={() => selectLevel(level.id)}
                >
                  <b>{level.id}</b>
                  <span>{level.label}</span>
                  {!level.available && <small>bald</small>}
                </button>
              ))}
            </div>
            <Badge className="eyebrow"><Sparkles /> Deutsch · Niveau {curriculum.id}</Badge>
            <h1>Deutsch beginnt<br />mit einer <em>Geschichte.</em></h1>
            <p>{courseCopy}</p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => setSelectedStory(curriculum.stories[0])}>{isA2 ? <BookOpen /> : <Play />} Geschichte 001 starten</Button>
              <a href="#geschichten">Alle Geschichten <ArrowRight /></a>
            </div>
          </div>

          <div className="story-stack" aria-label="Kursüberblick">
            <div className="stack-card stack-back"><span>{curriculum.stats.totalWords.toLocaleString("de-DE")}</span><small>Wörter zum Lesen{isA2 ? " und Üben" : " und Hören"}</small></div>
            <div className="stack-card stack-middle"><span>{curriculum.stats.uniqueWordForms.toLocaleString("de-DE")}</span><small>Wortformen im Zusammenhang</small></div>
            <div className="stack-card stack-front">
              <div className="mini-cover"><span>001</span><Badge>{curriculum.id}</Badge></div>
              <h2>{curriculum.stories[0].title}</h2>
              <p>{isA2 ? "lesen · verstehen · sprechen · schreiben" : "hören · lesen · verstehen · sprechen"}</p>
              <Button onClick={() => setSelectedStory(curriculum.stories[0])}>Erste Geschichte lesen <ArrowRight /></Button>
            </div>
          </div>
        </section>

        <section className="curriculum" id="kurs">
          <div className="section-intro">
            <span>{curriculum.units.length} Einheiten · {curriculum.stories.length} Geschichten</span>
            <h2>Sprachgefühl entsteht im Zusammenhang.</h2>
            <p>Jede Geschichte verbindet Alltag, Dialog und Grammatik. Bekannte Wörter kehren regelmäßig zurück und werden Schritt für Schritt vertraut.</p>
          </div>

          <div className="unit-track">
            {curriculum.units.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => selectUnit(unit.id)}
                style={{ "--unit-color": unit.color } as CSSProperties}
              >
                <span>{String(unit.id).padStart(2, "0")}</span>
                <strong>{unit.shortTitle}</strong>
                <small>{unit.stories.length} Geschichten</small>
              </button>
            ))}
          </div>

          <div className="coverage-strip">
            <div><b>Leseumfang</b><span>{curriculum.stats.totalWords.toLocaleString("de-DE")} Wörter im Kurs</span></div>
            <div><b>Alltag</b><span>Fragen und typische Situationen</span></div>
            <div><b>Ausdruck</b><span>einfach sprechen und schreiben</span></div>
            <div><b>Wortschatz</b><span>{isA2 ? "neue Ausdrücke im Zusammenhang" : "800+ Wörter im Zusammenhang"}</span></div>
          </div>
        </section>

        <section className="library" id="geschichten">
          <div className="library-heading">
            <div>
              <span>Bibliothek · {curriculum.id}</span>
              <h2>{selectedUnit ? `Einheit ${selectedUnit.id}: ${selectedUnit.title}` : `Alle ${curriculum.stories.length} Geschichten`}</h2>
            </div>
            <p>{selectedUnit?.description ?? `Wähle eine Einheit oder beginne mit Geschichte 001. Eine Geschichte hat durchschnittlich ${curriculum.stats.averageStoryWords} Wörter${isA2 ? ", direkte Worthilfe und Ausspracheübungen." : ", Audio und direkte Worthilfe."}`}</p>
          </div>

          <Tabs value={activeUnit} onValueChange={setActiveUnit} className="unit-tabs">
            <TabsList variant="line" className="unit-tabs-list">
              <TabsTrigger value="all">Alle</TabsTrigger>
              {curriculum.units.map((unit) => (
                <TabsTrigger key={unit.id} value={String(unit.id)}>{String(unit.id).padStart(2, "0")}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="story-grid">
            {visibleStories.map((story) => (
              <button
                key={story.id}
                type="button"
                className="story-card"
                onClick={() => setSelectedStory(story)}
                style={{ "--story-color": story.color } as CSSProperties}
              >
                <div className="card-top"><span>{String(story.number).padStart(3, "0")}</span><Badge variant="outline">{curriculum.id}</Badge></div>
                <div className="card-rule" />
                <small>Einheit {story.unitId} · {story.theme}</small>
                <h3>{story.title}</h3>
                <p>{story.text.split(" ").slice(0, 14).join(" ")}…</p>
                <div className="card-meta">
                  <span>{story.audioReady === false ? <BookOpen /> : <Headphones />}{story.audioReady === false ? " Lesen & Üben" : " Audio"}</span>
                  <span><BookOpen /> {story.text.split(/\s+/).length} Wörter</span>
                  <ArrowRight />
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer>
          <a href="#start" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>Deutsch durch Geschichten</small></span></a>
          <p>Der Kurs orientiert sich am GER des Europarats sowie an Wortschatz und Grammatik des Goethe-Instituts.</p>
          <div>
            <a href="https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions" target="_blank" rel="noreferrer">GER-Referenzrahmen</a>
            <a href="https://www.goethe.de/en/spr/prf/ueb/pa1.html" target="_blank" rel="noreferrer">Goethe A1</a>
          </div>
        </footer>

        <Dialog open={Boolean(selectedStory)} onOpenChange={(open) => { if (!open) setSelectedStory(null); }}>
          {selectedStory && (
            <DialogContent className="reader-dialog" showCloseButton>
              <StoryReader curriculum={curriculum} story={selectedStory} onStoryChange={setSelectedStory} />
            </DialogContent>
          )}
        </Dialog>
      </main>
    </TooltipProvider>
  );
}
