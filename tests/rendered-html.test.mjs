import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function renderRoute(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the 72-chapter mastery course as the English home", async () => {
  const response = await renderRoute("/");

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<html[^>]*\blang=["']en["']/i);
  assert.match(html, /Learn every skill/i);
  assert.match(html, /Master every level/i);
  assert.match(html, /A1–B1 · 72 chapters/i);
  assert.match(html, /A1, A2, and B1 now contain 72 complete/i);
  assert.match(html, /Begin A1 Chapter 1/i);
  assert.match(html, /href=["']\/stories["']/i);
});

test("keeps the complete grammar database out of ordinary course client bundles", async () => {
  const manifestUrl = new URL("../dist/client/.vite/manifest.json", import.meta.url);
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));

  async function transitiveBytes(entryKey) {
    const visited = new Set();

    async function visit(key) {
      const entry = manifest[key];
      if (!entry || visited.has(entry.file)) return;
      visited.add(entry.file);
      await Promise.all((entry.imports ?? []).map(visit));
    }

    await visit(entryKey);
    const sizes = await Promise.all([...visited].map(async (file) => {
      const assetUrl = new URL(`../dist/client/${file}`, import.meta.url);
      return (await stat(assetUrl)).size;
    }));
    return sizes.reduce((sum, size) => sum + size, 0);
  }

  assert.ok(
    (await transitiveBytes("app/components/course-home.tsx")) < 400_000,
    "the course home should not download all 3,600 grammar exercises",
  );
  assert.ok(
    (await transitiveBytes("app/components/integrated-course-chapter.tsx")) < 600_000,
    "a chapter should ship only its own grammar exercises",
  );
});

test("renders representative integrated chapters across A1, A2, and B1", async () => {
  for (const pathname of [
    "/course/a1/chapter-2",
    "/course/a1/chapter-24",
    "/course/a2/chapter-1",
    "/course/a2/chapter-24",
    "/course/b1/chapter-1",
    "/course/b1/chapter-24",
  ]) {
    const response = await renderRoute(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, /Chapter practice/i, pathname);
    assert.match(html, /Listening practice/i, pathname);
    assert.match(html, /Reading practice/i, pathname);
    assert.ok(html.indexOf("What did you hear?") < html.indexOf("Open the story for reading or listening help"), pathname);
    assert.match(html, /Tap a word for its meaning/i, pathname);
    assert.match(html, /core words/i, pathname);
    assert.match(html, /grammar exercises/i, pathname);
    assert.match(html, /Try it aloud/i, pathname);
    assert.match(html, /Sign in/i, pathname);
    assert.doesNotMatch(html, /AI tutor/i, pathname);
    assert.match(html, /Integrated checkpoint/i, pathname);
    assert.ok(html.indexOf("01 · Listening and reading") < html.indexOf("02 · Vocabulary"), pathname);
    assert.ok(html.indexOf("02 · Vocabulary") < html.indexOf("03 · Grammar"), pathname);
    assert.ok(html.indexOf("03 · Grammar") < html.indexOf("04 · Writing"), pathname);
    assert.ok(html.indexOf("04 · Writing") < html.indexOf("05 · Speaking"), pathname);
    assert.ok(html.indexOf("05 · Speaking") < html.indexOf("06 · Integrated checkpoint"), pathname);
  }
});

test("renders A1 Chapter 1 as one integrated six-skill course chapter", async () => {
  const response = await renderRoute("/course/a1/chapter-1");

  assert.equal(response.status, 200);
  const html = (await response.text()).replace(/<!--.*?-->/g, "");
  assert.match(html, /Hallo, Mia!/i);
  assert.match(html, /3 core words/i);
  assert.match(html, /50 grammar exercises/i);
  assert.match(html, /Listening practice/i);
  assert.match(html, /Tap a word for its meaning/i);
  assert.match(html, /Personal pronouns and/i);
  assert.match(html, /Say hello/i);
  assert.match(html, /Introduce yourself with your name/i);
  assert.match(html, /Try it aloud/i);
  assert.match(html, /2 short sentences/i);
  assert.match(html, /Integrated checkpoint/i);
});

test("writing tutor requires account authentication before invoking a provider", async () => {
  const { default: worker } = await import(new URL("../dist/server/index.js", import.meta.url).href);
  const response = await worker.fetch(new Request("http://localhost/api/tutor/writing", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ taskId: "a2-1-1", action: "check", answer: "Ich wohne in Berlin." }),
  }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /Sign in/);
});

test("preserves the complete story library at its dedicated route", async () => {
  const response = await renderRoute("/stories/previous");

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Learn German/i);
  assert.match(html, /Browse stories/i);
  assert.match(html, /Overall progress/i);
});

test("grammar exposes complete, accessible case recall tables without loading exercises", async () => {
  const response = await renderRoute("/grammar/cheat-sheets");
  assert.equal(response.status, 200);
  const html = (await response.text()).replace(/<!--.*?-->/g, "");
  assert.match(html, /German case cheat sheets/);
  for (const id of ["articles", "indefinite", "negative", "personal", "reflexive", "possessive-articles", "possessive-pronouns", "demonstratives", "relative", "adjectives-weak", "adjectives-mixed", "adjectives-strong", "nouns", "weak-nouns", "prepositions", "two-way", "verbs"]) {
    assert.ok(html.includes(`id="${id}"`), `Missing ${id} sheet`);
    assert.ok(html.includes(`href="#${id}"`), `Missing ${id} navigation`);
  }
  assert.equal((html.match(/<table>/g) ?? []).length, 22);
  assert.match(html, /scope="col"/);
  assert.match(html, /scope="row"/);
  assert.match(html, /Movement alone does not mean accusative/);
  assert.match(html, /Genitive personal pronouns are formal or literary/);
  assert.match(html, /denen/);
  assert.match(html, /des Herzens/);
  assert.doesNotMatch(html, /Choose your practice set/);
  const grammar = await renderRoute("/grammar");
  assert.match(await grammar.text(), /href="\/grammar\/cheat-sheets"/);
});


test("renders the Active Learning map and all levels with server-owned tasks", async () => {
  const home = await renderRoute("/active-learning"); assert.equal(home.status, 200);
  const html = await home.text(); assert.match(html, /German you can use/); assert.match(html, /active-a1-m01-l01-v1/); assert.match(html, /active-a1-m01-check-v1/);
  for (const [taskId, prompt] of [["active-a1-m01-l01-v1", "Wie heißt du"], ["active-a2-m09-l03-v1", "Termin verschieben"], ["active-b1-m12-l04-v1", "gemeinsamen Tag"], ["active-a1-m01-review-v1", "Bibliothek"]]) {
    const response = await renderRoute(`/active-learning/${taskId}?mode=speaking`); assert.equal(response.status, 200); assert.ok((await response.text()).includes(prompt));
  }
  const writing = await renderRoute("/active-learning/active-a1-m01-l01-v1?mode=writing"); assert.equal(writing.status, 200); assert.match(await writing.text(), /My name is Lina/);
  const checkpoint = await renderRoute("/active-learning/active-a1-m01-check-v1?mode=writing");
  const checkpointHtml = await checkpoint.text();
  assert.equal(checkpoint.status, 200); assert.match(checkpointHtml, /new online German group/);
  assert.doesNotMatch(checkpointHtml, /A little help before you start|Listen to the example|Review the phrases/);
  assert.equal((await renderRoute("/active-learning/active-a1-m99-l01-v1")).status, 404);
  assert.equal((await renderRoute("/api/active-learning/progress")).status, 401);
});


test("renders the graded reading path and independent story pages", async () => {
  for (const level of ["A1", "A2", "B1"]) {
    const response = await renderRoute(`/stories?level=${level}`); assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /One short story at a time/); assert.match(html, /Previous story library/);
    assert.ok(html.includes(`reading-${level.toLowerCase()}-01-v1`));
  }
  for (const id of ["reading-a1-01-v1", "reading-a2-18-v1", "reading-b1-24-v1"]) {
    const response = await renderRoute(`/stories/${id}`); assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /What happened/); assert.match(html, /Need the gist in English/);
    assert.match(html, /Check my answers/); assert.match(html, /Use this story in the course/);
    assert.doesNotMatch(html, /src=["'][^"']*story-\d+\.webm/);
  }
  assert.equal((await renderRoute('/stories/reading-a1-25-v1')).status, 404);
});

test('practical reading and listening samples are linked and render accessible first activities', async()=>{
 const index=await renderRoute('/stories/practice');assert.equal(index.status,200);assert.match(await index.text(),/Choosing accommodation/);
 for(const id of ['reception-a1-01-v1','reception-a2-18-v1','reception-b1-04-v1']){
  const response=await renderRoute(`/stories/practice/${id}`);assert.equal(response.status,200);const html=await response.text();
  assert.match(html,/Practical reading/);assert.match(html,/Check my understanding/);assert.match(html,/seven days later/);assert.match(html,/English word help/);
 }
 const missing=await renderRoute('/stories/practice/not-a-lesson');assert.equal(missing.status,404);
 const chapter=await renderRoute('/course/a2/chapter-18');assert.match(await chapter.text(),/\/stories\/practice\/reception-a2-18-v1/);
});
