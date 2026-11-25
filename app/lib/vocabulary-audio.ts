// Recorded pronunciations (local Qwen voice) for the word library: public/audio/vocabulary/<file>.mp3,
// rendered by render-vocabulary-voices.command and converted by scripts/build-vocabulary-audio.mjs.
// Words without a recording fall back to the browser's German voice.

/** File name for a vocabulary ID; must match safe() in the render queue (ASCII only). */
export function vocabularyAudioFile(id: string) {
  return id.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'sz').replace(/[^a-z0-9-]/g, '_');
}
export const vocabularyAudioUrl = (id: string) => `/audio/vocabulary/${vocabularyAudioFile(id)}.mp3`;

let current: HTMLAudioElement | null = null;

export function stopVocabularyAudio() {
  current?.pause(); current = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function speakGerman(text: string, rate = 0.82): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return resolve(false);
    const speech = window.speechSynthesis, voices = speech.getVoices(), u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = rate;
    u.voice = voices.find(v => v.lang.toLowerCase() === 'de-de') ?? voices.find(v => v.lang.toLowerCase().startsWith('de')) ?? null;
    u.onend = () => resolve(true); u.onerror = () => resolve(false);
    speech.cancel(); speech.speak(u);
  });
}

/** Plays the recorded pronunciation; resolves false only when nothing could be played. */
export function playVocabularyWord(word: { id?: string; german: string }): Promise<boolean> {
  stopVocabularyAudio();
  if (!word.id) return speakGerman(word.german);
  return new Promise(resolve => {
    const audio = new Audio(vocabularyAudioUrl(word.id!));
    let settled = false;
    const finish = (ok: boolean) => { if (!settled) { settled = true; resolve(ok); } };
    const fallback = () => { if (settled || current !== audio) return; settled = true; speakGerman(word.german).then(resolve); };
    current = audio;
    audio.onended = () => finish(true);
    audio.onerror = fallback;
    audio.play().catch(fallback);
  });
}
