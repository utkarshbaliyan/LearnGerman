# Unser Leben in Lindenstadt

The A1 Books section displays the user's supplied `story.txt` exactly as 200 pages in 10 chapters. Each page has its original title and four paragraphs. Books deliberately have no comprehension questions or story-completion grading.

`content/books/unser-leben-in-lindenstadt.txt` is the canonical source. Run `python3 scripts/build-book-data.py` after editing it; the compiler rejects missing or reordered pages and paragraph-count changes. The compiled `app/lib/book-data.json` is used by the site. Existing Stories and their progress remain separate.

Each paragraph has an independent Piper German recording and word timings in `public/audio/books/unser-leben-in-lindenstadt`. Run the resumable renderer with the local `de_DE-thorsten-high.onnx` model:

```sh
.local-piper/venv/bin/python scripts/generate-book-audio.py --model .local-piper/model/de_DE-thorsten-high.onnx
```

Rendering all pages writes `app/lib/book-audio-manifest.json`. The renderer hashes the exact paragraph text in asset filenames and timing files. If prose changes, regenerate audio and remove obsolete hashed assets after verifying the new manifest. The local Piper model and environment are ignored by Git. The recordings use 16 kbps Opus to keep the Sites archive within its size limit.

Tooltips use the existing story glossary plus `app/lib/book-glosses.json` for book-specific forms and names. Tests require a meaning for every word. This is the supplied A1-labelled manuscript; it has not been reviewed by a German teacher or rewritten for CEFR compliance.
