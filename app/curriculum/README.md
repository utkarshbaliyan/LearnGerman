# Curriculum structure

Each CEFR level retains curriculum data needed by the paused course and existing progress records.

- `types.ts` defines the shared story, unit and level shapes.
- `a1.ts` contains the A1 curriculum.
- `index.ts` registers the levels exposed by the interface.
- Current story narration and timing files live in `public/audio/reading/`.

The earlier 440-story library and daily practice were retired to free the Site
archive for the current graded stories. Their completion IDs remain in account
progress. New reading audio is generated with `scripts/generate-reading-audio.py`.

Each new story can optionally carry `pronunciation`, `referenceFocus`,
`speakingPrompt`, and `writingPrompt`. These fields make sentence complexity,
pronoun reference, and pronunciation goals explicit as the course grows toward B2.
