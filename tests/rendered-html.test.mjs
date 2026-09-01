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
    assert.match(html, /Chapter mastery/i, pathname);
    assert.match(html, /Story check/i, pathname);
    assert.match(html, /Hover, tap, or focus an underlined word/i, pathname);
    assert.match(html, /core words/i, pathname);
    assert.match(html, /grammar exercises/i, pathname);
    assert.match(html, /Start recording/i, pathname);
    assert.match(html, /corrections, and a clear next step/i, pathname);
    assert.doesNotMatch(html, /AI tutor/i, pathname);
    assert.match(html, /Integrated checkpoint/i, pathname);
    assert.ok(html.indexOf("01 · Story") < html.indexOf("02 · Vocabulary"), pathname);
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
  assert.match(html, /Ich bin neu hier/i);
  assert.match(html, /30 core words/i);
  assert.match(html, /50 grammar exercises/i);
  assert.match(html, /Story check/i);
  assert.match(html, /Hover, tap, or focus an underlined word/i);
  assert.match(html, /Personal pronouns and/i);
  assert.match(html, /Introduce yourself without reading/i);
  assert.match(html, /Write a personal introduction/i);
  assert.match(html, /Submit/i);
  assert.match(html, /course saves only your best skill score/i);
  assert.match(html, /Integrated checkpoint/i);
});

test("rejects incomplete AI tutor submissions before calling the model", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-tutor-validation`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/tutor/writing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ level: "A1", chapter: 1, answer: "Hallo" }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid chapter response/i);
});

test("uses Groq as the primary provider and returns structured writing feedback", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-tutor-feedback`);
  const { default: worker } = await import(workerUrl.href);
  const originalFetch = globalThis.fetch;
  const originalGroqKey = process.env.GROQ_API_KEY;
  let providerRequest;
  let providerUrl;
  process.env.GROQ_API_KEY = "test-key";
  globalThis.fetch = async (input, init) => {
    providerUrl = String(input);
    providerRequest = JSON.parse(init.body);
    return Response.json({ choices: [{ message: { content: JSON.stringify({
      overallScore: 84,
      mastery: true,
      summary: "The task is complete and clear.",
      correctedAnswer: "Ich wohne in Berlin.",
      strengths: ["Clear meaning"],
      corrections: [{ original: "Ich wohnen", corrected: "Ich wohne", explanation: "Use the ich ending -e.", category: "Verb ending" }],
      nextStep: "Repeat the corrected sentence.",
      retryPrompt: "Write the answer once more without looking.",
    }) } }] });
  };
  try {
    const response = await worker.fetch(
      new Request("http://localhost/api/tutor/writing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          level: "A1",
          chapter: 1,
          prompt: "Introduce yourself in German.",
          grammarFocus: "Personal pronouns and sein",
          vocabulary: ["wohnen — to live"],
          answer: "Hallo, ich wohnen in Berlin.",
        }),
      }),
      { GROQ_API_KEY: "test-key", ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.overallScore, 84);
    assert.equal(payload.mastery, true);
    assert.equal(payload.corrections[0].category, "Verb ending");
    assert.equal(providerUrl, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(providerRequest.model, "openai/gpt-oss-120b");
    assert.equal(providerRequest.max_completion_tokens, 3_000);
    assert.equal(providerRequest.reasoning_effort, "low");
    assert.equal(providerRequest.response_format.type, "json_object");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalGroqKey;
  }
});

test("turns provider rate limits into a clear retry message", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-provider-limit`);
  const { default: worker } = await import(workerUrl.href);
  const originalFetch = globalThis.fetch;
  const originalGroqKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "test-key";
  globalThis.fetch = async () => Response.json({ error: { code: "rate_limit_exceeded" } }, { status: 429 });
  try {
    const response = await worker.fetch(
      new Request("http://localhost/api/tutor/writing", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "provider-limit-test" },
        body: JSON.stringify({
          level: "A1",
          chapter: 1,
          prompt: "Introduce yourself in German.",
          grammarFocus: "Personal pronouns and sein",
          vocabulary: ["wohnen — to live"],
          answer: "Hallo, ich heiße Mia und wohne in Berlin.",
        }),
      }),
      { GROQ_API_KEY: "test-key", ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    assert.equal(response.status, 429);
    assert.match((await response.json()).error, /usage limit/i);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalGroqKey;
  }
});

test("preserves the complete story library at its dedicated route", async () => {
  const response = await renderRoute("/stories");

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Learn German/i);
  assert.match(html, /Browse stories/i);
  assert.match(html, /Overall progress/i);
});
