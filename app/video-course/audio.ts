'use client';
import audioMap from '@/app/video-course/data/audio-map.json';
import type { AudioRef } from '@/app/video-course/types';

const MAP = audioMap as Record<string, string>;
let current: HTMLAudioElement | null = null;

export const hasRecording = (ref: AudioRef) => !!MAP[`${ref.who}|${ref.text}`];

function speak(text: string, rate = 0.9) {
  return new Promise<void>(resolve => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text.replace(/…/g, ''));
    u.lang = 'de-DE'; u.rate = rate; u.onend = () => resolve(); u.onerror = () => resolve();
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  });
}

function playFile(key: string, rate = 1) {
  return new Promise<void>(resolve => {
    current?.pause();
    const a = new Audio(`/video-course/audio/${key}.mp3`);
    a.playbackRate = rate; current = a;
    a.onended = () => resolve(); a.onerror = () => resolve();
    a.play().catch(() => resolve());
  });
}

/** Plays the character's real voice from the video; falls back to the browser's German voice. */
export async function playLine(ref: AudioRef, slow = false) {
  const rate = slow ? 0.75 : 1;
  const key = MAP[`${ref.who}|${ref.text}`];
  if (key) return playFile(key, rate);
  const parts = ref.text.split(/ \/ | – | · /).map(p => p.trim());
  if (parts.length > 1 && parts.every(p => MAP[`${ref.who}|${p}`])) {
    for (const p of parts) await playFile(MAP[`${ref.who}|${p}`], rate);
    return;
  }
  return speak(ref.text, slow ? 0.7 : 0.9);
}
