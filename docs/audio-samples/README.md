# German voice comparison samples

The two WAV files narrate the same opening paragraph of the A1 book:

> Mila sitzt am Fenster im Zug. Draußen sieht sie Felder und kleine Häuser. Heute fährt sie nach Lindenstadt.

Generated locally with [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) using the [MLX 4-bit VoiceDesign checkpoint](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit) and mlx-audio 0.5.6. These are synthetic designed voices, not clones of identifiable people. Qwen's model is Apache 2.0 licensed. Instructions, duration, and generation times are recorded in `qwen-samples.json`.

Regenerate on Apple Silicon with mlx-audio installed:

```sh
python scripts/generate-qwen-voice-samples.py --model /path/to/Qwen3-TTS-VoiceDesign
```

Model weights and the Python runtime stay outside the repository. These comparison samples are outside the deployed website assets and do not replace production narration. Audio generation validated finite, non-silent output; the samples have not received a native German listening review.
