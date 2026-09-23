#!/usr/bin/env python3
"""List or remove obsolete hashed narration files after rebuilding the manifest."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "public/audio/reading"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--delete", action="store_true", help="Remove files not referenced by the 454-story manifest")
    args = parser.parse_args()
    manifest = json.loads((ROOT / "app/lib/reading-audio-manifest.json").read_text())
    if len(manifest) != 454:
        raise RuntimeError("Refusing to prune before all 454 stories have manifest entries")
    keep = {Path(asset[key]).name for asset in manifest.values() for key in ("src", "timingSrc")}
    stale = [path for path in DIRECTORY.iterdir()
             if path.is_file() and path.name.startswith("reading-")
             and path.suffix in {".webm", ".m4a", ".json"} and path.name not in keep]
    size = sum(path.stat().st_size for path in stale)
    print(f"{len(stale)} stale files, {size / 1024 / 1024:.1f} MiB")
    if args.delete:
        for path in stale:
            path.unlink()


if __name__ == "__main__":
    main()
