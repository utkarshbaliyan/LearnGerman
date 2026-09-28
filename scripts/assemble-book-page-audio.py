#!/usr/bin/env python3
"""Join existing paragraph recordings into one aligned recording per book page.

The input manifest is a saved copy of the paragraph manifest. Validate the new
manifest before removing any unreferenced paragraph assets.
"""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--paragraph-manifest', type=Path, required=True)
parser.add_argument('--ffmpeg', required=True)
args = parser.parse_args()
book = json.loads((ROOT / 'app/lib/book-data.json').read_text())
previous = json.loads(args.paragraph_manifest.read_text())
output = ROOT / 'public/audio/books' / book['id']
output.mkdir(parents=True, exist_ok=True)
sample_rate = 24000
pause = bytes(round(sample_rate * 0.3) * 2)
manifest = {}
for page in book['pages']:
    text = '\n\n'.join(page['paragraphs'])
    digest = hashlib.sha256(text.encode()).hexdigest()
    name = f"p{page['number']:03d}-page-{digest[:12]}"
    audio_path = output / f'{name}.webm'
    timing_path = output / f'{name}.json'
    with tempfile.TemporaryDirectory(prefix='leselaut-page-audio-') as directory:
        pcm = bytearray()
        starts = []
        for index, paragraph in enumerate(page['paragraphs']):
            asset = previous[str(page['number'])][index]
            if asset['textHash'] != hashlib.sha256(paragraph.encode()).hexdigest():
                raise ValueError(f"Page {page['number']}: stale paragraph recording")
            timing = json.loads((ROOT / 'public' / asset['timingSrc'].lstrip('/')).read_text())
            raw = Path(directory) / f'{index}.pcm'
            subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                            '-i', str(ROOT / 'public' / asset['src'].lstrip('/')),
                            '-f', 's16le', '-ac', '1', '-ar', str(sample_rate), str(raw)], check=True)
            if index:
                pcm.extend(pause)
            offset = len(pcm) / (sample_rate * 2)
            starts.extend(round(offset + start, 4) for start in timing['starts'])
            pcm.extend(raw.read_bytes())
        duration = round(len(pcm) / (sample_rate * 2), 4)
        if any(b <= a for a, b in zip(starts, starts[1:])) or starts[-1] >= duration:
            raise ValueError(f"Page {page['number']}: invalid joined timings")
        raw = Path(directory) / 'page.pcm'
        raw.write_bytes(pcm)
        subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                        '-f', 's16le', '-ac', '1', '-ar', str(sample_rate), '-i', str(raw),
                        '-c:a', 'libopus', '-b:a', '16k', '-vbr', 'on', '-application', 'voip', str(audio_path)], check=True)
    timing_path.write_text(json.dumps({'textHash': digest, 'starts': starts, 'duration': duration}, separators=(',', ':')))
    manifest[str(page['number'])] = {'src': f'/audio/books/{book["id"]}/{name}.webm',
                                   'timingSrc': f'/audio/books/{book["id"]}/{name}.json',
                                   'textHash': digest, 'wordCount': len(starts), 'duration': duration}
    if page['number'] % 20 == 0:
        print(f"Assembled page {page['number']}/200", flush=True)
(ROOT / 'app/lib/book-audio-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
