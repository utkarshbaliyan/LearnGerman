"use client";

import {
  ArrowLeft, Bookmark, BookOpen, BriefcaseBusiness, Building2, Check, CheckCircle2,
  ChevronDown, CircleUserRound, Clock3, CloudSun, GraduationCap, HeartPulse, House,
  Laptop2, Leaf, MapPinned, Search, ShoppingBag, Sparkles, TrainFront, Utensils, X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";

import { ALL_VOCABULARY, VOCABULARY_CATEGORIES, type VocabularyCategory, type VocabularyWord } from "@/app/vocabulary/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type ProgressFilter = "all" | "completed" | "review";
type LevelFilter = "all" | "A1" | "A2" | "B1";
const STORAGE_KEY = "leselaut:vocabulary:a1-b1";
const PREVIOUS_STORAGE_KEY = "leselaut:vocabulary:a1-a2";
const LEGACY_STORAGE_KEY = "leselaut:vocabulary:a1";

const CATEGORY_META: Record<VocabularyCategory, { icon: LucideIcon; color: string }> = {
  "Grundlagen & Kommunikation": { icon: Sparkles, color: "#d66a48" },
  "Familie & Menschen": { icon: CircleUserRound, color: "#8d6bd1" },
  "Zuhause & Wohnen": { icon: House, color: "#278071" },
  "Essen & Trinken": { icon: Utensils, color: "#d55369" },
  "Einkaufen & Kleidung": { icon: ShoppingBag, color: "#bd7a22" },
  "Schule & Lernen": { icon: GraduationCap, color: "#5275ad" },
  "Arbeit & Beruf": { icon: BriefcaseBusiness, color: "#706247" },
  "Stadt & Verkehr": { icon: TrainFront, color: "#357b8d" },
  "Reisen & Unterkunft": { icon: MapPinned, color: "#3e739f" },
  "Gesundheit & Körper": { icon: HeartPulse, color: "#bf5562" },
  "Freizeit, Kultur & Sport": { icon: Leaf, color: "#5a8c55" },
  "Natur, Wetter & Umwelt": { icon: CloudSun, color: "#47866f" },
  "Zeit, Zahlen & Mengen": { icon: Clock3, color: "#9b6a43" },
  "Medien & Digitales": { icon: Laptop2, color: "#526e9f" },
  "Dienstleistungen & Behörden": { icon: Building2, color: "#786a91" },
  "Verben": { icon: BookOpen, color: "#c9553d" },
  "Adjektive & Adverbien": { icon: Sparkles, color: "#6d63a8" },
};

function GermanAnswer({ answer }: { answer: string }) {
  const [first, ...rest] = answer.split(" ");
  const hasArticle = /^(der|die|das)(\/die)?$/.test(first);
  return (
    <span className="vocabulary-answer" lang="de">
      {hasArticle && <small>{first}</small>}
      <strong>{hasArticle ? rest.join(" ") : answer}</strong>
    </span>
  );
}

function VocabularyCard({ word, revealed, completed, review, onReveal, onComplete, onReview }: {
  word: VocabularyWord;
  revealed: boolean;
  completed: boolean;
  review: boolean;
  onReveal: () => void;
  onComplete: () => void;
  onReview: () => void;
}) {
  return (
    <article
      className={`vocabulary-card${revealed ? " is-revealed" : ""}${completed ? " is-completed" : ""}${review ? " is-review" : ""}`}
      style={{ "--vocabulary-color": CATEGORY_META[word.category].color } as CSSProperties}
    >
      <button type="button" className="vocabulary-reveal" aria-expanded={revealed} onClick={onReveal}>
        <span className="vocabulary-card-top"><small>{word.level} · {word.id.split("-")[1]}</small><ChevronDown /></span>
        <span className="vocabulary-prompt" lang="en">{word.english}</span>
        {revealed ? <GermanAnswer answer={word.german} /> : <span className="vocabulary-hint">Deutsch anzeigen</span>}
      </button>
      <div className="vocabulary-card-actions">
        <button type="button" className={completed ? "is-active" : ""} aria-pressed={completed} onClick={onComplete}><Check /> Gelernt</button>
        <button type="button" className={review ? "is-active" : ""} aria-pressed={review} onClick={onReview}><Bookmark /> Wiederholen</button>
      </div>
    </article>
  );
}

export default function VocabularyPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(PREVIOUS_STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY) ?? "{}") as { completed?: string[]; review?: string[] };
        setCompleted(new Set(stored.completed ?? []));
        setReview(new Set(stored.review ?? []));
      } catch { /* Ein beschädigter lokaler Stand wird ignoriert. */ }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...completed], review: [...review] }));
  }, [completed, hydrated, review]);

  const levelWords = useMemo(() => ALL_VOCABULARY.filter((word) => level === "all" || word.level === level), [level]);
  const selectedCompleted = useMemo(() => levelWords.filter((word) => completed.has(word.id)).length, [completed, levelWords]);
  const selectedReview = useMemo(() => levelWords.filter((word) => review.has(word.id)).length, [levelWords, review]);
  const categoryCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_CATEGORIES.map((name) => [name, levelWords.filter((word) => word.category === name).length]),
  ) as Record<VocabularyCategory, number>, [levelWords]);

  const visibleWords = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de");
    return levelWords.filter((word) => {
      if (category !== "all" && word.category !== category) return false;
      if (progressFilter === "completed" && !completed.has(word.id)) return false;
      if (progressFilter === "review" && !review.has(word.id)) return false;
      return !needle || `${word.english} ${word.german}`.toLocaleLowerCase("de").includes(needle);
    });
  }, [category, completed, levelWords, progressFilter, query, review]);

  function toggle(setter: Dispatch<SetStateAction<Set<string>>>, id: string) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function markCompleted(id: string) {
    toggle(setCompleted, id);
    setReview((current) => { const next = new Set(current); next.delete(id); return next; });
  }

  function markReview(id: string) {
    toggle(setReview, id);
    setCompleted((current) => { const next = new Set(current); next.delete(id); return next; });
  }

  const progress = levelWords.length ? selectedCompleted / levelWords.length * 100 : 0;
  const levelLabel = level === "all" ? "A1–B1" : level;

  return (
    <main className="site-shell vocabulary-page" id="top">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="LeseLaut Startseite"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>Deutsch durch Geschichten</small></span></Link>
        <nav className="topnav" aria-label="Hauptnavigation"><Link href="/">Geschichten</Link><Link href="/vocabulary" aria-current="page">Wortschatz</Link></nav>
      </header>

      <section className="vocabulary-hero">
        <div>
          <Link href="/" className="vocabulary-back"><ArrowLeft /> Zu den Geschichten</Link>
          <Badge className="eyebrow"><Sparkles /> A1–B1 · Wortschatz</Badge>
          <h1>2.400 Wörter.<br /><em>Bis B1.</em></h1>
          <p>800 A1-Karten bilden die Grundlage, 500 neue Karten führen durch A2 und 1.100 weitere durch B1. Der Wortschatz deckt häufige Sprache aus Alltag, Beziehungen, Wohnen, Arbeit, Bildung, Reisen, Gesundheit, Medien, Umwelt und öffentlichem Leben ab.</p>
        </div>
        <aside className="vocabulary-progress-card">
          <span>Dein Fortschritt · {levelLabel}</span>
          <div><strong>{selectedCompleted}</strong><small>von {levelWords.length} gelernt</small></div>
          <Progress value={progress} aria-label={`${Math.round(progress)} Prozent gelernt`} />
          <p>{selectedReview ? `${selectedReview} ${selectedReview === 1 ? "Wort wartet" : "Wörter warten"} auf eine Wiederholung.` : "Noch keine Wörter zur Wiederholung markiert."}</p>
        </aside>
      </section>

      <section className="vocabulary-workspace">
        <div className="vocabulary-levels" aria-label="Sprachniveau auswählen">
          <div><span>Lernbereich</span><strong>{levelLabel}</strong></div>
          <div>
            <button type="button" className={level === "all" ? "is-active" : ""} aria-pressed={level === "all"} onClick={() => setLevel("all")}><span>A1–B1</span><small>2.400 Wörter</small></button>
            <button type="button" className={level === "A1" ? "is-active" : ""} aria-pressed={level === "A1"} onClick={() => setLevel("A1")}><span>A1</span><small>800 Wörter</small></button>
            <button type="button" className={level === "A2" ? "is-active" : ""} aria-pressed={level === "A2"} onClick={() => setLevel("A2")}><span>A2</span><small>500 neue Wörter</small></button>
            <button type="button" className={level === "B1" ? "is-active" : ""} aria-pressed={level === "B1"} onClick={() => setLevel("B1")}><span>B1</span><small>1.100 neue Wörter</small></button>
          </div>
        </div>
        <div className="vocabulary-toolbar">
          <label className="vocabulary-search"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Englisch oder Deutsch suchen" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Suche löschen"><X /></button>}</label>
          <div className="progress-filters">
            <button type="button" className={progressFilter === "all" ? "is-active" : ""} onClick={() => setProgressFilter("all")}>Alle <b>{levelWords.length}</b></button>
            <button type="button" className={progressFilter === "completed" ? "is-active" : ""} onClick={() => setProgressFilter("completed")}><CheckCircle2 /> Gelernt <b>{selectedCompleted}</b></button>
            <button type="button" className={progressFilter === "review" ? "is-active" : ""} onClick={() => setProgressFilter("review")}><Bookmark /> Wiederholen <b>{selectedReview}</b></button>
          </div>
        </div>

        <div className="category-scroller" aria-label="Wortkategorien">
          <button type="button" className={category === "all" ? "is-active" : ""} onClick={() => setCategory("all")}><span><Sparkles /></span><strong>Alle Kategorien</strong><small>{levelWords.length}</small></button>
          {VOCABULARY_CATEGORIES.map((name) => {
            const Icon = CATEGORY_META[name].icon;
            return <button key={name} type="button" className={category === name ? "is-active" : ""} style={{ "--category-color": CATEGORY_META[name].color } as CSSProperties} onClick={() => setCategory(name)}><span><Icon /></span><strong>{name}</strong><small>{categoryCounts[name]}</small></button>;
          })}
        </div>

        <div className="vocabulary-list-heading">
          <div><span>{category === "all" ? `${levelLabel} · alle Kategorien` : `${levelLabel} · ${category}`}</span><h2>{progressFilter === "completed" ? "Gelernte Wörter" : progressFilter === "review" ? "Deine Wiederholung" : "Wörter entdecken"}</h2></div>
          <p><strong>{visibleWords.length}</strong> {visibleWords.length === 1 ? "Wort" : "Wörter"}</p>
        </div>

        {visibleWords.length ? (
          <div className="vocabulary-grid">{visibleWords.map((word) => <VocabularyCard key={word.id} word={word} revealed={revealed.has(word.id)} completed={completed.has(word.id)} review={review.has(word.id)} onReveal={() => toggle(setRevealed, word.id)} onComplete={() => markCompleted(word.id)} onReview={() => markReview(word.id)} />)}</div>
        ) : (
          <div className="vocabulary-empty"><BookOpen /><h3>Hier ist noch nichts.</h3><p>Wähle einen anderen Filter oder ändere deine Suche.</p><Button variant="outline" onClick={() => { setQuery(""); setLevel("all"); setCategory("all"); setProgressFilter("all"); }}>Alle Wörter zeigen</Button></div>
        )}
      </section>

      <footer><Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>Deutsch durch Geschichten</small></span></Link><p>2.400 wichtige Wortschatzkarten für den vollständigen A1–B1-Lernweg.</p><div><Link href="/">Geschichten</Link><a href="#top">Nach oben</a></div></footer>
    </main>
  );
}
