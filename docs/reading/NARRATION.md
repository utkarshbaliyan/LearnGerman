# Graded story narration

The browser's sentence-by-sentence device voice was replaced on 2026-09-16 with continuous recorded German narration for all 72 current graded stories and their course chapters. The legacy story library and practical reception pilot keep their separate recordings.

## Production

- Engine: [Piper 1.4.2](https://github.com/OHF-Voice/piper1-gpl), local inference; no provider API or student data involved.
- Voice: [de_DE-thorsten-high](https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/de/de_DE/thorsten/high/MODEL_CARD), trained on Thorsten Voice (CC0 dataset; model repository MIT). Synthetic single-speaker German, 22,050 Hz.
- Length scale 1.0; 150 ms of inserted silence between synthesis chunks; mono AAC at 64 kb/s. The full recording plays continuously, without starting a new browser utterance at every sentence.
- `scripts/generate-reading-audio.py` reads the exact current story text, generates phoneme alignments, maps spoken whitespace tokens to word starts, and encodes with macOS `afconvert`. Requires `piper-tts==1.4.2` and `onnx`. Pass `--model /absolute/path/de_DE-thorsten-high.onnx`; optional `--only reading-a1-02-v1` renders a sample. The matching `.onnx.json` must be beside the model. Models and temporary WAV files remain outside the repository. Piper 1.4.2 needs the model's phoneme-duration tensor exposed; the script patches a temporary copy.
- Final media and timing sidecars live in `public/audio/reading`; `app/lib/reading-audio-manifest.json` maps each story to them. SHA-256 of the source text forms the asset name and is checked in tests. Reruns retain completed assets. Regenerate after text changes; tests reject missing or stale narration.

## Player and validation

Native audio controls handle pause/resume and seeking. A1 starts at 0.85×; A2 and B1 start at 1×. Speed stays available while playing and pitch is preserved. A shared narration context connects the player to the standalone or course text, including when the course transcript is opened mid-playback. Highlights use media time, never a timer estimate of words per minute. A failed timing request leaves audio playable and offers a retry; a failed audio request offers reload. Changing story or leaving the player pauses playback and cancels animation work.

Tests cover all 72 text hashes, complete word-index mapping, timing count/order/range, audio container presence, seeking/replay boundaries and representative rendered story pages. Audio is labelled AI voice. These mechanical checks do not certify naturalness or pronunciation: teacher listening review and real-device listening feedback remain necessary.
