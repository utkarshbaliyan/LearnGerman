#!/usr/bin/env python3
"""Validate and compile the book's editor-written paragraph summaries."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content/books/paragraph-summaries.psv"
BOOK = ROOT / "app/lib/book-data.json"
OUTPUT = ROOT / "app/lib/book-summaries.json"

pages = json.loads(BOOK.read_text(encoding="utf-8"))["pages"]
lines = SOURCE.read_text(encoding="utf-8").splitlines()
if len(lines) != len(pages):
    raise SystemExit(f"Expected {len(pages)} summary rows, found {len(lines)}")

summaries = []
for number, line in enumerate(lines, 1):
    fields = line.split("|")
    if len(fields) != 5 or fields[0] != str(number):
        raise SystemExit(f"Page {number}: expected page number and four summaries")
    row = fields[1:]
    for paragraph, summary in enumerate(row, 1):
        if not 4 <= len(summary.split()) <= 25 or not summary.endswith((".", "!", "?")):
            raise SystemExit(f"Page {number}, paragraph {paragraph}: invalid summary")
    summaries.append(row)

OUTPUT.write_text(json.dumps(summaries, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"Compiled {len(summaries) * 4} paragraph summaries")
