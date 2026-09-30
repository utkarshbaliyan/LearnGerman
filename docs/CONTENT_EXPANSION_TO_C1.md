# Content expansion to C1

## Target and current baseline

The target is at least **250 new B2 stories**, **300 new C1 stories**, a catalog of **more than 10,000 useful vocabulary entries**, grammar coverage from A1 through C1, and at least **one B2 book and one C1 book**. Length and format for those books remain editorial decisions. Do not publish empty level tabs.

Run `node scripts/audit-content-readiness.mjs` before each content release. On 2026-09-30 the catalog has 104 A1, 150 A2 and 200 B1 stories; 4,123 vocabulary cards (871 A1, 1,100 A2, 2,152 B1), representing 4,114 distinct headword–meaning strings before editorial deduplication; 72 released grammar lessons (24 per level); and one 200-page A1 book. There are 454 story audio entries. The source audio directory occupies about 105 MiB. These are inventory counts, not measures of learning or CEFR certification.

All **200 B1 stories** currently fall below the new 600–800-word editorial target; their median length is 68 words. This is a material progression gap. Prioritize revising and reviewing the B1 texts before treating them as a bridge to B2. Preserve existing progress; if a revision materially changes a story, version it and explicitly decide how old completion records carry forward.

## Release order

1. **Editorial foundation:** audit B1 texts and grammar coverage against a topic/skill matrix. Revise B1 in reviewed batches, with accurate translations, contextual glosses, comprehension questions and refreshed narration. Pilot with learners and a qualified German reviewer. Word length is a planning constraint, never proof of level.
2. **Storage and delivery:** move new narration and timing assets to object storage/CDN before large expansion, then verify caching, latency, costs and recovery. The current local `dist` is about 118 MiB and hosting has a 256 MiB expanded limit; keeping hundreds of new recordings inside the package is not a viable long-term approach. Preserve old URLs or provide stable redirects for saved progress and bookmarks.
3. **B2 batches:** extend level-aware data types, routing, filters and tests when the first *complete* B2 batch is ready. Publish in reviewed groups with stable IDs, text, sentence translations, word meanings, questions and matching narration. Continue until the new B2 count reaches 250.
4. **C1 batches:** add longer, more complex genres and register variation after the B2 path is usable. Use the same complete-asset and review gates until 300 new C1 stories are live. Planned total: 1,004 stories, assuming the current 454 remain.
5. **Vocabulary:** define the target as more than 10,000 editorially distinct headword–meaning entries across A1–C1. Inflected forms and duplicate cards do not inflate the count; phrases are tagged and counted separately. Review gender/plural or principal verb forms, level placement, translations and natural example sentences. Expand server-side search/pagination before loading the catalog into the client, and preserve stable card IDs and review history.
6. **Grammar and books:** build a coverage matrix of form, meaning, register, common errors and communicative tasks from A1–C1. Add B2/C1 lessons with explanation, examples, exercises and applied reading links; review old levels for omissions. Add at least one level-appropriate book at each of B2 and C1 as a self-contained volume with chapters, translation, glosses, continuous audio and bookmarks. Set book lengths editorially; a page count alone does not establish level.

## Publication gates

Every release must pass schema/ID checks, story length and duplication checks, exact translation/text matching, glossary coverage, audio source hashes and timing validation, relevant automated tests, and build/package-size checks. Sample automated output for manual review and record corrections. Have a qualified German reviewer assess representative texts, explanations, translations, distractors and level progression before claiming instructional quality. Check the live route and progress preservation after deployment.

Use the [Council of Europe CEFR Companion Volume](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions) and its [reading descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors) to define reading outcomes; the framework does not prescribe a fixed story length or 10,000-word list. Use [Goethe B2](https://www.goethe.de/ins/de/en/prf/prf/gzb2/ue9.html) and [C1](https://www.goethe.de/ins/de/de/prf/prf/gzc1/u24.html) model materials as independent task/genre references, not as content to copy or a claim of exam equivalence.
