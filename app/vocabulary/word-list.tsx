"use client";

import { ArrowDown, ArrowUp, Star, Volume2 } from "lucide-react";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import { vocabularyVerbType, vocabularyWordClass, VOCABULARY_VERB_TYPE_LABELS, VOCABULARY_WORD_CLASS_LABELS, type VocabularyWord } from "./data";
import type { CollectedVocabularyWord } from "@/app/lib/progress-sync";

export type VocabularySortDirection = "asc" | "desc";
const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const article = /^((?:der|die|das)(?:\/(?:der|die|das))?)\s+(.+)$/u;

/** Sort the complete filtered collection before taking a visible batch. */
export function sortVocabularyWords(words: VocabularyWord[], direction: VocabularySortDirection) {
  const sortKey = (word: VocabularyWord) => word.german.replace(/^(?:(?:der|die|das)(?:\/(?:der|die|das))?|sich)\s+/u, "");
  const multiplier = direction === "asc" ? 1 : -1;
  return [...words].sort((left, right) => multiplier * (collator.compare(sortKey(left), sortKey(right)) || collator.compare(left.id, right.id)));
}

export function VocabularyTable({ children, direction, translationsVisible, onSort, onToggleTranslations }: {
  children: ReactNode;
  direction: VocabularySortDirection;
  translationsVisible: boolean;
  onSort: () => void;
  onToggleTranslations: () => void;
}) {
  const SortIcon = direction === "asc" ? ArrowUp : ArrowDown;
  return <div className="vocabulary-table-wrap">
    <table className="vocabulary-table">
      <caption className="sr-only">German vocabulary, English translations and saved learning status</caption>
      <thead><tr>
        <th scope="col" className="vocab-col-review">Review</th>
        <th scope="col" className="vocab-col-level">Level</th>
        <th scope="col" className="vocab-col-word" aria-sort={direction === "asc" ? "ascending" : "descending"}>
          <button type="button" onClick={onSort} aria-label={`Sort German words ${direction === "asc" ? "Z to A" : "A to Z"}`}>Word <SortIcon aria-hidden="true" /></button>
        </th>
        <th scope="col" className="vocab-col-translation">Translation <button type="button" className="vocab-translation-toggle" onClick={onToggleTranslations} aria-label={translationsVisible ? "Hide English translations" : "Show English translations"} aria-pressed={!translationsVisible}>({translationsVisible ? "hide" : "show"})</button></th>
        <th scope="col" className="vocab-col-progress">Progress</th>
        <th scope="col" className="vocab-col-learned">Learned</th>
        <th scope="col" className="vocab-col-audio"><span className="sr-only">Audio</span></th>
      </tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>;
}

export function VocabularyRow({ word, saved, translationVisible, completed, review, dueAt, speaking, hydrated, onReveal, onComplete, onReview, onPronounce }: {
  word: VocabularyWord;
  saved?: CollectedVocabularyWord;
  translationVisible: boolean;
  completed: boolean;
  review: boolean;
  dueAt: number;
  speaking: boolean;
  hydrated: boolean;
  onReveal: () => void;
  onComplete: () => void;
  onReview: () => void;
  onPronounce: () => void;
}) {
  const translationId = useId();
  const parts = word.german.match(article);
  const verbType = vocabularyVerbType(word);
  const grammarLabel = verbType ? VOCABULARY_VERB_TYPE_LABELS[verbType] : VOCABULARY_WORD_CLASS_LABELS[vocabularyWordClass(word)];
  const status = !hydrated ? "Loading…" : completed ? "Familiar" : review ? "In review" : "New";
  return <tr className={`vocabulary-row${completed ? " is-completed" : review ? " is-review" : ""}`}>
    <td className="vocab-col-review"><label className="vocab-review-check">
      <input type="checkbox" checked={review} disabled={!hydrated} onChange={onReview} aria-label={`Review ${word.german}`} />
      <span className="vocab-mobile-label">Review</span>
    </label></td>
    <td className="vocab-col-level"><span className="vocab-row-level">{word.level}</span></td>
    <td className="vocab-col-word">
      <button type="button" className="vocab-word-toggle" lang="de" onClick={onReveal} aria-expanded={translationVisible} aria-controls={translationId} title={translationVisible ? "Hide English translation" : "Show English translation"}>
        {parts ? <><span className="vocab-word-article">{parts[1]} </span>{parts[2]}</> : word.german}
      </button>
      <span className="vocab-word-meta"><span className="vocab-mobile-level">{word.level} · </span>{grammarLabel}</span>
      {word.sourceUrl && <a className="vocab-row-source" href={word.sourceUrl} target="_blank" rel="noreferrer">Dictionary ↗</a>}
      {saved && <Link className="vocab-row-source" href={saved.source.href}>{saved.source.kind === "book" ? "From your book" : "From your story"} →</Link>}
    </td>
    <td className="vocab-col-translation" id={translationId}>
      {translationVisible ? <span lang="en" className="vocab-translation-text">{word.english.replace(/\s*;\s*|\s+\/\s+/g, "\n")}</span> : <button type="button" className="vocab-show-translation" onClick={onReveal} aria-label={`Show English translation for ${word.german}`}>Show translation</button>}
    </td>
    <td className="vocab-col-progress">
      <span className={`vocab-row-status${hydrated && completed ? " is-familiar" : hydrated && review ? " is-review" : ""}`}><span aria-hidden="true" />{status}</span>
      {hydrated && review && <small className="vocab-row-due">{dueAt === 0 ? "Ready for review" : `Due ${new Date(dueAt).toLocaleDateString()}`}</small>}
    </td>
    <td className="vocab-col-learned"><button type="button" className={`vocab-familiar-toggle${completed ? " is-active" : ""}`} aria-label={`Mark ${word.german} as familiar`} aria-pressed={completed} disabled={!hydrated} title={completed ? "Remove familiar mark" : "Mark familiar"} onClick={onComplete}><Star aria-hidden="true" fill={completed ? "currentColor" : "none"} /></button></td>
    <td className="vocab-col-audio"><button type="button" className={`vocab-list-audio${speaking ? " is-speaking" : ""}`} aria-label={`Pronounce ${word.german} in German`} title={speaking ? "Playing" : "Listen"} onClick={onPronounce}><Volume2 aria-hidden="true" /></button></td>
  </tr>;
}
