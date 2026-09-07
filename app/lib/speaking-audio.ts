export const MAX_SPEAKING_AUDIO_BYTES = 5 * 1024 * 1024;
const AUDIO_EXTENSIONS: Record<string, string> = { "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "mp4", "audio/mpeg": "mp3", "audio/wav": "wav", "audio/x-wav": "wav" };
export function speakingAudioType(type: string) { return type.split(";", 1)[0].trim().toLowerCase(); }
export function speakingAudioProblem(audio: { size: number; type: string }): string | null {
  if (audio.size < 100) return "No usable audio was captured. Check your microphone and record again.";
  if (audio.size > MAX_SPEAKING_AUDIO_BYTES) return "Your recording exceeds 5 MB. Record a shorter response and try again.";
  if (!Object.hasOwn(AUDIO_EXTENSIONS, speakingAudioType(audio.type))) return "This recording format is not supported. Try recording in Chrome, Edge or Safari.";
  return null;
}
export function speakingAudioFile(audio: Blob): File {
  const type = speakingAudioType(audio.type);
  const problem = speakingAudioProblem(audio);
  if (problem) throw new Error(problem);
  return new File([audio], `response.${AUDIO_EXTENSIONS[type]}`, { type });
}
