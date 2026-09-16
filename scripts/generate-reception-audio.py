#!/usr/bin/env python3
"""Render the pilot's explicit dialogue turns using installed macOS German voices.
No API credentials. Final assets are AAC; source turn boundaries are sample-derived.
"""
import hashlib
import json
import subprocess
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
lessons = json.loads((ROOT / 'app/lib/reception-data.json').read_text())
out = ROOT / 'public/audio/reception'
out.mkdir(parents=True, exist_ok=True)
manifest = {}
voices = ['Anna', 'Reed (German (Germany))']
with tempfile.TemporaryDirectory(prefix='leselaut-reception-') as work:
    work = Path(work)
    for lesson in lessons:
        rate = {'A1': 140, 'A2': 155, 'B1': 170}[lesson['level']]
        for activity in lesson['guided'] + lesson['transfer']:
            if activity['skill'] != 'listening':
                continue
            speakers = list(dict.fromkeys(s['speaker'] for s in activity['segments']))
            frames = bytearray()
            starts = []
            for i, segment in enumerate(activity['segments']):
                wav = work / f'turn-{i}.wav'
                subprocess.run(['say', '-v', voices[speakers.index(segment['speaker']) % 2], '-r', str(rate), '-o', str(wav), '--file-format=WAVE', '--data-format=LEI16@22050', segment['text']], check=True)
                with wave.open(str(wav), 'rb') as f:
                    if f.getnchannels() != 1 or f.getsampwidth() != 2 or f.getframerate() != 22050 or f.getnframes() < 2205:
                        raise RuntimeError('Invalid or empty synthesis for ' + activity['id'])
                    audio = f.readframes(f.getnframes())
                    if not any(audio):
                        raise RuntimeError('Silent synthesis for ' + activity['id'])
                starts.append(round(len(frames) / 44100, 3))
                frames.extend(audio)
                frames.extend(bytes(round(22050 * .35) * 2))
            combined = work / 'combined.wav'
            with wave.open(str(combined), 'wb') as f:
                f.setnchannels(1); f.setsampwidth(2); f.setframerate(22050); f.writeframes(frames)
            target = out / (activity['id'] + '.m4a')
            subprocess.run(['afconvert', str(combined), str(target), '-f', 'm4af', '-d', 'aac', '-b', '64000'], check=True)
            if target.stat().st_size < 2000:
                raise RuntimeError('Encoded audio is empty')
            manifest[activity['id']] = dict(src='/audio/reception/' + target.name, duration=round(len(frames) / 44100, 3), starts=starts,
                textHash=hashlib.sha256('\n'.join(s['text'] for s in activity['segments']).encode()).hexdigest(), voices=[voices[i % 2] for i in range(len(speakers))], synthetic=True)
            print(activity['id'], manifest[activity['id']]['duration'], 'seconds', flush=True)
(ROOT / 'app/lib/reception-audio.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
