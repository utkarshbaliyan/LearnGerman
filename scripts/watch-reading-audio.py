#!/usr/bin/env python3
"""Render authored B1 stories as they arrive from the resumable draft generator.

This local helper does not publish; run the full audio generator after editorial
review to rebuild the final manifest and recordings for any revised stories.
"""
import argparse
import hashlib
import json
import re
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def pending():
    authored = json.loads((ROOT / "content/reading/long-stories.json").read_text())
    compiled = json.loads((ROOT / "app/lib/reading-expanded-data.json").read_text())
    by_id = {story["id"]: story for story in compiled}
    for story_id in authored:
        match = re.fullmatch(r"reading-b1-(\d+)-v1", story_id)
        if not match or int(match[1]) < 37 or story_id not in by_id:
            continue
        digest = hashlib.sha256(by_id[story_id]["text"].encode()).hexdigest()[:12]
        stem = f"{story_id}-{digest}-opus16"
        audio = ROOT / "public/audio/reading" / f"{stem}.webm"
        timing = audio.with_suffix(".json")
        if not (audio.exists() and timing.exists()):
            yield story_id


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--python", required=True, type=Path)
    args = parser.parse_args()
    while True:
        authored = json.loads((ROOT / "content/reading/long-stories.json").read_text())
        subprocess.run(["node", "scripts/build-reading-expansion.mjs", "--draft"], cwd=ROOT, check=True)
        for story_id in pending():
            subprocess.run([str(args.python), "scripts/generate-reading-audio.py",
                            "--model", str(args.model), "--only", story_id, "--threads", "2"],
                           cwd=ROOT, check=True)
        if len(authored) == 454:
            break
        time.sleep(60)


if __name__ == "__main__":
    main()
