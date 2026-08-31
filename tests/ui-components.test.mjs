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
