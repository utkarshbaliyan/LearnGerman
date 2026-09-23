# Everyday reading expansion

The active Stories library now contains **104 A1, 150 A2 and 200 B1 stories**
(454 total). The existing 72 stories, IDs, texts, questions, course links and
recordings are unchanged. This release adds 382 independently authored short
scenes; it does not promote the old template-generated library into the graded
path.

## Reading design

The first four guided sections per level remain the starting path. Additional
sections are organised by situation. Learners can search titles, topic labels
and grammar notes, filter a situation, or show only recorded stories. Section and
level progress use actual totals, including sections with unequal sizes. Story
completion uses the existing account-synced story ID records. The paused course
still has exactly 24 chapters per level.

The added scenes are deliberately short: approximately 42–50 whitespace words
at A1, 50–64 at A2 and 60–79 at B1. They supplement the longer guided stories;
length alone does not establish a CEFR level. A1 uses concrete events and short
exchanges, A2 connects practical experiences and reasons, and B1 uses connected
accounts, contrasts, indirect requests and different perspectives. Content is
editorially levelled, not CEFR-certified or independently teacher-reviewed.

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

Each scene has word tooltips, 3–4 contextual vocabulary forms with exact source
examples, a two-sentence English **gist** (not a full translation), and two
comprehension questions. Authored English situation/outcome statements form the
correct answers. Distractors are drawn from other scenes in the same level,
preferentially the same topic. These are basic recognition checks, not a measure
of independent production. Wrong-answer and naturalness review by a German
teacher remains necessary before making learning-effectiveness claims.

## Authoring and verification

- Edit `content/reading/{a1,a2,b1}.psv`: topic(s), title, grammar key, German text,
  English situation, English outcome. `~form=meaning~` marks contextual glosses;
  the compiler removes these markers from visible prose. Comma-separated secondary
  topics make cross-topic scenes discoverable; the first topic determines the section.
- Add lexical translations to `content/reading/glosses.psv`.
- Run `node scripts/build-reading-expansion.mjs` to regenerate the expanded
  catalog, sections, topic labels, glossary and coverage inventory.
- The compiler assembles metadata and questions. It **does not generate German
  prose from templates or call an external AI provider**.
- Source line order assigns IDs beginning at 25 in each level. Preserve that
  order; append future stories. Substantial text replacements need an explicit
  new edition ID and progress decision, not silent line insertion or reordering.
- Test all catalog counts, unique IDs/text, six-word overlap between scenes,
  complete lexical coverage, vocabulary source spans, question options, filters,
  section membership, last-story routes and old/new progress merges. Check the
  original narration hashes separately to prevent mismatched recordings.
- Keep the large expansion in the server catalog. The paused course imports only
  its original 72 stories; client filtering receives summaries rather than prose.

## Audio and publication

Only the original 24 stories in each level have recorded narration. New scenes
show an explicit unavailable state and no broken audio player. No browser voice
is presented as a matching recorded narration. More audio still requires moving
media out of the main Sites archive. This release must be packaged and its
expanded size checked before publishing.

## Framework reference

The [Council of Europe CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search)
were checked for communicative reading scope on 2026-09-18. CEFR is used as an
editorial framework, not as a prescribed word-count list or a validation badge.
Teacher review and learner pilots are still outstanding.
