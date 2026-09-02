"use client";

import {
  ArrowUpDown, Bookmark, BookOpen, BriefcaseBusiness, Building2, Check, CheckCircle2,
  ChevronDown, CircleUserRound, Clock3, CloudSun, GraduationCap, HeartPulse, House,
  Laptop2, Leaf, MapPinned, RotateCcw, Search, ShoppingBag, SlidersHorizontal, Sparkles, TrainFront, Utensils, X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState, type CSSProperties } from "react";

import { SiteHeader } from "@/app/components/site-header";
import { useVocabularyProgress } from "@/app/hooks/use-vocabulary-progress";
import {
  ALL_VOCABULARY,
  VOCABULARY_CATEGORIES,
  VOCABULARY_LEVEL_COUNTS,
  VOCABULARY_VERB_TYPES,
  VOCABULARY_VERB_TYPE_LABELS,
  VOCABULARY_WORD_CLASSES,
  VOCABULARY_WORD_CLASS_LABELS,
  vocabularyVerbType,
  vocabularyWordClass,
  type VocabularyCategory,
  type VocabularyVerbType,
  type VocabularyWord,
  type VocabularyWordClass,
} from "@/app/vocabulary/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProgressFilter = "all" | "unlearned" | "completed" | "review";
type LevelFilter = "all" | "A1" | "A2" | "B1";
type SortOrder = "course" | "german" | "english" | "unlearned-first" | "review-first";
const VISIBLE_BATCH = 120;
const GERMAN_COLLATOR = new Intl.Collator("de", { sensitivity: "base" });
const ENGLISH_COLLATOR = new Intl.Collator("en", { sensitivity: "base" });

const WORD_CLASS_CARD_LABELS: Record<VocabularyWordClass, string> = {
  noun: "Noun",
  pronoun: "Pronoun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  preposition: "Preposition",
  conjunction: "Conjunction",
  "number-time": "Number / time",
  "phrase-other": "Phrase / other",
};

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
  const wordClass = vocabularyWordClass(word);
  const verbType = vocabularyVerbType(word);
  const grammarLabel = verbType ? VOCABULARY_VERB_TYPE_LABELS[verbType] : WORD_CLASS_CARD_LABELS[wordClass];
  return (
    <article
      className={`vocabulary-card${revealed ? " is-revealed" : ""}${completed ? " is-completed" : ""}${review ? " is-review" : ""}`}
      style={{ "--vocabulary-color": CATEGORY_META[word.category].color } as CSSProperties}
    >
      <button type="button" className="vocabulary-reveal" aria-expanded={revealed} onClick={onReveal}>
        <span className="vocabulary-card-top"><small>{word.level} · {grammarLabel}</small><ChevronDown /></span>
        <span className="vocabulary-prompt" lang="en">{word.english}</span>
        {revealed ? <GermanAnswer answer={word.german} /> : <span className="vocabulary-hint">Show German</span>}
      </button>
      <div className="vocabulary-card-actions">
        <button type="button" className={completed ? "is-active" : ""} aria-pressed={completed} onClick={onComplete}><Check /> Learned</button>
        <button type="button" className={review ? "is-active" : ""} aria-pressed={review} onClick={onReview}><Bookmark /> Review</button>
      </div>
    </article>
  );
}

export default function VocabularyPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [wordClassFilter, setWordClassFilter] = useState<VocabularyWordClass | "all">("all");
  const [verbTypeFilter, setVerbTypeFilter] = useState<VocabularyVerbType | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("course");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [visibleLimit, setVisibleLimit] = useState(VISIBLE_BATCH);
  const { isLearned, isReview, setLearned, setReview } = useVocabularyProgress(ALL_VOCABULARY);
  const deferredQuery = useDeferredValue(query);

  const levelWords = useMemo(() => ALL_VOCABULARY.filter((word) => level === "all" || word.level === level), [level]);
  const selectedCompleted = useMemo(() => levelWords.filter(isLearned).length, [isLearned, levelWords]);
  const selectedReview = useMemo(() => levelWords.filter(isReview).length, [isReview, levelWords]);
  const selectedUnlearned = useMemo(() => levelWords.filter((word) => !isLearned(word) && !isReview(word)).length, [isLearned, isReview, levelWords]);
  const categoryCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_CATEGORIES.map((name) => [name, levelWords.filter((word) => word.category === name).length]),
  ) as Record<VocabularyCategory, number>, [levelWords]);
  const wordClassCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_WORD_CLASSES.map((name) => [name, levelWords.filter((word) => vocabularyWordClass(word) === name).length]),
  ) as Record<VocabularyWordClass, number>, [levelWords]);
  const verbTypeCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_VERB_TYPES.map((name) => [name, levelWords.filter((word) => vocabularyVerbType(word) === name).length]),
  ) as Record<VocabularyVerbType, number>, [levelWords]);

  const visibleWords = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase("de");
    const filtered = levelWords.filter((word) => {
      if (category !== "all" && word.category !== category) return false;
      if (wordClassFilter !== "all" && vocabularyWordClass(word) !== wordClassFilter) return false;
      if (verbTypeFilter !== "all" && vocabularyVerbType(word) !== verbTypeFilter) return false;
      if (progressFilter === "unlearned" && (isLearned(word) || isReview(word))) return false;
      if (progressFilter === "completed" && !isLearned(word)) return false;
      if (progressFilter === "review" && !isReview(word)) return false;
      return !needle || `${word.english} ${word.german}`.toLocaleLowerCase("de").includes(needle);
    });

    if (sortOrder === "course") return filtered;
    return [...filtered].sort((left, right) => {
      if (sortOrder === "german") return GERMAN_COLLATOR.compare(left.german, right.german);
      if (sortOrder === "english") return ENGLISH_COLLATOR.compare(left.english, right.english);
      if (sortOrder === "unlearned-first") {
        const weight = (word: VocabularyWord) => isLearned(word) ? 2 : isReview(word) ? 1 : 0;
        return weight(left) - weight(right);
      }
      const weight = (word: VocabularyWord) => isReview(word) ? 0 : isLearned(word) ? 2 : 1;
      return weight(left) - weight(right);
    });
  }, [category, deferredQuery, isLearned, isReview, levelWords, progressFilter, sortOrder, verbTypeFilter, wordClassFilter]);

  const renderedWords = visibleWords.slice(0, visibleLimit);

  function chooseLevel(next: LevelFilter) {
    setLevel(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function chooseCategory(next: VocabularyCategory | "all") {
    setCategory(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function chooseProgressFilter(next: ProgressFilter) {
    setProgressFilter(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function chooseWordClass(next: VocabularyWordClass | "all") {
    setWordClassFilter(next);
    if (next !== "verb") setVerbTypeFilter("all");
    setVisibleLimit(VISIBLE_BATCH);
  }

  function chooseVerbType(next: VocabularyVerbType | "all") {
    setWordClassFilter("verb");
    setVerbTypeFilter(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function chooseSortOrder(next: SortOrder) {
    setSortOrder(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setProgressFilter("all");
    setWordClassFilter("all");
    setVerbTypeFilter("all");
    setSortOrder("course");
    setVisibleLimit(VISIBLE_BATCH);
  }

  function changeQuery(next: string) {
    setQuery(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function toggleRevealed(id: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function markCompleted(word: VocabularyWord) {
    setLearned(word, !isLearned(word));
  }

  function markReview(word: VocabularyWord) {
    setReview(word, !isReview(word));
  }

  const progress = levelWords.length ? selectedCompleted / levelWords.length * 100 : 0;
  const levelLabel = level === "all" ? "A1–B1" : level;
  const hasActiveFilters = query || category !== "all" || progressFilter !== "all" || wordClassFilter !== "all" || verbTypeFilter !== "all" || sortOrder !== "course";
  const wordClassLabel = wordClassFilter === "all" ? "all word classes" : VOCABULARY_WORD_CLASS_LABELS[wordClassFilter].toLocaleLowerCase("en");

  return (
    <main className="site-shell vocabulary-page" id="top">
      <SiteHeader active="vocabulary" />

      <section className="vocabulary-workspace">
        <div className="vocabulary-overview">
          <aside className="vocabulary-progress-card">
            <span>Synced progress · {levelLabel}</span>
            <div><strong>{selectedCompleted}</strong><small>of {levelWords.length} learned</small></div>
            <Progress value={progress} aria-label={`${Math.round(progress)}% learned`} />
            <p>{selectedReview ? `${selectedReview} ${selectedReview === 1 ? "word is" : "words are"} ready for review.` : "Course recall and vocabulary cards stay synchronized on this device."}</p>
          </aside>
          <div className="vocabulary-levels" aria-label="Choose a vocabulary level">
            <div><span>Study range</span><strong>{levelLabel}</strong></div>
            <div>
              <button type="button" className={level === "all" ? "is-active" : ""} aria-pressed={level === "all"} onClick={() => chooseLevel("all")}><span>A1–B1</span><small>{VOCABULARY_LEVEL_COUNTS.all.toLocaleString("en")} words</small></button>
              <button type="button" className={level === "A1" ? "is-active" : ""} aria-pressed={level === "A1"} onClick={() => chooseLevel("A1")}><span>A1</span><small>{VOCABULARY_LEVEL_COUNTS.A1.toLocaleString("en")} words</small></button>
              <button type="button" className={level === "A2" ? "is-active" : ""} aria-pressed={level === "A2"} onClick={() => chooseLevel("A2")}><span>A2</span><small>{VOCABULARY_LEVEL_COUNTS.A2.toLocaleString("en")} words</small></button>
              <button type="button" className={level === "B1" ? "is-active" : ""} aria-pressed={level === "B1"} onClick={() => chooseLevel("B1")}><span>B1</span><small>{VOCABULARY_LEVEL_COUNTS.B1.toLocaleString("en")} words</small></button>
            </div>
          </div>
        </div>
        <div className="vocabulary-toolbar">
          <label className="vocabulary-search"><Search /><Input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Search English or German" />{query && <button type="button" onClick={() => changeQuery("")} aria-label="Clear search"><X /></button>}</label>
          <div className="progress-filters">
            <button type="button" className={progressFilter === "all" ? "is-active" : ""} onClick={() => chooseProgressFilter("all")}>All <b>{levelWords.length}</b></button>
            <button type="button" className={progressFilter === "unlearned" ? "is-active" : ""} onClick={() => chooseProgressFilter("unlearned")}><BookOpen /> Not learned <b>{selectedUnlearned}</b></button>
            <button type="button" className={progressFilter === "completed" ? "is-active" : ""} onClick={() => chooseProgressFilter("completed")}><CheckCircle2 /> Learned <b>{selectedCompleted}</b></button>
            <button type="button" className={progressFilter === "review" ? "is-active" : ""} onClick={() => chooseProgressFilter("review")}><Bookmark /> Review <b>{selectedReview}</b></button>
          </div>
        </div>

        <div className="vocabulary-advanced-filters" aria-label="Advanced vocabulary filters">
          <div className="vocabulary-filter-title"><SlidersHorizontal /><span>Advanced filters</span></div>
          <label className="vocabulary-filter-control">
            <span>Word class</span>
            <Select value={wordClassFilter} onValueChange={(value) => chooseWordClass(value as VocabularyWordClass | "all")}>
              <SelectTrigger className="vocabulary-select" aria-label="Filter by word class"><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Grammar</SelectLabel>
                  <SelectItem value="all">All word classes · {levelWords.length}</SelectItem>
                  {VOCABULARY_WORD_CLASSES.map((name) => <SelectItem key={name} value={name}>{VOCABULARY_WORD_CLASS_LABELS[name]} · {wordClassCounts[name]}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
          <label className="vocabulary-filter-control">
            <span>Verb type</span>
            <Select value={verbTypeFilter} onValueChange={(value) => chooseVerbType(value as VocabularyVerbType | "all")}>
              <SelectTrigger className="vocabulary-select" aria-label="Filter by verb type"><SelectValue placeholder="All verbs" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Verb families</SelectLabel>
                  <SelectItem value="all">All verbs · {wordClassCounts.verb}</SelectItem>
                  {VOCABULARY_VERB_TYPES.map((name) => <SelectItem key={name} value={name}>{VOCABULARY_VERB_TYPE_LABELS[name]} · {verbTypeCounts[name]}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
          <label className="vocabulary-filter-control">
            <span>Sort order</span>
            <Select value={sortOrder} onValueChange={(value) => chooseSortOrder(value as SortOrder)}>
              <SelectTrigger className="vocabulary-select" aria-label="Sort vocabulary"><ArrowUpDown /><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="course">Course order</SelectItem>
                <SelectItem value="german">German A–Z</SelectItem>
                <SelectItem value="english">English A–Z</SelectItem>
                <SelectItem value="unlearned-first">Not learned first</SelectItem>
                <SelectItem value="review-first">Review first</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <button type="button" className="vocabulary-filter-reset" onClick={clearFilters} disabled={!hasActiveFilters}><RotateCcw /> Clear filters</button>
        </div>

        <div className="category-scroller" aria-label="Vocabulary categories">
          <button type="button" className={category === "all" ? "is-active" : ""} onClick={() => chooseCategory("all")}><span><Sparkles /></span><strong>All categories</strong><small>{levelWords.length}</small></button>
          {VOCABULARY_CATEGORIES.map((name) => {
            const Icon = CATEGORY_META[name].icon;
            return <button key={name} type="button" className={category === name ? "is-active" : ""} style={{ "--category-color": CATEGORY_META[name].color } as CSSProperties} onClick={() => chooseCategory(name)}><span><Icon /></span><strong lang="de">{name}</strong><small>{categoryCounts[name]}</small></button>;
          })}
        </div>

        <div className="vocabulary-list-heading">
          <div><span>{category === "all" ? `${levelLabel} · ${wordClassLabel}` : `${levelLabel} · ${category} · ${wordClassLabel}`}</span><h2>{progressFilter === "unlearned" ? "Words to learn" : progressFilter === "completed" ? "Learned words" : progressFilter === "review" ? "Your review list" : "Explore vocabulary"}</h2></div>
          <p><strong>{visibleWords.length}</strong> {visibleWords.length === 1 ? "word" : "words"}</p>
        </div>

        {visibleWords.length ? (
          <>
            <div className="vocabulary-grid">{renderedWords.map((word) => <VocabularyCard key={word.id} word={word} revealed={revealed.has(word.id)} completed={isLearned(word)} review={isReview(word)} onReveal={() => toggleRevealed(word.id)} onComplete={() => markCompleted(word)} onReview={() => markReview(word)} />)}</div>
            {renderedWords.length < visibleWords.length && <Button className="show-more-vocabulary" variant="outline" onClick={() => setVisibleLimit((current) => current + VISIBLE_BATCH)}>Show {Math.min(VISIBLE_BATCH, visibleWords.length - renderedWords.length)} more words</Button>}
          </>
        ) : (
          <div className="vocabulary-empty"><BookOpen /><h3>No words here yet.</h3><p>Choose another filter or change your search.</p><Button variant="outline" onClick={clearFilters}>Clear filters</Button></div>
        )}
      </section>

      <footer><Link href="/" prefetch className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through stories</small></span></Link><p>{VOCABULARY_LEVEL_COUNTS.all.toLocaleString("en")} essential vocabulary cards for the complete A1–B1 learning path.</p><div><Link href="/stories" prefetch>Stories</Link><a href="#top">Back to top</a></div></footer>
    </main>
  );
}
