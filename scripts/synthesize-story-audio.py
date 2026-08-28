#!/usr/bin/env python3
"""Generate Piper narration and exact per-word timing sidecars."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import wave
from pathlib import Path

from piper import PiperVoice, SynthesisConfig


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--audio-dir", required=True, type=Path)
    parser.add_argument("--work-dir", required=True, type=Path)
    return parser.parse_args()


def aligned_phonemes(alignments, offset_samples: int) -> list[tuple[str, int]]:
    """Return every spoken phoneme and its absolute sample position."""
    phonemes: list[tuple[str, int]] = []
    cursor = offset_samples

    for alignment in alignments:
        phoneme = alignment.phoneme
        samples = int(alignment.num_samples)
        if phoneme not in {"^", "$"}:
            phonemes.append((phoneme, cursor))
        cursor += samples

    return phonemes


def count_phonemes(voice: PiperVoice, text: str) -> int:
    """Count phonemes in a prefix using the same contextual pronunciation."""
    return sum(len(sentence) for sentence in voice.phonemize(text))


def visual_word_starts(
    voice: PiperVoice, text: str, phonemes: list[tuple[str, int]]
) -> list[int]:
    """Map exact phoneme positions back to each visible text token."""
    starts: list[int] = []
    previous_sample = -1
    for match in re.finditer(r"\S+", text):
        if re.search(r"[A-Za-zÄÖÜäöüßÉé0-9]", match.group()) is None:
            continue
        phoneme_index = count_phonemes(voice, text[: match.start()])
        while phoneme_index < len(phonemes) and phonemes[phoneme_index][0] == " ":
            phoneme_index += 1

        if phoneme_index >= len(phonemes):
            raise RuntimeError(
                f"Could not map visible word {match.group()!r} at phoneme "
                f"{phoneme_index} of {len(phonemes)}"
            )

        sample = phonemes[phoneme_index][1]
        if sample <= previous_sample:
            raise RuntimeError(
                f"Non-increasing timing for visible word {match.group()!r}"
            )
        starts.append(sample)
        previous_sample = sample
    return starts


def main() -> None:
    args = parse_args()
    stories = json.loads(args.manifest.read_text(encoding="utf-8"))
    args.audio_dir.mkdir(parents=True, exist_ok=True)
    args.work_dir.mkdir(parents=True, exist_ok=True)

    voice = PiperVoice.load(args.model, include_alignments=True)
    synthesis = SynthesisConfig(length_scale=1.08)
    silence_frames = round(voice.config.sample_rate * 0.28)
    silence_bytes = bytes(silence_frames * 2)

    for story in stories:
        story_id = f"{story['number']:03d}"
        audio_path = args.audio_dir / f"story-{story_id}.webm"
        timing_path = args.audio_dir / f"story-{story_id}.json"
        wav_path = args.work_dir / f"story-{story_id}.wav"

        if audio_path.exists() and timing_path.exists():
            print(f"Kept {story_id}/100 · {story['title']}", flush=True)
            continue

        phonemes: list[tuple[str, int]] = []
        written_samples = 0

        with wave.open(str(wav_path), "wb") as wav_file:
            wav_file.setframerate(voice.config.sample_rate)
            wav_file.setsampwidth(2)
            wav_file.setnchannels(1)

            for chunk_index, chunk in enumerate(
                voice.synthesize(story["text"], synthesis, include_alignments=True)
            ):
                if chunk.phoneme_alignments is None:
                    raise RuntimeError(f"Piper returned no alignments for story {story_id}")

                if chunk_index > 0:
                    wav_file.writeframes(silence_bytes)
                    written_samples += silence_frames

                phonemes.extend(
                    aligned_phonemes(chunk.phoneme_alignments, written_samples)
                )
                wav_file.writeframes(chunk.audio_int16_bytes)
                written_samples += len(chunk.audio_int16_bytes) // 2

        word_starts = visual_word_starts(voice, story["text"], phonemes)
        expected_words = sum(
            1
            for token in story["text"].split()
            if re.search(r"[A-Za-zÄÖÜäöüßÉé0-9]", token)
        )
        if len(word_starts) != expected_words:
            raise RuntimeError(
                f"Story {story_id} has {expected_words} text words but "
                f"{len(word_starts)} aligned words"
            )

        subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(wav_path),
                "-c:a",
                "libopus",
                "-b:a",
                "28k",
                "-vbr",
                "on",
                str(audio_path),
            ],
            check=True,
        )

        timing_path.write_text(
            json.dumps(
                {
                    "starts": [
                        round(sample / voice.config.sample_rate, 4)
                        for sample in word_starts
                    ],
                    "duration": round(
                        written_samples / voice.config.sample_rate, 4
                    ),
                },
                separators=(",", ":"),
            ),
            encoding="utf-8",
        )
        wav_path.unlink()
        print(f"Generated {story_id}/100 · {story['title']}", flush=True)


if __name__ == "__main__":
    main()
