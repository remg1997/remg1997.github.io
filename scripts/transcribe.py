#!/usr/bin/env python3
"""Transcribe audio with Whisper V3 via mlx-whisper (local, Apple Silicon).

Writes <audio>.md next to each input with the transcript. Skips files
that already have a matching .md unless --force is passed.

Usage:
    python scripts/transcribe.py <audio>...
    python scripts/transcribe.py src/content/journal/iclr-2026/posters/*.m4a
    python scripts/transcribe.py --force recording.m4a
    python scripts/transcribe.py --lang en recording.m4a
    python scripts/transcribe.py --model mlx-community/whisper-large-v3-mlx recording.m4a

Setup (one-time):
    pip install mlx-whisper

The default model (whisper-large-v3-turbo) downloads ~1.5GB on first
run; it's cached in ~/.cache/huggingface/hub after that.
"""

from __future__ import annotations

import argparse
import sys
import time
from datetime import date
from pathlib import Path

DEFAULT_MODEL = "mlx-community/whisper-large-v3-turbo"


def transcribe_one(
    audio: Path,
    model_repo: str,
    language: str | None,
    force: bool,
) -> bool:
    out = audio.with_suffix(".md")
    if out.exists() and not force:
        print(f"  skip   {audio.name} — {out.name} exists (use --force to overwrite)")
        return False

    import mlx_whisper  # deferred so --help works without the dep installed

    print(f"  start  {audio.name}", flush=True)
    t0 = time.perf_counter()
    result = mlx_whisper.transcribe(
        str(audio),
        path_or_hf_repo=model_repo,
        language=language,
    )
    elapsed = time.perf_counter() - t0

    text = (result.get("text") or "").strip()
    detected_lang = result.get("language") or language or "?"
    model_name = model_repo.split("/")[-1]
    header = (
        f"# Transcript: {audio.name}\n\n"
        f"*{date.today().isoformat()} · {model_name} · "
        f"lang={detected_lang} · {elapsed:.1f}s wall · {len(text):,} chars*\n\n"
    )
    out.write_text(header + text + "\n", encoding="utf-8")
    print(f"  done   {audio.name} → {out.name} ({elapsed:.1f}s, {len(text):,} chars)")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Transcribe audio with Whisper V3 via mlx-whisper.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("audio", nargs="+", help="Audio file(s) to transcribe.")
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"HF repo for the MLX Whisper model. Default: {DEFAULT_MODEL}",
    )
    parser.add_argument(
        "--lang",
        dest="language",
        default=None,
        help="Force a source language code (e.g. 'en'). Default: auto-detect.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing .md transcripts.",
    )
    args = parser.parse_args()

    try:
        import mlx_whisper  # noqa: F401
    except ImportError:
        print("mlx-whisper is not installed. Run: pip install mlx-whisper", file=sys.stderr)
        return 1

    paths = [Path(a) for a in args.audio]
    missing = [p for p in paths if not p.exists()]
    if missing:
        for m in missing:
            print(f"  error  not found: {m}", file=sys.stderr)
        return 1

    print(f"model: {args.model}")
    print(f"files: {len(paths)}")
    written = sum(
        transcribe_one(p, args.model, args.language, args.force) for p in paths
    )
    print(f"wrote {written}/{len(paths)} transcript(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
