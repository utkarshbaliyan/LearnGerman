"use client";

import {
  Bookmark, BookOpen, BriefcaseBusiness, Building2, Check, CheckCircle2,
  ChevronDown, CircleHelp, CircleUserRound, Clock3, CloudSun, GraduationCap, HeartPulse, House,
  Laptop2, Leaf, MapPinned, RotateCcw, Search, ShoppingBag, SlidersHorizontal, Sparkles, TrainFront, Utensils, Volume2, X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState, type CSSProperties } from "react";

import { SiteHeader } from "@/app/components/site-header";
import { useVocabularyProgress } from "@/app/hooks/use-vocabulary-progress";
import {
  ALL_VOCABULARY,
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
import {
  advanceVocabularyQuiz,
  buildVocabularyQuiz,
  startVocabularyQuiz,
  type VocabularyQuizCursor,
} from "@/app/vocabulary/quiz";
import { buildVocabularyStudySets } from "@/app/vocabulary/study-sets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProgressFilter = "all" | "unlearned" | "completed" | "review";
type LevelFilter = "all" | "A1" | "A2" | "B1";
type WordClassFilter = VocabularyWordClass | `verb:${VocabularyVerbType}` | "all";
const VISIBLE_BATCH = 120;

function isVerbTypeFilter(filter: WordClassFilter): filter is `verb:${VocabularyVerbType}` {
  return filter.startsWith("verb:");
}

function selectedVerbType(filter: WordClassFilter): VocabularyVerbType | null {
  return isVerbTypeFilter(filter) ? filter.slice(5) as VocabularyVerbType : null;
}

function vocabularyFilterLabel(filter: WordClassFilter): string {
  if (filter === "all") return "all word classes";
  if (isVerbTypeFilter(filter)) return VOCABULARY_VERB_TYPE_LABELS[filter.slice(5) as VocabularyVerbType].toLocaleLowerCase("en");
  return VOCABULARY_WORD_CLASS_LABELS[filter].toLocaleLowerCase("en");
}

const WORD_CLASS_CARD_LABELS: Record<VocabularyWordClass, string> = {
  noun: "Noun",
  pronoun: "Pronoun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  preposition: "Preposition",
  conjunction: "Conjunction",
  "number-time": "Number / time",
  "phrase-other": "Other words",
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

function VocabularyCard({ word, revealed, completed, review, speaking, onReveal, onComplete, onReview, onPronounce }: {
  word: VocabularyWord;
  revealed: boolean;
  completed: boolean;
  review: boolean;
  speaking: boolean;
  onReveal: () => void;
  onComplete: () => void;
  onReview: () => void;
  onPronounce: () => void;
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
        <button type="button" className={speaking ? "is-speaking" : ""} aria-label="Pronounce this word in German" onClick={onPronounce}><Volume2 /> {speaking ? "Playing" : "Listen"}</button>
      </div>
    </article>
  );
}

export default function VocabularyPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [studySetId, setStudySetId] = useState<string | "all">("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [wordClassFilter, setWordClassFilter] = useState<WordClassFilter>("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [visibleLimit, setVisibleLimit] = useState(VISIBLE_BATCH);
  const [quizCursor, setQuizCursor] = useState<VocabularyQuizCursor | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizBestStreak, setQuizBestStreak] = useState(0);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const [pronunciationUnavailable, setPronunciationUnavailable] = useState(false);
  const { isLearned, isReview, setLearned, setReview } = useVocabularyProgress(ALL_VOCABULARY);
  const deferredQuery = useDeferredValue(query);

  const levelWords = useMemo(() => ALL_VOCABULARY.filter((word) => level === "all" || word.level === level), [level]);
  const selectedCompleted = useMemo(() => levelWords.filter(isLearned).length, [isLearned, levelWords]);
  const selectedReview = useMemo(() => levelWords.filter(isReview).length, [isReview, levelWords]);
  const selectedUnlearned = useMemo(() => levelWords.filter((word) => !isLearned(word) && !isReview(word)).length, [isLearned, isReview, levelWords]);
  const studySets = useMemo(() => buildVocabularyStudySets(levelWords), [levelWords]);
  const activeStudySet = useMemo(
    () => studySetId === "all" ? null : studySets.find((set) => set.id === studySetId) ?? null,
    [studySetId, studySets],
  );
  const activeStudySetWordIds = useMemo(() => new Set(activeStudySet?.words.map((word) => word.id) ?? []), [activeStudySet]);
  const studySetProgress = useMemo(() => new Map(studySets.map((set) => [set.id, set.words.filter(isLearned).length])), [isLearned, studySets]);
  const wordClassCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_WORD_CLASSES.map((name) => [name, levelWords.filter((word) => vocabularyWordClass(word) === name).length]),
  ) as Record<VocabularyWordClass, number>, [levelWords]);
  const verbTypeCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_VERB_TYPES.map((name) => [name, levelWords.filter((word) => vocabularyVerbType(word) === name).length]),
  ) as Record<VocabularyVerbType, number>, [levelWords]);

  const visibleWords = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase("de");
    const verbTypeFilter = selectedVerbType(wordClassFilter);
    return levelWords.filter((word) => {
      if (activeStudySet && !activeStudySetWordIds.has(word.id)) return false;
      if (verbTypeFilter && vocabularyVerbType(word) !== verbTypeFilter) return false;
      if (!verbTypeFilter && wordClassFilter !== "all" && vocabularyWordClass(word) !== wordClassFilter) return false;
      if (progressFilter === "unlearned" && (isLearned(word) || isReview(word))) return false;
      if (progressFilter === "completed" && !isLearned(word)) return false;
      if (progressFilter === "review" && !isReview(word)) return false;
      return !needle || `${word.english} ${word.german}`.toLocaleLowerCase("de").includes(needle);
    });
  }, [activeStudySet, activeStudySetWordIds, deferredQuery, isLearned, isReview, levelWords, progressFilter, wordClassFilter]);

  const renderedWords = visibleWords.slice(0, visibleLimit);
  const quiz = useMemo(() => quizCursor ? buildVocabularyQuiz(levelWords, quizCursor) : null, [levelWords, quizCursor]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setQuizCursor(startVocabularyQuiz(localStorage, () => crypto.getRandomValues(new Uint32Array(1))[0]));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function chooseLevel(next: LevelFilter) {
    setLevel(next);
    setStudySetId("all");
    setVisibleLimit(VISIBLE_BATCH);
    setQuizAnswer(null);
  }

  function chooseStudySet(next: string | "all") {
    setStudySetId(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function chooseProgressFilter(next: ProgressFilter) {
    setProgressFilter(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function chooseWordClass(next: WordClassFilter) {
    setWordClassFilter(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function clearFilters() {
    setQuery("");
    setStudySetId("all");
    setProgressFilter("all");
    setWordClassFilter("all");
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

  function pronounceWord(word: VocabularyWord) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setPronunciationUnavailable(true);
      return;
    }

    const speech = window.speechSynthesis;
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(word.german);
    const voices = speech.getVoices();
    utterance.lang = "de-DE";
    utterance.rate = 0.82;
    utterance.voice = voices.find((voice) => voice.lang.toLocaleLowerCase() === "de-de")
      ?? voices.find((voice) => voice.lang.toLocaleLowerCase().startsWith("de"))
      ?? null;
    utterance.onend = () => setSpeakingWordId((current) => current === word.id ? null : current);
    utterance.onerror = () => setSpeakingWordId((current) => current === word.id ? null : current);
    setPronunciationUnavailable(false);
    setSpeakingWordId(word.id);
    speech.speak(utterance);
  }

  function answerQuiz(german: string) {
    if (!quiz || quizAnswer) return;
    setQuizAnswer(german);
    if (german === quiz.word.german) {
      setLearned(quiz.word, true);
      setQuizStreak((current) => {
        const next = current + 1;
        setQuizBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setReview(quiz.word, true);
      setQuizStreak(0);
    }
  }

  function nextQuizQuestion() {
    setQuizCursor((current) => current ? advanceVocabularyQuiz(localStorage, current) : current);
    setQuizAnswer(null);
  }

  const progress = levelWords.length ? selectedCompleted / levelWords.length * 100 : 0;
  const levelLabel = level === "all" ? "A1–B1" : level;
  const hasActiveFilters = query || studySetId !== "all" || progressFilter !== "all" || wordClassFilter !== "all";
  const wordClassLabel = vocabularyFilterLabel(wordClassFilter);
  const activeStudySetLearned = activeStudySet ? studySetProgress.get(activeStudySet.id) ?? 0 : 0;

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

        {quiz && <section className="vocabulary-quiz" aria-labelledby="vocabulary-quiz-title">
          <div className="vocabulary-quiz-heading">
            <span><CircleHelp /> Quick guess</span>
            <h2 id="vocabulary-quiz-title">What is <strong lang="en">{quiz.word.english}</strong> in German?</h2>
            <p>{quizStreak} in a row · best streak {quizBestStreak}</p>
          </div>
          <div className="vocabulary-quiz-answers" role="group" aria-label="Choose the German answer">
            {quiz.choices.map((choice) => {
              const isCorrect = choice.german === quiz.word.german;
              const isSelected = quizAnswer === choice.german;
              const resultClass = quizAnswer ? (isCorrect ? "is-correct" : isSelected ? "is-wrong" : "") : "";
              return <button key={choice.id} type="button" className={resultClass} disabled={Boolean(quizAnswer)} onClick={() => answerQuiz(choice.german)} lang="de">{choice.german}</button>;
            })}
          </div>
          {quizAnswer && <div className="vocabulary-quiz-result" aria-live="polite">
            <span>{quizAnswer === quiz.word.german ? "Correct. Added to learned." : `The answer is ${quiz.word.german}. Added to review.`}</span>
            <div><Button type="button" variant="outline" onClick={() => pronounceWord(quiz.word)}><Volume2 /> Listen</Button><Button type="button" onClick={nextQuizQuestion}>Next word</Button></div>
          </div>}
        </section>}

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
            <Select value={wordClassFilter} onValueChange={(value) => chooseWordClass(value as WordClassFilter)}>
              <SelectTrigger className="vocabulary-select" aria-label="Filter by word class and verb type"><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Grammar</SelectLabel>
                  <SelectItem value="all">All word classes · {levelWords.length}</SelectItem>
                  {VOCABULARY_WORD_CLASSES.map((name) => <SelectItem key={name} value={name}>{name === "verb" ? "All verbs" : VOCABULARY_WORD_CLASS_LABELS[name]} · {wordClassCounts[name]}</SelectItem>)}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Verb types</SelectLabel>
                  {VOCABULARY_VERB_TYPES.map((name) => <SelectItem key={name} value={`verb:${name}`}>{VOCABULARY_VERB_TYPE_LABELS[name]} · {verbTypeCounts[name]}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
          <button type="button" className="vocabulary-filter-reset" onClick={clearFilters} disabled={!hasActiveFilters}><RotateCcw /> Clear filters</button>
        </div>

        <div className="study-set-heading">
          <div><span>Study sets</span><p>Choose one focused set. Every set contains 30–60 words.</p></div>
          <strong>{studySets.length} sets</strong>
        </div>
        <div className="category-scroller" aria-label="Vocabulary study sets">
          <button type="button" className={studySetId === "all" ? "is-active" : ""} onClick={() => chooseStudySet("all")}><span><Sparkles /></span><strong>All study sets</strong><small>{levelWords.length} words</small><em>{selectedCompleted} learned</em></button>
          {studySets.map((set) => {
            const Icon = CATEGORY_META[set.primaryCategory].icon;
            const learned = studySetProgress.get(set.id) ?? 0;
            const complete = learned === set.words.length;
            return <button key={set.id} type="button" className={`${studySetId === set.id ? "is-active" : ""}${complete ? " is-complete" : ""}`} aria-label={`${set.title}, ${learned} of ${set.words.length} learned`} style={{ "--category-color": CATEGORY_META[set.primaryCategory].color } as CSSProperties} onClick={() => chooseStudySet(set.id)}><span><Icon /></span><strong>{set.title}</strong><small>{set.words.length} words</small><em>{complete ? <><Check /> Complete</> : `${set.words.length - learned} left`}</em></button>;
          })}
        </div>

        <div className="vocabulary-list-heading">
          <div><span>{`${levelLabel} · ${activeStudySet?.title ?? "all study sets"} · ${wordClassLabel}`}</span><h2>{progressFilter === "unlearned" ? "Words to learn" : progressFilter === "completed" ? "Learned words" : progressFilter === "review" ? "Your review list" : activeStudySet && activeStudySetLearned === activeStudySet.words.length ? "Study set complete" : activeStudySet ? "Complete this study set" : "Explore vocabulary"}</h2></div>
          <p><strong>{visibleWords.length}</strong> {visibleWords.length === 1 ? "word" : "words"}</p>
        </div>

        {pronunciationUnavailable && <p className="vocabulary-pronunciation-status" role="alert">Pronunciation is not available in this browser.</p>}

        {visibleWords.length ? (
          <>
            <div className="vocabulary-grid">{renderedWords.map((word) => <VocabularyCard key={word.id} word={word} revealed={revealed.has(word.id)} completed={isLearned(word)} review={isReview(word)} speaking={speakingWordId === word.id} onReveal={() => toggleRevealed(word.id)} onComplete={() => markCompleted(word)} onReview={() => markReview(word)} onPronounce={() => pronounceWord(word)} />)}</div>
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
