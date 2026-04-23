# scripts/

Local helpers. Not part of the Astro build.

## `transcribe.py` — Whisper V3 audio transcription

Transcribes voice notes using [`mlx-whisper`](https://github.com/ml-explore/mlx-examples/tree/main/whisper) — Apple Silicon native, runs locally, no network calls. Default model is `whisper-large-v3-turbo` (4× faster than large-v3 with only marginal quality loss).

### Setup (one-time)

```bash
pip install mlx-whisper
```

First run downloads the model (~1.5 GB for turbo). Cached under `~/.cache/huggingface/hub`.

### Usage

```bash
# Transcribe a single file
python scripts/transcribe.py recording.m4a

# Batch a whole poster session
python scripts/transcribe.py src/content/journal/iclr-2026/posters/*.m4a

# Overwrite an existing .md
python scripts/transcribe.py --force recording.m4a

# Force language (helps with accented speech)
python scripts/transcribe.py --lang en recording.m4a

# Use full (non-turbo) large-v3 for maximum accuracy
python scripts/transcribe.py --model mlx-community/whisper-large-v3-mlx recording.m4a
```

### Output

Writes `<audio>.md` next to each input. A file named `recording_001.m4a` produces `recording_001.md` with:

```markdown
# Transcript: recording_001.m4a

*2026-04-23 · whisper-large-v3-turbo · lang=en · 12.3s wall · 1,842 chars*

(transcript text here…)
```

Files that already have a matching `.md` are skipped unless `--force` is passed.

### Privacy

Audio files placed under `src/content/journal/` are gitignored automatically (along with their `.md` transcripts). Nothing leaves your machine: the model runs entirely local on MLX.
