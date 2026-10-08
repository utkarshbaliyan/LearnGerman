# Illustrated LeseLaut interface

The October 2026 redesign uses warm ivory surfaces, purple controls, pastel topic artwork and illustrated story cards. It takes visual direction from [Sloeful's German stories](https://www.sloeful.com/german/stories), with original assets and LeseLaut's existing navigation and learning tools.

## Original artwork

Created with the built-in ImageGen tool; no external generation API or API key was used. Original generated images are retained in the Codex generated-images directory.

- `public/illustrations/reading-room.png`: reading café hero, 1536 × 1024 pixels.
- `public/illustrations/topic-atlas.png`: transparent 4-column × 3-row atlas used by `app/components/topic-art.tsx`. Twelve reusable illustrations cover home, work, travel, food, shopping, study, conversation, nature, sport, celebration, culture and technology. Decorative cards hide this artwork from assistive technology.

Exact hero prompt:

> Use case: illustration-story. Asset type: original website hero illustration for LeseLaut, a German learning platform for adults. Create a charming hand-drawn editorial cartoon of two young adults reading and chatting in a cozy German cafe reading nook: books, headphones on the table, a cup of coffee, a plant, and a tall arched window with simple colorful German town buildings beyond it. Landscape composition, cohesive scene filling the image, clean imperfect black ink outlines, flat soft lilac, pale butter yellow, sage green, coral and warm ivory colors, very subtle paper grain. Friendly sophisticated illustrated magazine style, playful but not childish, generous breathing room, warm light. No lettering, no logos, no watermarks. Original artwork.

Exact atlas prompt:

> Use case: illustration-story. Asset type: one website illustration atlas for LeseLaut, used as twelve reusable topic pictures in an adult German learning library. A precise evenly spaced 4-column by 3-row grid on a genuinely transparent background. Every cell has one isolated centered charming hand-drawn editorial object illustration of equal apparent scale, with generous transparent margins; nothing crosses a cell boundary. Row 1 left to right: a colorful German townhouse; a desk with laptop and little plant; a tram with travel suitcase; a coffee cup with croissant. Row 2: a grocery paper bag with vegetables; an open book with pencil; two friends chatting with empty speech bubbles; a potted plant with sun. Row 3: a bicycle and helmet; a wrapped gift with party pennant; a paint palette with brush; a smartphone with headphones. Clean imperfect dark ink outlines, simple flat lilac, pale butter yellow, sage green, coral and sky blue colors, light paper texture, playful sophisticated contemporary editorial illustration. No text, no words, no captions, no tile borders, no background rectangles, no watermark, no brand logos. Keep the canvas in a 4:3 aspect ratio so all twelve cells are square.

## Typography

Both variable fonts are self-hosted under `public/fonts`, with their SIL Open Font License files. Headings use Bricolage Grotesque and controls use DM Sans. Reading passages retain the existing book serif stack.

Official sources:

- [Bricolage Grotesque](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque)
- [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans)

## Preservation and verification

The redesign changes presentation and introductory copy. Story IDs, manuscripts, translations, narration, book pages, bookmarks, progress storage, authentication, database migrations and AI quotas retain their existing behavior. Story filters, level controls, grammar exercises and translation practice remain available. The queued B2 release must add its tab to the redesigned library without replacing the illustration layout.

Check Stories, Books, Vocabulary, Grammar and Active Learning in the browser, including mobile sizing and both themes. Run the existing test suite and verified production build before publication.

Release validation: all 135 existing tests passed with Node 22; the production build passed and deployment migrations match committed source. Desktop and mobile browser checks covered all five learning sections, story filtering, vocabulary reveal, navigation and light/dark contrast. All 11 protected source, authentication configuration and local learner-data hashes remained unchanged. Existing rendered-route assertions now identify their learning page instead of depending on retired introductory copy.
