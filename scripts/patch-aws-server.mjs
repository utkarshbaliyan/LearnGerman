// Vinext 0.0.50's static server has no audio/video content types, so .webm/.m4a
// are sent as application/octet-stream and Safari refuses to play them.
// Register them on the shared CONTENT_TYPES table before the server starts.
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2] ?? 'dist/standalone/server.js';
const marker = '// leselaut: media content types';
const source = readFileSync(file, 'utf8');
if (source.includes(marker)) process.exit(0);
const anchor = 'import { startProdServer } from "vinext/server/prod-server";';
if (!source.includes(anchor)) throw new Error(`Unexpected standalone server entry: ${file}`);
const patch = `${anchor}
${marker}
import { CONTENT_TYPES } from "./node_modules/vinext/dist/server/static-file-cache.js";
Object.assign(CONTENT_TYPES, { ".webm": "audio/webm", ".m4a": "audio/mp4", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".vtt": "text/vtt", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".webmanifest": "application/manifest+json" });`;
writeFileSync(file, source.replace(anchor, patch));
