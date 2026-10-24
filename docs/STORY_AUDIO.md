# Story narration on phones

The 24 October 2026 iPhone/Safari report described recordings failing to start or
stopping after the first lines. The affected A1 recording was a complete 60.24 s
WebM/Opus file. Production returned correct 206 byte ranges but labelled the
static file `application/octet-stream`. WebM support also varies across older
iPhone versions. These observations do not establish which particular Safari
failure occurred on the owner's phone.

Stories now offer an AAC-LC recording in fast-start MP4 first, with the original
WebM as a typed fallback. All 654 existing A1–B2 recordings were transcoded locally;
no speech was regenerated and no AI provider was called. The source URL, source
SHA-256, text hash and encoded duration are pinned in
`content/reading/compatible/audio-manifest.json`. Timing remains tied to the
original recording and story text.

AAC files live in the existing private media bucket, outside the application
archive. The read-only `/media/stories/compatible/[asset]` route admits only
registered, hash-pinned names and checks stored size/checksum metadata before
streaming. It returns `audio/mp4`, byte ranges, full length, immutable caching
and an ETag. An unregistered or corrupt object cannot be served as a valid story.

Word highlighting previously updated React context state and rebuilt the entire
passage, including its word tooltips, for every spoken word. A stable highlighter
now updates the previous and current word classes directly within the registered
passage. Repeated animation frames for the same word do no DOM work. End, restart,
seek and unmount clear or move the highlight without replacing the audio element.
The player also reports buffering and offers its existing reload action on error.

## Preparing a new recording release

Run from the repository with a trusted local FFmpeg installation:

```sh
node scripts/prepare-compatible-story-audio.mjs \
  --ffmpeg /path/to/ffmpeg \
  --output /private/tmp/leselaut-compatible-story-audio
node scripts/upload-compatible-story-audio.mjs \
  /private/tmp/leselaut-compatible-story-audio
```

The preparer reads Git-backed public originals and checksum-verified published
B2 objects, writes resumable local checkpoints, and emits the release manifests.
It checks a full AAC decode, duration within 150 ms of the source, and MP4 metadata
before media data (`moov` before `mdat`). The uploader uses the operator's existing
AWS credentials, refuses to overwrite an immutable object, and verifies S3 size,
checksum and MIME metadata. Never commit credentials or temporary audio files.

Upload and verify every object **before** deploying the manifest and player.
Changing story text or the original audio requires a matching regenerated entry;
stale alternatives are not attached to the player. Application rollback can use
the original recordings, which remain available.

## Verification

Automated checks cover complete catalog/source matching, duration bounds,
registered names, Safari's initial two-byte probe, middle/tail ranges, HEAD, ETag,
invalid ranges and corrupt-object rejection. Highlighting checks cover unchanged
frames, word transitions, replacement passages and unmount cleanup.

A local browser exercise uses the actual player and converted A1-09 recording,
with a visible passage-render count. This validates playback and removal of
repeated passage renders; it does not replace a pass on the owner's physical
iPhone. After deployment, test play through the final sentence, pause/resume,
restart, seeking and speed changes in Safari on that phone.

On 24 October 2026 the owner confirmed that the affected story plays fully and
smoothly in Safari on their physical iPhone. Production deployment and live
A1–B2 media delivery checks also passed. This confirms the reported playback
problem is resolved on that device; it does not establish coverage of all phones.
