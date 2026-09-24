# Der Schlüssel im blauen Korb

The A1 Books section contains the revised 200-page reader in ten chapters. Each page retains four paragraphs, each with its own German narration and word meanings. Books have no comprehension questions or completion grading.

`content/books/der-schluessel-im-blauen-korb.txt` is the canonical manuscript. Run `python3 scripts/build-book-data.py` after editing it. The compiler checks page numbering, chapter titles, and paragraph counts, and writes `app/lib/book-data.json`.

The paragraph narrator uses Piper `de_DE-thorsten-high` with word timing sidecars. Generate or resume it with:

```sh
.local-piper/venv/bin/python scripts/generate-book-audio.py --model .local-piper/model/de_DE-thorsten-high.onnx
```

The resulting `app/lib/book-audio-manifest.json` references `public/audio/books/der-schluessel-im-blauen-korb`. Each asset filename includes a hash of its exact paragraph. Regenerate audio after prose edits and remove unreferenced assets only after the new manifest passes tests. `app/lib/book-glosses.json` supplies book-specific word meanings in addition to the shared story glossary.

Old `/books/a1/unser-leben-in-lindenstadt/<page>` bookmarks redirect to the matching page of the new reader. The old book manuscript and audio were removed from the active site package. This reader has had an internal structural and targeted language pass but has not been certified or reviewed by a German teacher.
