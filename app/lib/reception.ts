import data from './reception-data.json';
import audio from './reception-audio.json';
import type { ReceptionLesson } from './reception-types';
export const RECEPTION_LESSONS = data as ReceptionLesson[];
export function getReceptionLesson(id: string) { return RECEPTION_LESSONS.find(lesson => lesson.id === id); }
export type ReceptionAudio = { src: string; duration: number; starts: number[]; textHash: string; voices: string[]; synthetic: boolean };
export function getReceptionAudio(id: string): ReceptionAudio | undefined { return (audio as Record<string, ReceptionAudio>)[id]; }
