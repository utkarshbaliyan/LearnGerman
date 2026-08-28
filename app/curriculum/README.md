# Curriculum structure

Each CEFR level owns its curriculum data and audio directory.

- `types.ts` defines the shared story, unit and level shapes.
- `a1.ts` contains the A1 curriculum.
- `index.ts` registers the levels exposed by the interface.
- `public/audio/<level>/` stores matching narration and timing files.

To publish A2 or B1, add its curriculum module, register it in `index.ts`, and
place its audio files in the corresponding lowercase level directory.
