#!/usr/bin/env python3
"""Generate two German narration samples locally on Apple Silicon.

Requires mlx-audio. Example:
python scripts/generate-qwen-voice-samples.py --model /path/to/Qwen3-TTS-VoiceDesign
Model weights and the runtime are deliberately kept outside the website.
"""
import argparse
import json
from pathlib import Path
import time

import mlx.core as mx
import numpy as np
from mlx_audio.audio_io import write
from mlx_audio.tts.utils import load_model

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--output', type=Path, default=ROOT / 'docs/audio-samples')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
book = json.loads((ROOT / 'app/lib/book-data.json').read_text())
text = book['pages'][0]['paragraphs'][0]
model = load_model(args.model)
metadata = {'model': 'Qwen3-TTS-12Hz-1.7B-VoiceDesign (MLX 4-bit)', 'language': 'German', 'source': 'Book page 1, paragraph 1', 'text': text, 'samples': []}
for index, gender in enumerate(['male', 'female']):
    mx.random.seed(42 + index)
    instruction = f'A native German {gender} narrator, adult, warm and clear voice, standard German pronunciation. Read calmly at a slightly slower pace for a beginner learning German, with natural short pauses between sentences. Neutral storytelling, no dramatic acting.'
    started = time.monotonic()
    results = list(model.generate_voice_design(text=text, language='German', instruct=instruction, temperature=.7, max_tokens=700, verbose=True))
    audio = np.concatenate([np.array(result.audio) for result in results])
    rate = results[0].sample_rate
    if not np.isfinite(audio).all() or np.max(np.abs(audio)) < .01 or len(audio) / rate < 3:
        raise ValueError(f'Invalid {gender} sample')
    path = args.output / f'qwen-german-{gender}.wav'
    write(str(path), audio, rate, format='wav')
    metadata['samples'].append({'voice': gender, 'instruction': instruction, 'file': path.name, 'seconds': round(len(audio)/rate,2), 'generation_seconds': round(time.monotonic()-started,2)})
    print(f'Saved {path}', flush=True)
(args.output / 'qwen-samples.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
