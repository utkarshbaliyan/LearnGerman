# Curriculum structure

Each CEFR level owns its curriculum data and audio directory.

- `types.ts` defines the shared story, unit and level shapes.
- `a1.ts` contains the A1 curriculum.
- `index.ts` registers the levels exposed by the interface.
- `public/audio/<level>/` stores matching narration and timing files.

To publish A2, B1 or B2, add its curriculum module, register it in `index.ts`, and
place its audio files in the corresponding lowercase level directory. The shared
Piper generator supports `LESELAUT_LEVEL=a1`, `a2`, or `b1`, preserving the same
Thorsten narrator and word-level highlighting across levels.

Each new story can optionally carry `pronunciation`, `referenceFocus`,
`speakingPrompt`, and `writingPrompt`. These fields make sentence complexity,
pronoun reference, and pronunciation goals explicit as the course grows toward B2.
