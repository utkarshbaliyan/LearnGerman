"use client";

import {
  ArrowLeft, Bookmark, BookOpen, Check, CheckCircle2, ChevronDown, CircleUserRound,
  Clock3, GraduationCap, HeartPulse, House, Leaf, Search, ShoppingBag, Sparkles,
  TrainFront, Utensils, X, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";

import { A1_VOCABULARY, VOCABULARY_CATEGORIES, type VocabularyCategory, type VocabularyWord } from "@/app/vocabulary/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type ProgressFilter = "all" | "completed" | "review";
const STORAGE_KEY = "leselaut:vocabulary:a1";

const CATEGORY_META: Record<VocabularyCategory, { icon: LucideIcon; color: string }> = {
  "Grundlagen": { icon: Sparkles, color: "#d66a48" },
  "Familie & Menschen": { icon: CircleUserRound, color: "#8d6bd1" },
  "Zuhause & Zimmer": { icon: House, color: "#278071" },
  "Essen & Trinken": { icon: Utensils, color: "#d55369" },
  "Einkaufen & Kleidung": { icon: ShoppingBag, color: "#bd7a22" },
  "Schule & Arbeit": { icon: GraduationCap, color: "#5275ad" },
  "Stadt & Verkehr": { icon: TrainFront, color: "#357b8d" },
  "Gesundheit & Körper": { icon: HeartPulse, color: "#bf5562" },
  "Freizeit & Natur": { icon: Leaf, color: "#5a8c55" },
  "Zeit & Zahlen": { icon: Clock3, color: "#9b6a43" },
  "Verben": { icon: BookOpen, color: "#c9553d" },
  "Adjektive & Adverbien": { icon: Sparkles, color: "#6d63a8" },
};

function GermanAnswer({ answer }: { answer: string }) {
  const [first, ...rest] = answer.split(" ");
  const hasArticle = ["der", "die", "das"].includes(first);
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
        <span className="vocabulary-card-top"><small>{word.id.slice(-3)}</small><ChevronDown /></span>
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
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as { completed?: string[]; review?: string[] };
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

  const categoryCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_CATEGORIES.map((name) => [name, A1_VOCABULARY.filter((word) => word.category === name).length]),
  ) as Record<VocabularyCategory, number>, []);

  const visibleWords = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de");
    return A1_VOCABULARY.filter((word) => {
      if (category !== "all" && word.category !== category) return false;
      if (progressFilter === "completed" && !completed.has(word.id)) return false;
      if (progressFilter === "review" && !review.has(word.id)) return false;
      return !needle || `${word.english} ${word.german}`.toLocaleLowerCase("de").includes(needle);
    });
  }, [category, completed, progressFilter, query, review]);

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

  const progress = completed.size / 8;

  return (
    <main className="site-shell vocabulary-page" id="top">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="LeseLaut Startseite"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>Deutsch durch Geschichten</small></span></Link>
        <nav className="topnav" aria-label="Hauptnavigation"><Link href="/">Geschichten</Link><Link href="/vocabulary" aria-current="page">Wortschatz</Link></nav>
      </header>

      <section className="vocabulary-hero">
        <div>
          <Link href="/" className="vocabulary-back"><ArrowLeft /> Zu den Geschichten</Link>
          <Badge className="eyebrow"><Sparkles /> A1 · Wortschatz</Badge>
          <h1>800 Wörter.<br /><em>Ein klares Ziel.</em></h1>
          <p>Tippe auf ein englisches Wort und prüfe dich selbst. Lerne Nomen mit Artikel, markiere sichere Wörter als gelernt und sammle schwierige Wörter zum Wiederholen.</p>
        </div>
        <aside className="vocabulary-progress-card">
          <span>Dein Fortschritt</span>
          <div><strong>{completed.size}</strong><small>von 800 gelernt</small></div>
          <Progress value={progress} aria-label={`${Math.round(progress)} Prozent gelernt`} />
          <p>{review.size ? `${review.size} ${review.size === 1 ? "Wort wartet" : "Wörter warten"} auf eine Wiederholung.` : "Noch keine Wörter zur Wiederholung markiert."}</p>
        </aside>
      </section>

      <section className="vocabulary-workspace">
        <div className="vocabulary-toolbar">
          <label className="vocabulary-search"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Englisch oder Deutsch suchen" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Suche löschen"><X /></button>}</label>
          <div className="progress-filters">
            <button type="button" className={progressFilter === "all" ? "is-active" : ""} onClick={() => setProgressFilter("all")}>Alle <b>800</b></button>
            <button type="button" className={progressFilter === "completed" ? "is-active" : ""} onClick={() => setProgressFilter("completed")}><CheckCircle2 /> Gelernt <b>{completed.size}</b></button>
            <button type="button" className={progressFilter === "review" ? "is-active" : ""} onClick={() => setProgressFilter("review")}><Bookmark /> Wiederholen <b>{review.size}</b></button>
          </div>
        </div>

        <div className="category-scroller" aria-label="Wortkategorien">
          <button type="button" className={category === "all" ? "is-active" : ""} onClick={() => setCategory("all")}><span><Sparkles /></span><strong>Alle Kategorien</strong><small>800</small></button>
          {VOCABULARY_CATEGORIES.map((name) => {
            const Icon = CATEGORY_META[name].icon;
            return <button key={name} type="button" className={category === name ? "is-active" : ""} style={{ "--category-color": CATEGORY_META[name].color } as CSSProperties} onClick={() => setCategory(name)}><span><Icon /></span><strong>{name}</strong><small>{categoryCounts[name]}</small></button>;
          })}
        </div>

        <div className="vocabulary-list-heading">
          <div><span>{category === "all" ? "A1 · alle Kategorien" : category}</span><h2>{progressFilter === "completed" ? "Gelernte Wörter" : progressFilter === "review" ? "Deine Wiederholung" : "Wörter entdecken"}</h2></div>
          <p><strong>{visibleWords.length}</strong> {visibleWords.length === 1 ? "Wort" : "Wörter"}</p>
        </div>

        {visibleWords.length ? (
          <div className="vocabulary-grid">{visibleWords.map((word) => <VocabularyCard key={word.id} word={word} revealed={revealed.has(word.id)} completed={completed.has(word.id)} review={review.has(word.id)} onReveal={() => toggle(setRevealed, word.id)} onComplete={() => markCompleted(word.id)} onReview={() => markReview(word.id)} />)}</div>
        ) : (
          <div className="vocabulary-empty"><BookOpen /><h3>Hier ist noch nichts.</h3><p>Wähle einen anderen Filter oder ändere deine Suche.</p><Button variant="outline" onClick={() => { setQuery(""); setCategory("all"); setProgressFilter("all"); }}>Alle Wörter zeigen</Button></div>
        )}
      </section>

      <footer><Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>Deutsch durch Geschichten</small></span></Link><p>800 ausgewählte A1-Wörter aus typischen Alltagsthemen.</p><div><Link href="/">Geschichten</Link><a href="#top">Nach oben</a></div></footer>
    </main>
  );
}
