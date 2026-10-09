# Illustrated LeseLaut interface

## Reader word stack

Story and book readers keep the reading column alongside a sticky word stack on
desktop. Word clicks collect displayed forms and meanings; Add to review sends
them to the shared vocabulary deck. On mobile the collapsible stack sits above
the text, with a floating shortcut after collecting a word. The panel supports
both themes and leaves narration, translations, bookmarks and page navigation
available. Vocabulary and Review share the same collected-word progress.

## Today and personal review

Home includes four illustrated section cards for Stories, Grammar, Vocabulary
and Active Learning. The cards explain each activity, show saved progress and
link straight into it; Grammar links to the next available unfinished lesson.
Stories count the current published IDs, Grammar follows its existing required
exercise sets, and Vocabulary matches the complete connected library counts.
Active Learning reports checked sets and first-check sentence activity from the
latest 200 saved sets, including helped practice, rather than a language-level
score. The full word catalog and grammar exercises stay out of the Home client.

The card artwork reuses `reading-room.png` and three checksum-identical existing
illustrations: `home-grammar.webp` from `reading-a2-47-v1`,
`home-vocabulary.webp` from `reading-a1-04-v1`, and `home-active-learning.webp`
from `reading-b1-47-v2`. The extra placements do not exceed three uses per image;
original cover assignments, R2 objects and paused automations remain intact.
Neutral cards have gently tinted image panels and readable status accents in
both themes. The grid becomes one column on mobile.

Home starts with two compact rectangular cards for Flashcards and Review,
with small existing illustrations, saved-word counts and due-review counts.
Flashcards opens the 8/10/12-word size selector or resumes an unfinished round.
Review opens the shared word box with collapsible translation mistakes. Both use
an accessible, scrollable dialog over Home; there is no separate Review tab.
Escape or Close returns focus to the launcher, and pending word/round saves must
finish before closing. The blue size panel and familiar-word action use
the existing palette. Only explicitly reviewed library words and saved reading
words enter the deck; Mark as read updates the shared familiar progress. An
unfinished round can resume, and fresh translation mistakes remain collapsible.

The shared hub starts directly with its compact practice cards. Its introductory banner and
collected-word progress panel are removed from Home; collected-word progress
remains on Vocabulary. A topic illustration sits beside the resumable session,
with sage/lilac/yellow learning evidence cards. Review reuses the book artwork and
retains source labels for library, story and book words. Mistake practice keeps
its peach section and matching topic illustration. The existing atlas also
illustrates the exploration links. All artwork is decorative and reuses already
published assets; no generation, cover reassignment or automation was started.

These learning-page colours sit within the shared platform palette, with separate
dark-theme surfaces, readable actions, and compact illustrations on mobile.
Word progress and review schedules stay shared across sections. Flashcards reveal
answers on demand; the daily session retains its existing behavior.

The current refinement uses warm paper and dark green surfaces, compact navigation,
condensed uppercase headings and a flat four-column story gallery. It takes visual
direction from [Sloeful's German stories](https://www.sloeful.com/german/stories),
with original assets and LeseLaut's existing navigation and learning tools.

## Platform colours

`app/platform-colours.css` provides the shared palette. The active section on the
site header selects a neutral surface with blue accents for Vocabulary, blue for
Grammar and Account, lilac for Active Learning, sage for Stories and Review, and
amber for Today and Books. These
colours carry through navigation, headers, cards, controls and progress panels.
Vocabulary uses neutral headers, library cards and controls, with colour limited
to a subtly highlighted progress panel, practice flashcards and small state cues.
Its accessible pie chart shows learned (marked familiar), review and unlearned in
green, amber and slate, with counts and percentages alongside the slices. Counts
follow the selected level and collection, use the shared vocabulary state, and
exclude search/topic filters. Loading, empty and single-state charts are handled
explicitly; learner data and schedules are unchanged. Grammar
patterns, reference tables and case chips have distinct coloured surfaces. Story
cover frames cycle through the five soft colours without changing artwork.

Both themes use separate readable foregrounds and surfaces. Book pages keep their
existing paper and reading ink. At 320px, Grammar modules, Account forms and case
cheat sheets fit the screen; larger reference tables scroll within their panels.
The connected word stack and all reading and practice actions retain their
existing behavior. No new images, content, migrations or automation changes are
part of this refinement.

Vocabulary pie refinement validation: all 160 tests, TypeScript, the production
build and migration contract passed. Browser checks covered light/dark themes,
320px layouts, level and collected-word counts, and existing practice controls.

Validation: all 152 regression tests passed against the fresh production build,
TypeScript passed, and deployment migrations match source. Browser checks covered
the shared page families, light and dark themes, 320px layouts, vocabulary reveal
and practice controls, grammar lessons, and the reader word stack.

## Original artwork

Created with the built-in ImageGen tool; no external generation API or API key was used. Original generated images are retained in the Codex generated-images directory.

- `public/illustrations/reading-room.png`: reading café hero, 1536 × 1024 pixels.
- `public/illustrations/topic-atlas.png`: transparent 4-column × 3-row atlas used by `app/components/topic-art.tsx`. Twelve reusable illustrations remain available for books and decorative learning-section artwork. Story covers use separate images tied to their individual manuscripts. Decorative artwork is hidden from assistive technology.

Exact hero prompt:

> Use case: illustration-story. Asset type: original website hero illustration for LeseLaut, a German learning platform for adults. Create a charming hand-drawn editorial cartoon of two young adults reading and chatting in a cozy German cafe reading nook: books, headphones on the table, a cup of coffee, a plant, and a tall arched window with simple colorful German town buildings beyond it. Landscape composition, cohesive scene filling the image, clean imperfect black ink outlines, flat soft lilac, pale butter yellow, sage green, coral and warm ivory colors, very subtle paper grain. Friendly sophisticated illustrated magazine style, playful but not childish, generous breathing room, warm light. No lettering, no logos, no watermarks. Original artwork.

Exact atlas prompt:

> Use case: illustration-story. Asset type: one website illustration atlas for LeseLaut, used as twelve reusable topic pictures in an adult German learning library. A precise evenly spaced 4-column by 3-row grid on a genuinely transparent background. Every cell has one isolated centered charming hand-drawn editorial object illustration of equal apparent scale, with generous transparent margins; nothing crosses a cell boundary. Row 1 left to right: a colorful German townhouse; a desk with laptop and little plant; a tram with travel suitcase; a coffee cup with croissant. Row 2: a grocery paper bag with vegetables; an open book with pencil; two friends chatting with empty speech bubbles; a potted plant with sun. Row 3: a bicycle and helmet; a wrapped gift with party pennant; a paint palette with brush; a smartphone with headphones. Clean imperfect dark ink outlines, simple flat lilac, pale butter yellow, sage green, coral and sky blue colors, light paper texture, playful sophisticated contemporary editorial illustration. No text, no words, no captions, no tile borders, no background rectangles, no watermark, no brand logos. Keep the canvas in a 4:3 aspect ratio so all twelve cells are square.

## Typography

Fonts are self-hosted under `public/fonts`, with their SIL Open Font License files. Headings use Bebas Neue. Body copy, reading passages and controls use Noto Sans. The first redesign’s Bricolage Grotesque and DM Sans files are retained.

Official sources:

- [Bebas Neue](https://github.com/google/fonts/tree/main/ofl/bebasneue)
- [Noto Sans](https://github.com/google/fonts/tree/main/ofl/notosans)

## Preservation and verification

The redesign changes presentation and introductory copy. Story IDs, manuscripts, translations, narration, book pages, bookmarks, progress storage, authentication, database migrations and AI quotas retain their existing behavior. Story filters, level controls, grammar exercises and translation practice remain available. The story-level controls derive from the published catalog, including B2 when its release is ready.

Check Stories, Books, Vocabulary, Grammar and Active Learning in the browser, including mobile sizing and both themes. Run the existing test suite and verified production build before publication.

Version 121 validation: all 135 existing tests passed with Node 22; the production build passed and deployment migrations match committed source. Desktop and mobile browser checks covered all five learning sections, story filtering, vocabulary reveal, navigation and light/dark contrast. All 11 protected source, authentication configuration and local learner-data hashes remained unchanged. Existing rendered-route assertions now identify their learning page instead of depending on retired introductory copy.

## Individual story illustrations

The user-approved release contains 307 distinct covers: all 104 A1, all 150 A2 and 53 B1. Further generation was stopped at the user's request. All 654 stories have image covers. At the user’s request, the remaining 347 covers reuse existing illustrations selected for related settings and objects, with at most three appearances per image across the entire catalog. Each of the 307 original assignments is preserved; numbered cover tiles have been removed. Each brief is based on that story’s setting and objects. The chosen style is warm ink outlines with watercolor and colored-pencil texture, transparent surroundings and generous margins. Mountains, streets, cities, homes, trees and animals appear where the manuscript calls for them. Each scene was generated separately with the built-in ImageGen tool.

`content/illustrations/story-art-briefs.json` retains all 654 source briefs for future work. The final `story-art-prompts.json` records each released generation prompt and image checksum. Original and rejected variants are preserved locally. `content/illustrations/story-art-reuse.json` records the 347 reusable cover assignments. `scripts/assign-story-art-covers.mjs` rebuilds the full cover URL map from the unchanged immutable registry; no duplicate uploads are needed. `scripts/finalize-story-art.mjs --partial` builds the authorized 307-image release with all 654 cover assignments, rejects unready or rejected images, and checks dimensions, alpha, byte counts, checksums and duplicate image files. The default full-release mode still requires all 654 distinct original images. Both modes preserve the approved cover assignments and reject missing source images or more than three uses of any illustration.

Images use square frames with `object-fit: contain` and internal padding. Images are stored in the existing R2 bucket through a restricted immutable route, avoiding the source archive size limit. A temporary upload secret is used only for signed writes. Every stored image must be downloaded and checksum-verified by `scripts/upload-story-art.mjs` before the final UI is published.

The combined B2 content release and UI refinement passes 140 tests and the verified production build. Desktop browser checks confirm Noto Sans and Bebas Neue, four columns, whole images, filtering, search, level switching, English translations and quiz retry. The 307 released WebP images preserve their original dimensions and exact decoded alpha; quality is 86. Their original PNGs remain intact.
