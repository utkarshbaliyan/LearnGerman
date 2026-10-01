> Coverage: all 454 graded stories have recordings. The retired 440-story library's audio was removed from the Site archive while its saved progress remains in accounts.

# Graded story narration

All 454 graded stories now use continuous character narration. The female reference narrates and voices female characters; the male reference voices identified male characters. A1 and A2 text, translations and progress IDs are unchanged. The 200 rewritten B1 stories use v2 IDs; archived v1 progress remains intact and old story URLs redirect to their v2 editions. The practical reception pilot and books keep their own recordings.

Final media and timing sidecars live in `public/audio/reading`; `app/lib/reading-audio-manifest.json` maps each story to one recording. Asset names include both the source-text hash and the speaker-plan hash. Superseded Piper story recordings have been removed from the published assets. The earlier `scripts/generate-reading-audio.py` pipeline remains in source for local fallback; it is no longer the production narration engine.

## Player and validation

Native audio controls handle pause/resume and seeking. A1 starts at 0.85×; A2 and B1 start at 1×. Speed stays available while playing and pitch is preserved. A shared narration context connects the player to the standalone or course text, including when the course transcript is opened mid-playback. Highlights use media time, never a timer estimate of words per minute. A failed timing request leaves audio playable and offers a retry; a failed audio request offers reload. Changing story or leaving the player pauses playback and cancels animation work.

Tests cover all 454 text hashes, complete word-index mapping, timing count/order/range, audio container presence, seeking/replay boundaries and representative rendered story pages. Audio is labelled AI voice. These mechanical checks do not certify naturalness or pronunciation: teacher listening review and real-device listening feedback remain necessary.

## Production character voices

Production uses the two synthetic Qwen samples in `docs/audio-samples`: female narration and female characters, with male characters voiced by the male sample. Each story still has one continuous recording and the existing player. There is no narrator-selection dropdown, with source-matched translations and preserved legacy progress.

`content/reading/dialogue-voices.json` stores source hashes and exact text spans with speaker assignments. Quoted signs and uncertain identities stay with the narrator. `scripts/annotate-story-dialogue.mjs` creates resumable speaker drafts using the existing Groq provider; only the already-public story text is supplied. Assignments require editorial review, particularly unattributed dialogue and short answers. The first story has been manually checked; its sign is narration and Mia answers Sam's “Und du?”. Cross-story name checks detect conflicting voice assignments, and a first-person speaker is not assigned a gender just because a girlfriend is mentioned.

```sh
python scripts/generate-qwen-story-audio.py --models .local-piper/qwen-models --dialogue-plan content/reading/dialogue-voices.json --only reading-a1-01-v1 --ffmpeg /absolute/path/to/ffmpeg
```

The local generator runs on Apple silicon with `mlx-audio==0.5.6` and `mlx==0.32.2`. `scripts/download-local-audio-models.py` downloads the 4-bit MLX models and verifies large weight files against upstream SHA-256 values. It uses Qwen3-TTS 1.7B Base, with Qwen ASR for a complete-story transcript filter and ForcedAligner for word starts. Very short turns are checked within the complete recording, where ASR has conversational context; longer chunks also receive their own transcript check. Full-story ASR processes 30-second chunks; character names are supplied as recognition hints and spoken numbers are normalized before comparison. The filter requires at least 90% source-token coverage and no more than 12% extra tokens. It synthesizes each voice turn, joins them with short pauses, and writes one mono Opus recording and one timing sidecar. A1, A2 and the book use 24 kb/s; the longer B1 v2 recordings use 16 kb/s. Optional `--batch-size 2` groups uncached chunks using the same reference voice; all existing validation and sequential retries remain in effect. Speaker-plan changes invalidate the final asset, while validated individual chunks can be reused. Checkpoints and superseded trial files stay in the ignored `.local-piper` directory, outside the site archive. Superseded production files are removed only after every replacement passes validation.
