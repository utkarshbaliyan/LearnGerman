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
    assert.match(html, /Chapter mastery/i, pathname);
    assert.match(html, /Listening check/i, pathname);
    assert.match(html, /core words/i, pathname);
    assert.match(html, /grammar exercises/i, pathname);
    assert.match(html, /Start private recording/i, pathname);
    assert.match(html, /Integrated checkpoint/i, pathname);
  }
});

test("renders A1 Chapter 1 as one integrated six-skill course chapter", async () => {
  const response = await renderRoute("/course/a1/chapter-1");

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Ich bin neu hier/i);
  assert.match(html, /30 core words/i);
  assert.match(html, /50 grammar exercises/i);
  assert.match(html, /Listening check/i);
  assert.match(html, /Personal pronouns and/i);
  assert.match(html, /Introduce yourself without reading/i);
  assert.match(html, /Write a personal introduction/i);
  assert.match(html, /Integrated checkpoint/i);
});

test("preserves the complete story library at its dedicated route", async () => {
  const response = await renderRoute("/stories");

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Learn German/i);
  assert.match(html, /Browse stories/i);
  assert.match(html, /Overall progress/i);
});
