#!/usr/bin/env python3
"""Generate full paragraph translations locally, checking sentence coverage.

Set TRANSLATION_MODEL_PATH; requires torch, transformers and sentencepiece.
Provide a checkpoint directory as the first argument to resume. No API calls.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
checkpoint = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.mkdtemp(prefix='leselaut-book-translation-'))
checkpoint.mkdir(parents=True, exist_ok=True)
source = checkpoint / 'source.json'
context = checkpoint / 'context.json'
result = checkpoint / 'sentences.json'
prepare = """
import fs from 'node:fs';
import {readingSentences} from './app/lib/reading-sentence-segmentation.mjs';
const book=JSON.parse(fs.readFileSync('app/lib/book-data.json'));
fs.writeFileSync(process.argv[1],JSON.stringify(Object.fromEntries(book.pages.map(p=>[p.number,{paragraphs:p.paragraphs.map(source=>({source,sentences:readingSentences(source).map(de=>({de}))}))}]))));
"""
subprocess.run(['node', '--input-type=module', '-e', prepare, str(source)], cwd=ROOT, check=True)
translator = ROOT / 'scripts/translate-sentences-offline.py'
subprocess.run([sys.executable, str(translator), str(source), str(context), 'paragraphs'], cwd=ROOT, check=True)
subprocess.run([sys.executable, str(translator), str(context), str(result), 'sentences'], cwd=ROOT, check=True)
subprocess.run(['node', 'scripts/polish-book-translations.mjs', str(result)], cwd=ROOT, check=True)
print('Saved full translations for all 200 pages.')
