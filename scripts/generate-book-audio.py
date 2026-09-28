#!/usr/bin/env python3
"""Render each book page as one aligned German recording with paragraph pauses."""
import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import tempfile
import wave
from pathlib import Path

import onnx
import onnxruntime
from imageio_ffmpeg import get_ffmpeg_exe
from piper import PiperVoice, SynthesisConfig
from piper.config import PiperConfig

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('alignment', ROOT / 'scripts/synthesize-story-audio.py')
alignment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(alignment)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True, type=Path)
    parser.add_argument('--start-page', type=int, default=1)
    parser.add_argument('--end-page', type=int, default=200)
    parser.add_argument('--threads', type=int, default=2)
    args = parser.parse_args()
    book = json.loads((ROOT / 'app/lib/book-data.json').read_text())
    output = ROOT / 'public/audio/books' / book['id']
    output.mkdir(parents=True, exist_ok=True)
    model = onnx.load(str(args.model))
    ceil_outputs = [node.output[0] for node in model.graph.node if node.op_type == 'Ceil']
    if len(ceil_outputs) != 1:
        raise RuntimeError('Model must expose one phoneme-duration tensor')
    if not any(item.name == ceil_outputs[0] for item in model.graph.output):
        info = onnx.helper.ValueInfoProto()
        info.name = ceil_outputs[0]
        model.graph.output.append(info)
    with tempfile.TemporaryDirectory(prefix='leselaut-book-model-') as temp:
        model_path = Path(temp) / 'aligned.onnx'
        onnx.save(model, str(model_path))
        options = onnxruntime.SessionOptions()
        options.intra_op_num_threads = max(1, args.threads)
        options.inter_op_num_threads = 1
        voice = PiperVoice(
            session=onnxruntime.InferenceSession(str(model_path), sess_options=options, providers=['CPUExecutionProvider']),
            config=PiperConfig.from_dict(json.loads(Path(str(args.model) + '.json').read_text())),
        )
    synthesis = SynthesisConfig(length_scale=1.0)
    for page in book['pages']:
        if not args.start_page <= page['number'] <= args.end_page:
            continue
        text = '\n\n'.join(page['paragraphs'])
        digest = hashlib.sha256(text.encode()).hexdigest()
        name = f"p{page['number']:03d}-page-{digest[:12]}"
        audio_path = output / f'{name}.webm'
        timing_path = output / f'{name}.json'
        if audio_path.exists() and timing_path.exists():
            print(f"page {page['number']}: cached", flush=True)
            continue
        starts = []
        samples = 0
        with tempfile.TemporaryDirectory(prefix='leselaut-book-audio-') as temp:
            wav_path = Path(temp) / 'voice.wav'
            with wave.open(str(wav_path), 'wb') as wav:
                wav.setparams((1, 2, voice.config.sample_rate, 0, 'NONE', 'not compressed'))
                for paragraph_index, paragraph in enumerate(page['paragraphs']):
                    if paragraph_index:
                        silence = round(voice.config.sample_rate * .3)
                        wav.writeframes(bytes(silence * 2))
                        samples += silence
                    offset = samples
                    paragraph_samples = 0
                    phonemes = []
                    for chunk_index, chunk in enumerate(voice.synthesize(paragraph, synthesis, include_alignments=True)):
                        if chunk.phoneme_alignments is None:
                            raise RuntimeError('Narration has no alignment data')
                        if chunk_index:
                            silence = round(voice.config.sample_rate * .15)
                            wav.writeframes(bytes(silence * 2))
                            paragraph_samples += silence
                            phonemes.append(('\0', paragraph_samples))
                        phonemes.extend(alignment.aligned_phonemes(chunk.phoneme_alignments, paragraph_samples))
                        wav.writeframes(chunk.audio_int16_bytes)
                        paragraph_samples += len(chunk.audio_int16_bytes) // 2
                    starts.extend(offset + n for n in alignment.visual_word_starts(voice, paragraph, phonemes))
                    samples += paragraph_samples
            expected = sum(bool(re.search(r'[A-Za-zÄÖÜäöüßÉé0-9]', token)) for token in text.split())
            if len(starts) != expected or any(b <= a for a, b in zip(starts, starts[1:])):
                raise RuntimeError(f"Invalid word timings: page {page['number']}")
            subprocess.run([get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav_path),
                            '-c:a', 'libopus', '-b:a', '16k', '-vbr', 'on', '-application', 'voip', str(audio_path)], check=True)
            timing_path.write_text(json.dumps({'textHash': digest, 'starts': [round(n / voice.config.sample_rate, 4) for n in starts],
                                               'duration': round(samples / voice.config.sample_rate, 4)}, separators=(',', ':')))
        print(f"page {page['number']}: {len(starts)} words", flush=True)
    if args.start_page == 1 and args.end_page == 200:
        manifest = {}
        for page in book['pages']:
            digest = hashlib.sha256('\n\n'.join(page['paragraphs']).encode()).hexdigest()
            name = f"p{page['number']:03d}-page-{digest[:12]}"
            audio_path = output / f'{name}.webm'
            timing_path = output / f'{name}.json'
            if not (audio_path.exists() and timing_path.exists()):
                raise RuntimeError(f"Missing narration: page {page['number']}")
            timing = json.loads(timing_path.read_text())
            if timing['textHash'] != digest:
                raise RuntimeError(f"Stale narration: page {page['number']}")
            manifest[str(page['number'])] = {'src': f"/audio/books/{book['id']}/{name}.webm", 'timingSrc': f"/audio/books/{book['id']}/{name}.json",
                                            'textHash': digest, 'wordCount': len(timing['starts']), 'duration': timing['duration']}
        (ROOT / 'app/lib/book-audio-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        print('Manifest contains 200 page recordings', flush=True)


if __name__ == '__main__':
    main()
