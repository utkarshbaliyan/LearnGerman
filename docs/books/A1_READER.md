# Der Schlüssel im blauen Korb

The A1 Books section contains the revised 200-page reader in ten chapters. Each page retains four paragraphs, with one continuous German recording per page and word meanings. Books have no comprehension questions or completion grading.

`content/books/der-schluessel-im-blauen-korb.txt` is the canonical manuscript. Run `python3 scripts/build-book-data.py` after editing it. The compiler checks page numbering, chapter titles, and paragraph counts, and writes `app/lib/book-data.json`.

The page recordings use the same synthetic Qwen references as Stories: female narration and female characters, with a male voice for identified male dialogue. Signs and diary entries remain with the narrator. Clearly attributed messages between characters can use their character voices too. Each page still has one player, with continuous word highlighting; translations and bookmarks are preserved.

`content/books/dialogue-voices.json` stores source-matched speaker assignments and exact text segments. The shared annotation tool reads neighbouring pages and source evidence for recurring characters; it sends only already-public book text to the configured Groq provider. Review its assignments before publishing. The opening pages have been checked for Mila, Jonas, Sara, Herr König and written signs.

Generate or resume the local recordings with:

```sh
python scripts/generate-qwen-story-audio.py --collection book --models /path/to/models --dialogue-plan content/books/dialogue-voices.json --checkpoint .local-piper/qwen-books/der-schluessel-im-blauen-korb --ffmpeg /path/to/ffmpeg
```

Use `--only 2` for a page preview. `--follow-plans` waits for annotations being prepared in parallel. The shared [narration documentation](../reading/NARRATION.md) explains model setup, transcript checks and timing validation. Temporary model weights, WAVs and reports stay outside the published site. The old Piper page recordings are retired only after all 200 replacements pass validation.

The resulting `app/lib/book-audio-manifest.json` references `public/audio/books/der-schluessel-im-blauen-korb`. Each asset filename includes hashes of its four paragraphs joined with two newlines and its character voice plan. Regenerate audio after prose edits and remove unreferenced assets only after the new manifest passes tests. `app/lib/book-glosses.json` supplies book-specific word meanings in addition to the shared story glossary.

Old `/books/a1/unser-leben-in-lindenstadt/<page>` bookmarks redirect to the matching page of the new reader. The old book manuscript and audio were removed from the active site package. This reader has had an internal structural and targeted language pass but has not been certified or reviewed by a German teacher.

Each page has one Show/Hide English translations button. Full English appears beneath each German paragraph when enabled. `app/lib/book-translations.json` stores exact source text with each translation; stale text is not displayed. The old short summaries remain as an editorial reference, but are not shown in the reader.

Generate translations entirely locally with an installed German-English Marian model:

```sh
TRANSLATION_MODEL_PATH=/path/to/local/model python scripts/generate-book-translations.py /tmp/book-translation-checkpoints
```

The generator checks paragraph-context translations against individual sentence translations to reduce omissions, then applies source-matched corrections from `content/books/paragraph-translation-edits.json`. These translations have targeted internal review, not full bilingual or teacher certification.

`scripts/assemble-book-page-audio.py` migrates existing paragraph recordings into page recordings with 0.3-second pauses and continuous word timing offsets. The 800 superseded paragraph recordings were removed after validating the 200 page recordings. Reading bookmarks remain unchanged.
