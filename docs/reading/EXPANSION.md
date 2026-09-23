# Everyday reading expansion

The active Stories library contains **104 A1, 150 A2 and 200 B1 stories**
(454 total). The original 72 guided story IDs and course links remain. Another
382 topical stories extend the graded path. The retired template-generated
library is not part of it.

## Reading design

The first four guided sections per level remain the starting path. Additional
sections are organised by situation. Learners can search titles, topic labels
and grammar notes, or filter a situation. Section and
level progress use actual totals, including sections with unequal sizes. Story
completion uses the existing account-synced story ID records. The paused course
still has exactly 24 chapters per level.

A1 stories have 70–200 German words and A2 stories have 200–400. The B1
expansion to 400–800 words is still in editorial review; the current B1
stories remain shorter. Length alone does not establish a CEFR level. A1 uses
concrete events and short exchanges, while A2 connects practical experiences
and reasons. Content is not CEFR-certified or independently teacher-reviewed.

Situations include home, family, school, health and hospital visits, travel,
workplaces, cafés, shopping, colours, animals, nature, weather, cooking, hobbies,
town life, appointments, clothing, plans, technology, sport, services and cultural
encounters. The machine-readable inventory is `expanded-coverage.json`. These are
broad topic domains, not a claim to cover every possible situation or all German
vocabulary.

Grammar notes draw attention to present/past narration, Perfekt, earlier past,
future plans, modal/separable verbs, negation, questions, accusative/dative
contexts, genitive phrases, relative clauses, passive voice, contrast and
hypothetical choices. A note identifies something to notice; it does not certify
mastery. New library scenes link to recall tables, not unrelated course chapters.

Each story has word tooltips, contextual vocabulary forms with exact source
examples, a two-sentence English **gist** (not a full translation), and two
comprehension questions. Authored English situation/outcome statements form the
correct answers. Distractors are drawn from other scenes in the same level,
preferentially the same topic. These are basic recognition checks, not a measure
of independent production. Wrong-answer and naturalness review by a German
teacher remains necessary before making learning-effectiveness claims.

## Authoring and verification

- Edit `content/reading/{a1,a2,b1}.psv` for the story seeds, topics, titles,
  grammar keys and English situation/outcome statements. The extended German
  prose lives in `content/reading/long-stories.json`; the original 72 records
  are updated in `app/lib/reading-path-data.json`. Comma-separated secondary
  topics make cross-topic stories discoverable; the first determines the section.
- Add lexical translations to `content/reading/glosses.psv` or
  `content/reading/generated-glosses.json` after checking the context.
- Run `node scripts/build-reading-expansion.mjs --draft` to regenerate the
  currently publishable A1/A2 catalog, sections, topic labels, glossary and
  coverage inventory. B1 long drafts require `--include-b1-drafts` for local
  review and are not included in this release.
- The final compiler run checks all level word ranges and rejects missing
  glosses. The interim `--draft` run leaves those final-only checks pending.
  It assembles metadata and questions but does not generate story prose. The resumable
  `generate-long-reading-stories.mjs` helper produced drafts with the existing
  Groq account; future edits should be reviewed as prose, not padded for length.
- Source line order assigns IDs beginning at 25 in each level. Preserve that
  order; append future stories. Substantial text replacements need an explicit
  new edition ID and progress decision, not silent line insertion or reordering.
- Test all catalog counts, released level word ranges, unique IDs/text, six-word overlap between scenes,
  complete lexical coverage, vocabulary source spans, question options, filters,
  section membership, last-story routes and old/new progress merges. Check the
  narration hashes separately to prevent mismatched recordings.
- Keep the large expansion in the server catalog. The paused course imports only
  its original 72 stories; client filtering receives summaries rather than prose.

## Audio and publication

The release must include recordings and word timings for all 454 current stories. The
retired 440-story library's larger recordings were removed from the Site archive
to make room; its account progress is preserved. The old library and daily
practice URLs redirect to the current Stories and Active Learning pages.
Archive size is checked before publishing.

## Framework reference

The [Council of Europe CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search)
were checked for communicative reading scope on 2026-09-18. CEFR is used as an
editorial framework, not as a prescribed word-count list or a validation badge.
Teacher review and learner pilots are still outstanding.
