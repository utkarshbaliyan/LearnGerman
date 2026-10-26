# Search visibility and indexing

The preferred public origin is `https://leselaut.com`. AWS continues to host
the application. Search optimization does not change DNS or hosting.

## Implemented on 26 October 2026

- Public pages render their content, titles, descriptions and one absolute
  canonical URL on the server. Canonicals on the CloudFront, `www` and old Sites
  addresses point to the matching apex URL. Compatibility origins remain usable
  so existing browser-only progress is not lost through a forced domain move.
- `/stories` explains the library and links to `/stories/a1`, `/stories/a2`,
  `/stories/b1` and `/stories/b2`. Each level links to every published story at
  that level. Old `?level=` links permanently redirect to the level URL.
- `/course` describes the actual free self-study path and its limits. The home
  page has a visible German-learning introduction and links to the course.
- `/grammar/lessons` links to the existing released lesson explanations. Each
  lesson has a direct URL, server-rendered rules, tables, examples, common
  mistakes and a link to its interactive practice. This exposes existing
  educational content rather than generating search-only pages.
- Story and book pages have individual canonicals and descriptions. Each book
  page has its own canonical; later pages are not canonicalized to page one.
- `/sitemap.xml` is generated from the published story, book, grammar and
  practical-listening catalogs. It includes only preferred public URLs, with
  no invented modification dates, session tokens, filters or retired editions.
- `/robots.txt` allows public crawling and identifies the sitemap. `/api/` is
  excluded. Account, auth and personal-practice pages use `noindex,follow` and
  remain crawlable so search engines can read that instruction. Robots rules
  are not an access-control system; backend authentication is still required.
- Structured data describes the real site, organization, story learning
  resources and breadcrumbs. No reviews, ratings, credentials or certificates
  are invented. The About page describes the beta and editorial limitations.
- Open Graph and Twitter previews use a local 1200×630 PNG. A square PNG favicon
  and Apple touch icon are generated with `scripts/build-social-assets.py`.
- Retired course, book and story content redirects permanently to an explicit
  HTTPS URL, avoiding the old application server's HTTP redirect origin.

## Search Console

The owner verified the `leselaut.com` domain property in Google Search Console
under `professor.ut7@gmail.com`. Keep its Google verification TXT record in DNS.
This record does not route web traffic or move the site away from AWS.

After the checked deployment, submit `https://leselaut.com/sitemap.xml` in
**Indexing → Sitemaps**. Inspect the homepage and the main story/course pages,
test the live URL and request indexing where offered. A sitemap or indexing
request is a discovery signal, not a promise of indexing or ranking. Search
Console's initial reports need time to collect data.

Use Search Console's Performance report to compare actual queries, impressions,
clicks and position over time. Review Pages for excluded URLs and Core Web Vitals
when sufficient field data exists. Do not claim field performance from a local
test or claim a ranking from a single personalized search.

## Search intent

| Search intent | Main page |
| --- | --- |
| Learn German with stories | `/` |
| German stories with audio and English help | `/stories` |
| A1 German stories for beginners | `/stories/a1` |
| Elementary/intermediate German reading | `/stories/a2`, `/stories/b1`, `/stories/b2` |
| Free German self-study course | `/course` |
| German books with audio | `/books` and each reader's contents |
| Specific German grammar rules | `/grammar/lessons` and individual lessons |
| German cases and article endings | `/grammar/cheat-sheets` |
| German vocabulary practice | `/vocabulary` |

First-place rankings for broad competitive terms such as “learn German” cannot
be guaranteed. Continued work should prioritize accurate original material,
independent teaching review, useful corrections and genuine recommendations
from other relevant sites. Avoid paid link schemes, repeated keyword text and
large sets of near-identical pages. Titles and structured data help describe
content; they do not replace it.

## Verification

`tests/seo.test.mjs` checks catalog coverage, canonical origins and safe JSON-LD.
Rendered Worker tests and the AWS standalone smoke test check the actual HTML,
crawler routes, private-page noindex tags, legacy redirects and grammar guides.
GitHub runs the complete suite, both builds and AWS smoke checks before deploy.

Primary references: [Google Search Essentials](https://developers.google.com/search/docs/essentials),
[canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
[sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
