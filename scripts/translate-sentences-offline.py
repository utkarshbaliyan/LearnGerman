"""Translate with an installed Marian German-English model; no network requests.

Requires transformers, torch, sentencepiece and a local TRANSLATION_MODEL_PATH.
Use a fresh TRANSLATION_OUTPUT when changing model; saved matching stories resume.
"""
import json
import os
import pathlib
import sys

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

source_path, destination = map(pathlib.Path, sys.argv[1:3])
mode = sys.argv[3] if len(sys.argv) > 3 else 'sentences'
model_path = os.environ['TRANSLATION_MODEL_PATH']
torch.set_num_threads(4)
device = os.environ.get('TRANSLATION_DEVICE') or ('mps' if torch.backends.mps.is_available() else 'cpu')
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True).to(device).eval()
source = json.loads(source_path.read_text())
saved = json.loads(destination.read_text()) if destination.exists() else {}
with torch.inference_mode():
    for index, (story_id, entry) in enumerate(source.items(), 1):
        previous = saved.get(story_id)
        if (previous and [p['source'] for p in previous['paragraphs']] == [p['source'] for p in entry['paragraphs']]
            and all([s['de'] for s in old['sentences']] == [s['de'] for s in new['sentences']]
                    for old, new in zip(previous['paragraphs'], entry['paragraphs']))):
            if all(s.get('en') for p in previous['paragraphs'] for s in p['sentences']):
                continue
            if mode == 'paragraphs' and all(p.get('contextEnglish') for p in previous['paragraphs']):
                continue
        if mode == 'paragraphs':
            tokens = tokenizer([p['source'] for p in entry['paragraphs']], return_tensors='pt', padding=True).to(device)
            result = model.generate(**tokens, num_beams=4, max_new_tokens=400)
            for paragraph, translated in zip(entry['paragraphs'], tokenizer.batch_decode(result, skip_special_tokens=True)):
                paragraph['contextEnglish'] = translated.strip()
        sentences = [] if mode == 'paragraphs' else [s for p in entry['paragraphs'] for s in p['sentences'] if not s.get('en')]
        for offset in range(0, len(sentences), 24):
            batch = sentences[offset:offset + 24]
            tokens = tokenizer([s['de'] for s in batch], return_tensors='pt', padding=True).to(device)
            result = model.generate(**tokens, num_beams=4, max_new_tokens=160)
            english = tokenizer.batch_decode(result, skip_special_tokens=True)
            for sentence, translated in zip(batch, english):
                sentence['en'] = translated.strip()
                if not sentence['en']:
                    raise ValueError(f'{story_id}: empty translation')
        saved[story_id] = entry
        temporary = destination.with_suffix('.tmp')
        temporary.write_text(json.dumps(saved, ensure_ascii=False, separators=(',', ':')) + '\n')
        temporary.replace(destination)
        if index % 10 == 0 or index == len(source):
            print(f'Translated {index}/{len(source)}: {story_id}', flush=True)
