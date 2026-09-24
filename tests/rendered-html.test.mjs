import assert from "node:assert/strict";
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

test("opens Stories as home while the integrated course is paused", async () => {
  const response = await renderRoute("/");
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, "/stories");
  const stories = await renderRoute("/stories");
  assert.equal(stories.status, 200);
  const html = await stories.text();
  assert.match(html, /Grow from simple scenes to connected German stories/);
  assert.match(html, /Active Learning/);
  assert.doesNotMatch(html, /<span>Course<\/span>/);
});

test("A1 Books keeps the source page format with four audio controls and no questions", async () => {
  const index = await renderRoute('/books');
  assert.equal(index.status, 200);
  const indexHtml = await index.text();
  assert.match(indexHtml, /Der Schlüssel im blauen Korb/);
  assert.match(indexHtml, /Start reading/);
  assert.doesNotMatch(indexHtml, /200 pages · 10 chapters/);
  assert.match(indexHtml, /href="\/books\/a1\/der-schluessel-im-blauen-korb\/1"/);
  assert.match(indexHtml, /href="\/books\/a1\/der-schluessel-im-blauen-korb\/21"/);
  assert.equal((indexHtml.match(/class="book-chapter-item"/g) ?? []).length, 10);
  assert.doesNotMatch(indexHtml, /Read a whole book in German|Follow Mia and her family through 200 pages|Die neue Straße/);
  for (const page of [1, 200]) {
    const response = await renderRoute(`/books/a1/der-schluessel-im-blauen-korb/${page}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.equal((html.match(/<audio /g) ?? []).length, 4, `page ${page}: one player per paragraph`);
    assert.equal((html.match(/class="book-paragraph"/g) ?? []).length, 4);
    assert.equal((html.match(/class="book-paragraph-summary"/g) ?? []).length, 4, `page ${page}: one English summary per paragraph`);
    assert.match(html, /Bookmark this page/);
    assert.doesNotMatch(html, /In English ·/);
    assert.match(html, /Hover over or tap a word for its English meaning/);
    assert.doesNotMatch(html, /Reading practice|Check my answers|Two small questions/);
  }
  assert.equal((await renderRoute('/books/a1/der-schluessel-im-blauen-korb/201')).status, 404);
  const oldPage = await renderRoute('/books/a1/unser-leben-in-lindenstadt/21');
  assert.equal(oldPage.status, 307);
  assert.equal(new URL(oldPage.headers.get('location'), 'http://localhost').pathname, '/books/a1/der-schluessel-im-blauen-korb/21');
});

test("old chapter bookmarks open their matching stories", async () => {
  for (const pathname of [
    "/course/a1/chapter-1",
    "/course/a1/chapter-2",
    "/course/a1/chapter-24",
    "/course/a2/chapter-1",
    "/course/a2/chapter-24",
    "/course/b1/chapter-1",
    "/course/b1/chapter-24",
  ]) {
    const response = await renderRoute(pathname);
    assert.equal(response.status, 307, pathname);
    const match = /\/course\/(a1|a2|b1)\/chapter-(\d+)/.exec(pathname);
    assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname,
      `/stories/reading-${match[1]}-${match[2].padStart(2, "0")}-v1`);
  }
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

test("retired library and daily practice bookmarks redirect to current learning", async () => {
  for (const [from, to] of [["/stories/previous", "/stories"], ["/practice", "/active-learning"]]) {
    const response = await renderRoute(from);
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, to);
  }
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
    const response = await renderRoute(`/active-learning/${taskId}?mode=speaking`); assert.equal(response.status, 200); const taskHtml = await response.text(); assert.ok(taskHtml.includes(prompt)); assert.doesNotMatch(taskHtml, /Prepare your first German answer|A little help before you start|Listen to example|Review the phrases|Hear question|Correction report/);
  }
  const writing = await renderRoute("/active-learning/active-a1-m01-l01-v1?mode=writing"); assert.equal(writing.status, 200); const writingHtml = await writing.text(); assert.match(writingHtml, /Write one sentence telling a new classmate your name/); assert.doesNotMatch(writingHtml, /Prepare your first German answer|My name is Lina|Listen to the example|Correction report/);
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
    assert.match(html, /Grow from simple scenes to connected German stories/); assert.doesNotMatch(html, /Previous story library/);
    assert.ok(html.includes(`reading-${level.toLowerCase()}-01-v1`));
  }
  for (const id of ["reading-a1-01-v1", "reading-a2-18-v1", "reading-b1-24-v1"]) {
    const response = await renderRoute(`/stories/${id}`); assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /What happened/); assert.match(html, /Need the gist in English/);
    assert.match(html, /Check my answers/); assert.match(html, /Practice this grammar/);
    assert.match(html, /href="\/grammar\?lesson=/);
    assert.doesNotMatch(html, /src=["'][^"']*story-\d+\.webm/);
    assert.match(html, /<audio[^>]+\/audio\/reading\/reading-/);
    assert.match(html, /aria-label="Narration speed"/);
    assert.match(html, /data-reading-word="0"/);
    assert.doesNotMatch(html, /Device voice/);
  }
  for (const [level, total] of [['a1',104],['a2',150],['b1',200]]) {
    const response = await renderRoute(`/stories/reading-${level}-${total}-v1`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /What happened/);
    assert.match(html, /Open grammar recall tables/);
    assert.match(html, /<audio[^>]+\/audio\/reading\/reading-/);
    assert.doesNotMatch(html, /Narration is unavailable/);
    assert.ok(html.replace(/<!--.*?-->/gs, "").includes(`${total}/${total}`));
  }
  assert.equal((await renderRoute('/stories/reading-a1-999-v1')).status, 404);
});

test('practical reading and listening samples are linked and render accessible first activities', async()=>{
 const index=await renderRoute('/stories/practice');assert.equal(index.status,200);assert.match(await index.text(),/Choosing accommodation/);
 for(const id of ['reception-a1-01-v1','reception-a2-18-v1','reception-b1-04-v1']){
  const response=await renderRoute(`/stories/practice/${id}`);assert.equal(response.status,200);const html=await response.text();
  assert.match(html,/Practical reading/);assert.match(html,/Check my understanding/);assert.match(html,/seven days later/);assert.match(html,/English word help/);
 }
 const missing=await renderRoute('/stories/practice/not-a-lesson');assert.equal(missing.status,404);
 const story=await renderRoute('/stories/reading-a2-18-v1');assert.match(await story.text(),/\/stories\/practice\/reception-a2-18-v1/);
});
