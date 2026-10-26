import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('sitemap covers the published catalog once and excludes private, filtered and retired URLs', async () => {
  const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false, watch: null } });
  try {
    const { default: sitemap } = await vite.ssrLoadModule('/app/sitemap.ts');
    const { READING_STORIES } = await vite.ssrLoadModule('/app/lib/reading-path.ts');
    const entries = sitemap(), urls = new Set(entries.map(row => row.url));
    assert.equal(urls.size, entries.length);
    assert.ok(urls.size > 700);
    const { ALL_GRAMMAR_LESSONS } = await vite.ssrLoadModule('/app/grammar/course.ts');
    for (const lesson of ALL_GRAMMAR_LESSONS.filter(item => item.released)) assert.ok(urls.has(`https://leselaut.com/grammar/lessons/${lesson.id}`));
    for (const story of READING_STORIES) assert.ok(urls.has(`https://leselaut.com/stories/${story.id}`), story.id);
    for (const base of ['/books/a1/der-schluessel-im-blauen-korb', '/books/a2/nicht-nur-ein-profil', '/books/b1/zwischen-hoersaal-und-arbeitswelt']) {
      assert.ok(urls.has(`https://leselaut.com${base}`));
      for (let page = 1; page <= 200; page++) assert.ok(urls.has(`https://leselaut.com${base}/${page}`));
    }
    for (const row of entries) {
      const url = new URL(row.url);
      assert.equal(url.origin, 'https://leselaut.com'); assert.equal(url.search, ''); assert.equal(url.hash, '');
      assert.doesNotMatch(url.pathname, /\/(?:auth|account|api|review|active-learning)(?:\/|$)|unser-leben-in-lindenstadt|chapter-\d/);
      assert.equal(row.lastModified, undefined, 'do not claim every page was edited on each request');
    }
    const { default: robots } = await vite.ssrLoadModule('/app/robots.ts');
    assert.equal(robots().sitemap, 'https://leselaut.com/sitemap.xml');
    assert.equal(robots().rules.allow, '/');
    assert.ok(!robots().rules.disallow.includes('/auth/'), 'crawlers must see the noindex tag');
  } finally { await vite.close(); }
});

test('metadata uses the preferred HTTPS origin and structured data cannot escape its script', async () => {
  const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false, watch: null } });
  try {
    const seo = await vite.ssrLoadModule('/app/lib/seo.ts');
    const metadata = seo.pageMetadata('A1 German stories', 'Read with audio.', '/stories/a1');
    assert.equal(metadata.alternates.canonical, 'https://leselaut.com/stories/a1');
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.openGraph.images[0].url, 'https://leselaut.com/social-card.png');
    assert.equal(seo.PRIVATE_PAGE_METADATA.robots.index, false);
    assert.equal(seo.PRIVATE_PAGE_METADATA.robots.follow, true);
    const unsafe = { name: '</script><script>alert(1)</script>' }, json = seo.serializeStructuredData(unsafe);
    assert.doesNotMatch(json, /</); assert.deepEqual(JSON.parse(json), unsafe);
    const trail = seo.breadcrumbs([{ name: 'Stories', path: '/stories' }, { name: 'A1', path: '/stories/a1' }]);
    assert.equal(trail.itemListElement[1].position, 2);
    assert.equal(trail.itemListElement[1].item, 'https://leselaut.com/stories/a1');
  } finally { await vite.close(); }
});
