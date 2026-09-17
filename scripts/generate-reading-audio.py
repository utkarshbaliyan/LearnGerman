#!/usr/bin/env python3
"""Render the current graded stories with Piper 1.4.2 + Thorsten high.

Requires piper-tts, onnx and macOS afconvert. Model stays outside the repo.
Usage: python scripts/generate-reading-audio.py --model /path/to/model.onnx
"""
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
from piper import PiperVoice, SynthesisConfig
from piper.config import PiperConfig

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("alignment", ROOT / "scripts/synthesize-story-audio.py")
alignment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(alignment)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--only", help="Render one story for preview")
    parser.add_argument("--threads", type=int, default=4, help="Bound CPU concurrency during inference")
    args = parser.parse_args()
    stories = json.loads((ROOT / "app/lib/reading-path-data.json").read_text())
    output = ROOT / "public/audio/reading"
    output.mkdir(parents=True, exist_ok=True)
    # Released Piper 1.4.2 needs an explicit duration output on older models.
    model = onnx.load(str(args.model))
    ceil_outputs = [node.output[0] for node in model.graph.node if node.op_type == "Ceil"]
    if len(ceil_outputs) != 1:
        raise RuntimeError("Model must expose one phoneme-duration tensor")
    if not any(item.name == ceil_outputs[0] for item in model.graph.output):
        info = onnx.helper.ValueInfoProto()
        info.name = ceil_outputs[0]
        model.graph.output.append(info)
    with tempfile.TemporaryDirectory(prefix="leselaut-model-") as temp:
        model_path = Path(temp) / "aligned.onnx"
        onnx.save(model, str(model_path))
        options = onnxruntime.SessionOptions()
        options.intra_op_num_threads = max(1, args.threads)
        options.inter_op_num_threads = 1
        voice = PiperVoice(
            session=onnxruntime.InferenceSession(str(model_path), sess_options=options, providers=["CPUExecutionProvider"]),
            config=PiperConfig.from_dict(json.loads(Path(str(args.model) + ".json").read_text())),
        )
    synthesis = SynthesisConfig(length_scale=1.0)
    manifest = {}
    for story in stories:
        if args.only and story["id"] != args.only:
            continue
        digest = hashlib.sha256(story["text"].encode()).hexdigest()
        name = f'{story["id"]}-{digest[:12]}'
        audio_path = output / f"{name}.m4a"
        timing_path = output / f"{name}.json"
        if not (audio_path.exists() and timing_path.exists()):
            phonemes = []
            samples = 0
            with tempfile.TemporaryDirectory(prefix="leselaut-narration-") as temp:
                wav_path = Path(temp) / "voice.wav"
                with wave.open(str(wav_path), "wb") as wav:
                    wav.setparams((1, 2, voice.config.sample_rate, 0, "NONE", "not compressed"))
                    for index, chunk in enumerate(voice.synthesize(story["text"], synthesis, include_alignments=True)):
                        if chunk.phoneme_alignments is None:
                            raise RuntimeError("Narration has no alignment data")
                        if index:
                            silence = round(voice.config.sample_rate * .15)
                            wav.writeframes(bytes(silence * 2))
                            samples += silence
                            phonemes.append(("\0", samples))
                        phonemes.extend(alignment.aligned_phonemes(chunk.phoneme_alignments, samples))
                        wav.writeframes(chunk.audio_int16_bytes)
                        samples += len(chunk.audio_int16_bytes) // 2
                starts = alignment.visual_word_starts(voice, story["text"], phonemes)
                expected = sum(bool(re.search(r"[A-Za-zÄÖÜäöüßÉé0-9]", token)) for token in story["text"].split())
                if len(starts) != expected or any(b <= a for a, b in zip(starts, starts[1:])):
                    raise RuntimeError(f'Invalid word timings: {story["id"]}')
                subprocess.run(["afconvert", str(wav_path), str(audio_path), "-f", "m4af", "-d", "aac", "-b", "64000"], check=True)
                timing_path.write_text(json.dumps({"textHash": digest, "starts": [round(n / voice.config.sample_rate, 4) for n in starts], "duration": round(samples / voice.config.sample_rate, 4)}, separators=(",", ":")))
        timing = json.loads(timing_path.read_text())
        manifest[story["id"]] = {"src": f"/audio/reading/{name}.m4a", "timingSrc": f"/audio/reading/{name}.json", "textHash": digest, "wordCount": len(timing["starts"]), "duration": timing["duration"]}
        print(f'{story["id"]}: {len(timing["starts"])} words, {timing["duration"]:.1f}s', flush=True)
    if not args.only:
        (ROOT / "app/lib/reading-audio-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
