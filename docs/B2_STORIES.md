# B2 stories

The release adds 200 original stories in 20 groups: home, family, office,
work ethics, transport, travel encounters, school, further education, gym,
sport, shopping, services, hospitality, food, celebrations, civic life,
environment, technology, culture and personal choices.

Each manuscript has 900–999 German words, a complete English translation,
source-matched sentence translations, 8–12 vocabulary entries, four
comprehension questions and an ordered speaker assignment for every quotation.
Author review is recorded against the exact German SHA-256 in
`content/reading/b2/manuscripts/progress.json`. The existing 454 stories,
their recordings, edition aliases and progress identifiers are retained.

The text was written directly in Codex, without external text-generation APIs.
The three gloss PSV files contain directly authored contextual meanings for
forms absent from the existing reading dictionaries. They are scoped to B2
stories and do not change course vocabulary or learner progress.
Story-specific overrides in `contextual-glosses.json` correct meanings where
the same written form can represent a different grammatical use in context.
`shared-gloss-corrections.json` includes broader meanings for ambiguous forms
found during B2 reader checks, without changing earlier levels' dictionaries.

## Prepare and narrate

Run `node scripts/prepare-b2-story-release.mjs`. It verifies the complete
manuscript collection and writes staging sources and speaker plans under the
ignored `.local-piper/b2-release/` directory.

Use `scripts/generate-qwen-story-audio.py` with the staged sources and plans,
`--level B2 --bitrate-kbps 16 --batch-size 2`, installed local Qwen TTS/ASR/
alignment models, a local FFmpeg binary, and staging output/manifest/checkpoint
paths. Narration uses the existing synthetic German female and male reference
voices; dialogue follows the reviewed quotation assignments. Whole-story ASR
coverage must be at least 90%, excess at most 12%, and every visible word must
have a finite increasing timing within the recording. These are source
verification checks, not pronunciation assessments.

Run `node scripts/finalize-b2-story-media.mjs` only after all 200 recordings
pass. It pins 400 audio/timing objects to exact encoded-byte hashes under the
R2 namespace `stories/b2/`. The story endpoint retains the existing book
endpoint's immutable upload and range-playback checks. Upload signing uses a
separate temporary runtime secret, `B2_STORY_MEDIA_UPLOAD_SECRET`.

`scripts/upload-b2-story-media.mjs` takes its signing configuration through
hidden stdin, uploads only release-allowlisted objects, downloads and hashes
every stored object, then writes `content/reading/b2/media-verification.json`.
Run `node scripts/publish-b2-story-release.mjs` only after this receipt exists.
The script refuses incomplete uploads, stale text/audio and missing meanings.
Enable the B2 catalog only with this complete data and remove the temporary
upload secret on the final deployment. Local models/checkpoints never ship.

## Editorial limits

The German and English have author self-review, not independent teacher review
or formal CEFR certification. Exact titles/text, long repeated sentences and
phrase overlap are checked against all earlier stories and other B2 stories.
These checks and the documented plot comparisons cannot prove absolute semantic
uniqueness across every story.
