import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

import { A1_STORIES } from "../app/a1-curriculum";

const projectRoot = path.resolve(import.meta.dirname, "..");
const audioDir = path.join(projectRoot, "public", "audio");
const workDir = path.resolve(process.env.LESELAUT_AUDIO_WORK_DIR ?? path.join(projectRoot, ".audio-work"));
const piperBin = process.env.PIPER_BIN;
const piperModel = process.env.PIPER_MODEL;

if (!piperBin || !piperModel) {
  throw new Error("Set PIPER_BIN and PIPER_MODEL before generating story audio.");
}

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}

await mkdir(audioDir, { recursive: true });
await mkdir(workDir, { recursive: true });

async function generateStory(story: (typeof A1_STORIES)[number]) {
  const id = String(story.number).padStart(3, "0");
  const textPath = path.join(workDir, `story-${id}.txt`);
  const wavPath = path.join(workDir, `story-${id}.wav`);
  const outputPath = path.join(audioDir, `story-${id}.webm`);

  try {
    await access(outputPath);
    console.log(`Kept ${id}/100 · ${story.title}`);
    return;
  } catch {
    // Generate missing audio below.
  }

  await writeFile(textPath, story.text, "utf8");
  await run(piperBin, [
    "--model", piperModel,
    "--input-file", textPath,
    "--output-file", wavPath,
    "--length-scale", "1.08",
    "--sentence-silence", "0.28",
  ]);
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", wavPath,
    "-c:a", "libopus", "-b:a", "28k", "-vbr", "on",
    outputPath,
  ]);
  await rm(textPath);
  await rm(wavPath);
  console.log(`Generated ${id}/100 · ${story.title}`);
}

let nextStory = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (nextStory < A1_STORIES.length) {
    const story = A1_STORIES[nextStory];
    nextStory += 1;
    await generateStory(story);
  }
}));

await rm(workDir, { recursive: true });
