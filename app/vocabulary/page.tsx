"use client";

import {
  Bookmark, BookOpen, CheckCircle2, ChevronDown,
  RotateCcw, Search, SlidersHorizontal, X,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { SiteHeader } from "@/app/components/site-header";
import { TopicArt } from "@/app/components/topic-art";
import { useVocabularyProgress } from "@/app/hooks/use-vocabulary-progress";
import {
  ALL_VOCABULARY,
  VOCABULARY_LEVEL_COUNTS,
  VOCABULARY_CATEGORIES,
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
import { VocabularyPractice } from "@/app/vocabulary/practice";
import { VocabularyProgressChart } from "@/app/vocabulary/progress-chart";
import { VocabularyRow, VocabularyTable, sortVocabularyWords, type VocabularySortDirection } from "@/app/vocabulary/word-list";
import { connectedVocabulary } from '@/app/lib/saved-vocabulary';
import { vocabularyCardKey, vocabularyReviewDueAt } from "@/app/lib/progress-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProgressFilter = "all" | "unlearned" | "completed" | "review";
type LevelFilter = "all" | VocabularyWord["level"];
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

export default function VocabularyPage() {
  const [view, setView] = useState("library");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [category, setCategory] = useState<VocabularyCategory | "all">("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [wordClassFilter, setWordClassFilter] = useState<WordClassFilter>("all");
  const [translationOverrides, setTranslationOverrides] = useState<Set<string>>(new Set());
  const [translationsVisible, setTranslationsVisible] = useState(true);
  const [sortDirection, setSortDirection] = useState<VocabularySortDirection>("asc");
  const [visibleLimit, setVisibleLimit] = useState(VISIBLE_BATCH);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const [pronunciationUnavailable, setPronunciationUnavailable] = useState(false);
  const { progress: vocabularyProgress, hydrated, isLearned, isReview, setLearned, setReview, rateFlashcard, recordGuess, storageError } = useVocabularyProgress(ALL_VOCABULARY);
  const deferredQuery = useDeferredValue(query);

  const catalog = useMemo(() => connectedVocabulary(ALL_VOCABULARY, vocabularyProgress), [vocabularyProgress]);
  const levelWords = useMemo(() => catalog.filter(word => level === "all" || word.level === level), [catalog, level]);
  useEffect(() => { const params = new URLSearchParams(window.location.search); if (params.get('view') === 'practice') setView('practice'); }, []);
  const selectedCompleted = useMemo(() => levelWords.filter(isLearned).length, [isLearned, levelWords]);
  const selectedReview = useMemo(() => levelWords.filter(isReview).length, [isReview, levelWords]);
  const selectedUnlearned = useMemo(() => levelWords.filter((word) => !isLearned(word) && !isReview(word)).length, [isLearned, isReview, levelWords]);
  const wordClassCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_WORD_CLASSES.map((name) => [name, levelWords.filter((word) => vocabularyWordClass(word) === name).length]),
  ) as Record<VocabularyWordClass, number>, [levelWords]);
  const verbTypeCounts = useMemo(() => Object.fromEntries(
    VOCABULARY_VERB_TYPES.map((name) => [name, levelWords.filter((word) => vocabularyVerbType(word) === name).length]),
  ) as Record<VocabularyVerbType, number>, [levelWords]);

  const visibleWords = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase("de");
    const verbTypeFilter = selectedVerbType(wordClassFilter);
    return sortVocabularyWords(levelWords.filter((word) => {
      if (category !== "all" && word.category !== category) return false;
      if (verbTypeFilter && vocabularyVerbType(word) !== verbTypeFilter) return false;
      if (!verbTypeFilter && wordClassFilter !== "all" && vocabularyWordClass(word) !== wordClassFilter) return false;
      if (progressFilter === "unlearned" && (isLearned(word) || isReview(word))) return false;
      if (progressFilter === "completed" && !isLearned(word)) return false;
      if (progressFilter === "review" && !isReview(word)) return false;
      return !needle || `${word.english} ${word.german}`.toLocaleLowerCase("de").includes(needle);
    }), sortDirection);
  }, [category, deferredQuery, isLearned, isReview, levelWords, progressFilter, wordClassFilter, sortDirection]);

  const renderedWords = visibleWords.slice(0, visibleLimit);
  const practiceWords = useMemo(() => levelWords.filter((word) => category === "all" || word.category === category), [category, levelWords]);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function chooseLevel(next: LevelFilter) {
    setLevel(next);
    setVisibleLimit(VISIBLE_BATCH);
    setCategory("all");
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
    setProgressFilter("all");
    setCategory("all");
    setWordClassFilter("all");
    setVisibleLimit(VISIBLE_BATCH);
  }

  function changeQuery(next: string) {
    setQuery(next);
    setVisibleLimit(VISIBLE_BATCH);
  }

  function toggleTranslation(id: string) {
    setTranslationOverrides((current) => {
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

  const levelLabel = level === "all" ? "A1–C1" : level;
  const hasActiveFilters = query || category !== "all" || progressFilter !== "all" || wordClassFilter !== "all";
  const wordClassLabel = vocabularyFilterLabel(wordClassFilter);

  return (
    <main className="site-shell vocabulary-page" id="top">
      <SiteHeader active="vocabulary" />

      <section className="vocabulary-workspace vocabulary-organized">
        <header className="vocab-page-heading">
          <div><span className="reading-eyebrow">Every word opens a door.</span><h1>Vocabulary</h1><p>{VOCABULARY_LEVEL_COUNTS.all.toLocaleString("en")} words · A1 to C1</p></div>
          <TopicArt kind="shopping" className="topic-art--sticker" />
          <label className="vocab-level-picker"><span>Study level</span>
            <Select value={level} onValueChange={(value) => chooseLevel(value as LevelFilter)}>
              <SelectTrigger aria-label="Choose a vocabulary level"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels · {VOCABULARY_LEVEL_COUNTS.all.toLocaleString("en")}</SelectItem>
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((name) => <SelectItem key={name} value={name}>{name} · {VOCABULARY_LEVEL_COUNTS[name].toLocaleString("en")} words</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
        </header>
        {level === "C1" && <p className="vocabulary-scope-note">C1 extension: advanced and specialist vocabulary, plus useful gaps from earlier levels. Placement is editorial. <Link href="/vocabulary/sources">Sources and level guidance →</Link></p>}
        <VocabularyProgressChart learned={selectedCompleted} review={selectedReview} unlearned={selectedUnlearned}
          hydrated={hydrated} scope={`${levelLabel} · all vocabulary`} />

        {storageError && <p role="alert">{storageError}</p>}

        <Tabs value={view} onValueChange={setView} className="vocab-sections">
          <TabsList aria-label="Vocabulary sections">
            <TabsTrigger value="library">Word library</TabsTrigger>
            <TabsTrigger value="practice">Practice & review</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
        <div className="vocabulary-toolbar">
          <label className="vocabulary-search"><Search /><Input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Search English or German" />{query && <button type="button" onClick={() => changeQuery("")} aria-label="Clear search"><X /></button>}</label>
          <div className="progress-filters">
            <button type="button" className={progressFilter === "all" ? "is-active" : ""} onClick={() => chooseProgressFilter("all")}>All <b>{levelWords.length}</b></button>
            <button type="button" className={progressFilter === "unlearned" ? "is-active" : ""} onClick={() => chooseProgressFilter("unlearned")}><BookOpen /> Not marked familiar <b>{selectedUnlearned}</b></button>
            <button type="button" className={progressFilter === "completed" ? "is-active" : ""} onClick={() => chooseProgressFilter("completed")}><CheckCircle2 /> Marked familiar <b>{selectedCompleted}</b></button>
            <button type="button" className={progressFilter === "review" ? "is-active" : ""} onClick={() => chooseProgressFilter("review")}><Bookmark /> Review <b>{selectedReview}</b></button>
          </div>
        </div>

        <details className="vocab-filter-drawer">
          <summary><SlidersHorizontal /> Filters{hasActiveFilters ? " · active" : ""}<ChevronDown /></summary>
        <div className="vocabulary-advanced-filters" aria-label="Advanced vocabulary filters">
          <label className="vocabulary-filter-control"><span>Topic</span>
            <Select value={category} onValueChange={(value) => { setCategory(value as VocabularyCategory | "all"); setVisibleLimit(VISIBLE_BATCH); }}>
              <SelectTrigger className="vocabulary-select" aria-label="Filter by vocabulary topic"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All topics</SelectItem>{VOCABULARY_CATEGORIES.map((name) => <SelectItem key={name} value={name}>{name} · {levelWords.filter((word) => word.category === name).length}</SelectItem>)}</SelectContent>
            </Select>
          </label>
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
        </details>


        <div className="vocabulary-list-heading">
          <div><span>{`${levelLabel} · ${category === "all" ? "all topics" : category} · ${wordClassLabel}`}</span><h2>{progressFilter === "unlearned" ? "Words to explore" : progressFilter === "completed" ? "Marked familiar words" : progressFilter === "review" ? "Your review list" : "Explore vocabulary"}</h2></div>
          <p><strong>{visibleWords.length}</strong> {visibleWords.length === 1 ? "word" : "words"}</p>
        </div>

        {pronunciationUnavailable && <p className="vocabulary-pronunciation-status" role="alert">Pronunciation is not available in this browser.</p>}

        {visibleWords.length ? (
          <>
            <VocabularyTable direction={sortDirection} translationsVisible={translationsVisible}
              onSort={() => { setSortDirection(current => current === "asc" ? "desc" : "asc"); setVisibleLimit(VISIBLE_BATCH); }}
              onToggleTranslations={() => { setTranslationsVisible(current => !current); setTranslationOverrides(new Set()); }}>
              {renderedWords.map((word) => <VocabularyRow key={word.id} word={word} saved={vocabularyProgress.words?.[vocabularyCardKey(word)]}
                translationVisible={translationsVisible !== translationOverrides.has(word.id)} completed={isLearned(word)} review={isReview(word)}
                dueAt={vocabularyReviewDueAt(vocabularyProgress, word)} speaking={speakingWordId === word.id} hydrated={hydrated}
                onReveal={() => toggleTranslation(word.id)} onComplete={() => markCompleted(word)} onReview={() => markReview(word)} onPronounce={() => pronounceWord(word)} />)}
            </VocabularyTable>
            {renderedWords.length < visibleWords.length && <Button className="show-more-vocabulary" variant="outline" onClick={() => setVisibleLimit((current) => current + VISIBLE_BATCH)}>Show {Math.min(VISIBLE_BATCH, visibleWords.length - renderedWords.length)} more words</Button>}
          </>
        ) : (
          <div className="vocabulary-empty"><BookOpen /><h3>No words here yet.</h3><p>Choose another filter or change your search.</p><Button variant="outline" onClick={clearFilters}>Clear filters</Button></div>
        )}

          </TabsContent>

          <TabsContent value="practice">
            <div className="vocab-section-heading">
              <div><h2>Practice & review</h2><p>{practiceWords.length.toLocaleString("en")} words · {levelLabel}{category !== "all" ? ` · ${category}` : ""}</p></div>
              {category !== "all" && <Button variant="outline" onClick={clearFilters}>Use all {levelLabel} words</Button>}
            </div>
            <VocabularyPractice key={`${level}:${category}`} words={practiceWords} progress={vocabularyProgress} hydrated={hydrated}
              recordGuess={recordGuess} rateFlashcard={rateFlashcard} pronounce={pronounceWord} />
            {pronunciationUnavailable && <p role="alert">Pronunciation is not available in this browser.</p>}
          </TabsContent>
        </Tabs>
      </section>

      <footer><Link href="/" prefetch className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through stories</small></span></Link><p>{VOCABULARY_LEVEL_COUNTS.all.toLocaleString("en")} vocabulary words across A1–C1. Level placements are editorial and have not been independently CEFR-certified.</p><div><Link href="/vocabulary/sources">Vocabulary sources</Link><Link href="/stories" prefetch>Stories</Link><a href="#top">Back to top</a></div></footer>
    </main>
  );
}
