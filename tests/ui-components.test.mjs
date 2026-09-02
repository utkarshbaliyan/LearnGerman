import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: {
    middlewareMode: true,
    watch: { ignored: ["**/.sites-runtime/**", "**/.next/**", "**/dist/**"] },
  },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

function contrastRatio(foreground, background) {
  const channels = (hex) => hex.match(/[a-f\d]{2}/gi).map((part) => {
    const value = Number.parseInt(part, 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = (hex) => {
    const [red, green, blue] = channels(hex);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("emits the catalog's animation and scrolling utilities", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /--tw-enter-opacity/);
  assert.match(css, /scrollbar-width:\s*thin/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /scroll-fade-reveal-b/);
  assert.match(css, /mask-image:/);
  assert.match(css, /tw-shimmer/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);

  const globals = await readFile(path.join(root, "app/globals.css"), "utf8");
  assert.match(
    globals,
    /html\[data-theme="dark"\] \.level-switcher button\.is-active\s*\{[^}]*background:\s*#090a0d;[^}]*color:\s*#f7f7f8;/s,
  );
  assert.match(
    globals,
    /html\[data-theme="dark"\] \.level-switcher button\.is-active :where\(b, span\)\s*\{\s*color:\s*#f7f7f8;/,
  );
});

test("keeps shared button and inverse-surface colors readable in both themes", async () => {
  const globals = await readFile(path.join(root, "app/globals.css"), "utf8");
  const button = await readFile(path.join(root, "components/ui/button.tsx"), "utf8");

  assert.ok(contrastRatio("#ffffff", "#315ee8") >= 4.5);
  assert.ok(contrastRatio("#0c1224", "#83a3ff") >= 4.5);
  assert.ok(contrastRatio("#f7f7f8", "#171719") >= 4.5);
  assert.ok(contrastRatio("#f7f7f8", "#090a0d") >= 4.5);
  assert.match(globals, /button:not\(\[data-slot="button"\]\)/);
  assert.match(globals, /\[data-slot="button"\]:disabled\s*\{[^}]*background:\s*var\(--muted\)[^}]*color:\s*var\(--muted-foreground\)[^}]*opacity:\s*1/s);
  assert.doesNotMatch(button, /disabled:opacity-50/);
});

test("synchronizes equivalent vocabulary and grammar mastery across routes", async () => {
  const {
    emptyVocabularyProgress,
    isVocabularyLearned,
    mergeGrammarProgressWithCourse,
    readCourseProgress,
    readGrammarProgress,
    readVocabularyProgress,
    setVocabularyStatus,
    syncGrammarLessonToCourse,
    syncGrammarLessonToLibrary,
    writeVocabularyProgress,
  } = await vite.ssrLoadModule("/app/lib/progress-sync.ts");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const catalogWord = { id: "a1-001", german: "der Name", english: "name" };
  const chapterWord = { id: "name", german: "der Name, die Namen", english: "name" };

  writeVocabularyProgress(storage, setVocabularyStatus(emptyVocabularyProgress(), chapterWord, "learned"));
  assert.equal(isVocabularyLearned(readVocabularyProgress(storage, [catalogWord]), catalogWord), true);

  values.set("leselaut:vocabulary:a1-b1", JSON.stringify({ completed: ["a1-001"], review: [] }));
  values.delete("leselaut:vocabulary-progress:v2");
  const migrated = readVocabularyProgress(storage, [catalogWord]);
  assert.equal(isVocabularyLearned(migrated, chapterWord), true);
  writeVocabularyProgress(storage, setVocabularyStatus(migrated, catalogWord, "unlearned"));
  assert.equal(isVocabularyLearned(readVocabularyProgress(storage, [catalogWord]), chapterWord), false);

  values.set("leselaut:vocabulary-progress:v2", JSON.stringify({ learnedKeys: ["de:lernt"], reviewKeys: [], legacyMigrated: true }));
  assert.equal(
    isVocabularyLearned(readVocabularyProgress(storage), { german: "lernen", english: "to learn" }),
    true,
  );

  syncGrammarLessonToLibrary(storage, "a1-1-1", { Recognition: 88 }, 88, false);
  assert.equal(readGrammarProgress(storage).sets["a1-1-1"].Recognition, 88);

  syncGrammarLessonToCourse(storage, "a1-1-1", { Production: 92 }, 92);
  const course = readCourseProgress(storage);
  assert.equal(course.chapters["a1-1-1"].grammarSets.Production, 92);
  const merged = mergeGrammarProgressWithCourse(readGrammarProgress(storage), course, {
    "a1-1-1": ["Recognition", "Production"],
  });
  assert.equal(merged.completed.includes("a1-1-1"), true);
  assert.equal(merged.scores["a1-1-1"], 92);
});

test("gives every transferable course vocabulary item a standalone card", async () => {
  const { getCourseChapter, COURSE_LEVELS, CHAPTERS_PER_LEVEL } = await vite.ssrLoadModule(
    "/app/course/course-data.ts",
  );
  const { ALL_VOCABULARY } = await vite.ssrLoadModule("/app/vocabulary/data.ts");
  const { vocabularyProgressKeys } = await vite.ssrLoadModule("/app/lib/progress-sync.ts");
  const catalogKeys = new Set(ALL_VOCABULARY.flatMap(vocabularyProgressKeys));
  const unmatched = [];

  for (const level of COURSE_LEVELS) {
    for (let number = 1; number <= CHAPTERS_PER_LEVEL; number += 1) {
      const chapter = getCourseChapter(level, number);
      for (const word of chapter.vocabulary) {
        if (!vocabularyProgressKeys(word).some((key) => catalogKeys.has(key))) {
          unmatched.push(`${level}-${number}: ${word.german} — ${word.english}`);
        }
      }
    }
  }

  assert.deepEqual(unmatched, [
    "A1-7: Ben — Ben",
    "A1-22: Bonn — Bonn",
    "B1-2: Ben — Ben",
    "B1-19: Ben — Ben",
  ]);
});

test("provides a deduplicated vocabulary catalog with infinitive verb headwords", async () => {
  const {
    ALL_VOCABULARY,
    TOTAL_VOCABULARY_TARGET,
    VOCABULARY_LEVEL_COUNTS,
    vocabularyVerbLemmaKey,
    vocabularyVerbType,
    vocabularyWordClass,
  } = await vite.ssrLoadModule("/app/vocabulary/data.ts");
  const word = (german, english, category) => ({ id: "test", german, english, category, level: "B1" });

  assert.equal(TOTAL_VOCABULARY_TARGET, 5000);
  assert.equal(ALL_VOCABULARY.length, 4545);
  assert.deepEqual(VOCABULARY_LEVEL_COUNTS, { A1: 860, A2: 988, B1: 2697, all: 4545 });
  assert.equal(new Set(ALL_VOCABULARY.map((item) => item.id)).size, ALL_VOCABULARY.length);

  const verbs = ALL_VOCABULARY.filter((item) => vocabularyWordClass(item) === "verb");
  assert.ok(verbs.every((item) => item.english.toLocaleLowerCase("en").startsWith("to ")));
  assert.equal(new Set(verbs.map(vocabularyVerbLemmaKey)).size, verbs.length);
  assert.deepEqual(
    verbs.filter((item) => /lern/i.test(item.german)).map(({ english, german }) => ({ english, german })),
    [{ english: "to learn", german: "lernen" }],
  );
  assert.ok(!ALL_VOCABULARY.some((item) => item.german === "lernt" || item.german === "läuft"));

  assert.equal(vocabularyWordClass(word("die Entscheidung", "decision", "Grundlagen & Kommunikation")), "noun");
  assert.equal(vocabularyWordClass(word("du", "you", "Grundlagen & Kommunikation")), "pronoun");
  assert.equal(vocabularyWordClass(word("sorgfältig", "carefully", "Adjektive & Adverbien")), "adverb");
  assert.equal(vocabularyWordClass(word("obwohl", "although", "Grundlagen & Kommunikation")), "conjunction");
  assert.equal(vocabularyVerbType(word("müssen", "must", "Verben")), "modal");
  assert.equal(vocabularyVerbType(word("anmelden", "to register", "Verben")), "separable");
  assert.equal(vocabularyVerbType(word("sich beschweren", "to complain", "Verben")), "reflexive");
  assert.equal(vocabularyVerbType(word("gehen", "to go", "Verben")), "strong-irregular");
  assert.equal(vocabularyVerbType(word("lernen", "to learn", "Verben")), "regular-other");
});

test("renders advanced vocabulary progress, grammar, and sorting controls", async () => {
  const { default: VocabularyPage } = await vite.ssrLoadModule("/app/vocabulary/page.tsx");
  const html = renderToStaticMarkup(React.createElement(VocabularyPage));

  assert.match(html, /4,545 words/);
  assert.match(html, /Not learned/);
  assert.match(html, /Advanced filters/);
  assert.match(html, /aria-label="Filter by word class"/);
  assert.match(html, /aria-label="Filter by verb type"/);
  assert.match(html, /aria-label="Sort vocabulary"/);
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});

test("rotates vocabulary quiz questions without changing mastery progress", async () => {
  const {
    advanceVocabularyQuiz,
    buildVocabularyQuiz,
    startVocabularyQuiz,
  } = await vite.ssrLoadModule("/app/vocabulary/quiz.ts");
  const { ALL_VOCABULARY } = await vite.ssrLoadModule("/app/vocabulary/data.ts");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  const firstCursor = startVocabularyQuiz(storage, () => 19);
  const firstQuiz = buildVocabularyQuiz(ALL_VOCABULARY, firstCursor);
  const refreshedCursor = startVocabularyQuiz(storage, () => 999);
  const refreshedQuiz = buildVocabularyQuiz(ALL_VOCABULARY, refreshedCursor);
  const nextCursor = advanceVocabularyQuiz(storage, refreshedCursor);
  const nextQuiz = buildVocabularyQuiz(ALL_VOCABULARY, nextCursor);

  assert.equal(firstCursor.seed, refreshedCursor.seed);
  assert.equal(refreshedCursor.round, firstCursor.round + 1);
  assert.notEqual(firstQuiz.word.id, refreshedQuiz.word.id);
  assert.notEqual(refreshedQuiz.word.id, nextQuiz.word.id);
  assert.equal(new Set(refreshedQuiz.choices.map((choice) => choice.german)).size, refreshedQuiz.choices.length);

  const pageSource = await readFile(path.join(root, "app/vocabulary/page.tsx"), "utf8");
  assert.doesNotMatch(pageSource, /set(?:Learned|Review)\(quiz\.word/);
});

test("renders story translations through collision-aware tooltips", async () => {
  const { StoryReader } = await vite.ssrLoadModule(
    "/app/components/story-reader.tsx",
  );
  const { Dialog } = await vite.ssrLoadModule(
    "/components/ui/dialog.tsx",
  );
  const { getCurriculum } = await vite.ssrLoadModule(
    "/app/curriculum/index.ts",
  );
  const curriculum = getCurriculum("A1");
  const html = renderToStaticMarkup(
    React.createElement(
      Dialog,
      { open: true },
      React.createElement(StoryReader, {
        curriculum,
        story: curriculum.stories[0],
        completed: false,
        onComplete() {},
        onStoryChange() {},
        onToggleComplete() {},
      }),
    ),
  );

  assert.match(html, /data-slot="tooltip-trigger"/);
  assert.match(html, /aria-label="[^"]+: [^"]+"/);
  assert.doesNotMatch(html, /word-gloss/);
  const source = await readFile(
    path.join(root, "app/components/story-reader.tsx"),
    "utf8",
  );
  assert.match(source, /collisionPadding=\{12\}/);
});

test("keeps the grammar roadmap and released lessons complete", async () => {
  const { ALL_GRAMMAR_LESSONS, GRAMMAR_MODULES, LIVE_GRAMMAR_LESSONS } = await vite.ssrLoadModule(
    "/app/grammar/course.ts",
  );
  const released = ALL_GRAMMAR_LESSONS.filter((lesson) => lesson.released);
  const exercises = Object.values(LIVE_GRAMMAR_LESSONS).flatMap((lesson) => lesson.exercises);

  assert.equal(GRAMMAR_MODULES.length, 12);
  assert.equal(ALL_GRAMMAR_LESSONS.length, 72);
  assert.equal(released.length, 72);
  assert.equal(Object.keys(LIVE_GRAMMAR_LESSONS).length, 72);
  for (const lesson of Object.values(LIVE_GRAMMAR_LESSONS)) {
    assert.equal(lesson.exercises.length, 50, `${lesson.id} should contain 50 exercises`);
    assert.equal(new Set(lesson.exercises.map((exercise) => exercise.group)).size, 5, `${lesson.id} should contain five practice sets`);
    for (const group of new Set(lesson.exercises.map((exercise) => exercise.group))) {
      assert.equal(lesson.exercises.filter((exercise) => exercise.group === group).length, 10, `${lesson.id} practice sets should contain ten exercises`);
    }
    for (const exercise of lesson.exercises.filter((item) => item.type === "choice")) {
      assert.ok(exercise.options.includes(exercise.answer), `${exercise.id} should offer its correct answer`);
    }
  }
  for (const lesson of Object.values(LIVE_GRAMMAR_LESSONS)) {
    const lessonId = lesson.id;
    assert.ok(lesson.explanation.length >= 6, `${lessonId} should provide a full explanation`);
    assert.ok(lesson.tables.length >= 3, `${lessonId} should provide reference tables`);
    assert.ok(lesson.sections.length >= 3, `${lessonId} should provide deep-dive sections`);
  }
  assert.equal(exercises.length, 3600);
  assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, exercises.length);
  assert.deepEqual(
    [...new Set(exercises.map((exercise) => exercise.type))].sort(),
    ["choice", "correction", "fill", "order", "production", "translation"],
  );
});
