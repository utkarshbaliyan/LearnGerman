# Der Schlüssel im blauen Korb

The A1 Books section contains the revised 200-page reader in ten chapters. Each page retains four paragraphs, with one continuous German recording per page and word meanings. Books have no comprehension questions or completion grading.

`content/books/der-schluessel-im-blauen-korb.txt` is the canonical manuscript. Run `python3 scripts/build-book-data.py` after editing it. The compiler checks page numbering, chapter titles, and paragraph counts, and writes `app/lib/book-data.json`.

The page narrator uses Piper `de_DE-thorsten-high` with word timing sidecars. Generate or resume it with:

```sh
.local-piper/venv/bin/python scripts/generate-book-audio.py --model .local-piper/model/de_DE-thorsten-high.onnx
```

The resulting `app/lib/book-audio-manifest.json` references `public/audio/books/der-schluessel-im-blauen-korb`. Each asset filename includes a hash of its four paragraphs joined with two newlines. Regenerate audio after prose edits and remove unreferenced assets only after the new manifest passes tests. `app/lib/book-glosses.json` supplies book-specific word meanings in addition to the shared story glossary.

Old `/books/a1/unser-leben-in-lindenstadt/<page>` bookmarks redirect to the matching page of the new reader. The old book manuscript and audio were removed from the active site package. This reader has had an internal structural and targeted language pass but has not been certified or reviewed by a German teacher.

Each page has one Show/Hide English translations button. Full English appears beneath each German paragraph when enabled. `app/lib/book-translations.json` stores exact source text with each translation; stale text is not displayed. The old short summaries remain as an editorial reference, but are not shown in the reader.

Generate translations entirely locally with an installed German-English Marian model:

```sh
TRANSLATION_MODEL_PATH=/path/to/local/model python scripts/generate-book-translations.py /tmp/book-translation-checkpoints
```

The generator checks paragraph-context translations against individual sentence translations to reduce omissions, then applies source-matched corrections from `content/books/paragraph-translation-edits.json`. These translations have targeted internal review, not full bilingual or teacher certification.

`scripts/assemble-book-page-audio.py` migrates existing paragraph recordings into page recordings with 0.3-second pauses and continuous word timing offsets. The 800 superseded paragraph recordings were removed after validating the 200 page recordings. Reading bookmarks remain unchanged.
