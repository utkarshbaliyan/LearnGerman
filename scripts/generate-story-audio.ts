import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

import { A1_STORIES } from "../app/curriculum/a1";
import { A2_STORIES } from "../app/curriculum/a2";

const projectRoot = path.resolve(import.meta.dirname, "..");
const level = process.env.LESELAUT_LEVEL ?? "a1";
const allStories = level === "a2" ? A2_STORIES : A1_STORIES;
const limit = Number(process.env.LESELAUT_AUDIO_LIMIT ?? "0");
const start = Number(process.env.LESELAUT_AUDIO_START ?? "0");
const from = Number.isInteger(start) && start >= 0 ? start : 0;
const stories = Number.isInteger(limit) && limit > 0
  ? allStories.slice(from, from + limit)
  : allStories.slice(from);
if (level !== "a1" && level !== "a2") {
  throw new Error(`Unsupported level: ${level}`);
}
const audioDir = path.join(projectRoot, "public", "audio", level);
const workDir = path.resolve(process.env.LESELAUT_AUDIO_WORK_DIR ?? path.join(projectRoot, ".audio-work"));
const piperPython = process.env.PIPER_PYTHON;
const piperModel = process.env.PIPER_MODEL;

if (!piperPython || !piperModel) {
  throw new Error("Set PIPER_PYTHON and PIPER_MODEL before generating story audio.");
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
const manifestPath = path.join(workDir, "stories.json");
await writeFile(manifestPath, JSON.stringify(stories), "utf8");
await run(piperPython, [
  path.join(projectRoot, "scripts", "synthesize-story-audio.py"),
  "--manifest", manifestPath,
  "--model", piperModel,
  "--audio-dir", audioDir,
  "--work-dir", workDir,
]);

await rm(workDir, { recursive: true });
