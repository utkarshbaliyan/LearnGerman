import type { TutorPatternId } from "./tutor-patterns";
export type SpeakingMission = { id: string; title: string; goal: string; role: string; opening: string; patternId: TutorPatternId; level: "A1" | "A2" | "B1"; turns: number };
const missions = [
  { title: "Reschedule an appointment", goal: "Explain why you cannot attend, suggest another time and agree on a replacement appointment.", role: "a language-school receptionist", opening: "Guten Tag! Sie möchten Ihren Termin ändern. Was ist passiert?", patternId: "verb-position" },
  { title: "Find a suitable flat", goal: "Describe who will live in the flat, your routines and your needs; ask questions and arrange a viewing.", role: "a potential landlord", opening: "Hallo! Wer möchte in die Wohnung einziehen?", patternId: "verb-agreement" },
  { title: "Report a lost bag", goal: "Describe the bag and its contents, explain where you lost it, and agree how to collect it if found.", role: "a lost-property clerk", opening: "Guten Tag! Was haben Sie verloren?", patternId: "adjective-endings" },
  { title: "Explain a travel problem", goal: "Explain what happened on your journey, what you have already tried, and ask for a practical solution.", role: "a railway service assistant", opening: "Guten Tag. Was ist auf Ihrer Reise passiert?", patternId: "tense" },
  { title: "Meet a visiting friend", goal: "Explain where you are, give directions and agree on a backup meeting point.", role: "a friend visiting your town", opening: "Hallo! Ich bin am Bahnhof. Wo treffen wir uns?", patternId: "prepositions" },
  { title: "Correct a restaurant order", goal: "Explain what is wrong with your order, say what you cannot eat and request a suitable replacement.", role: "a restaurant server", opening: "Entschuldigung, stimmt etwas mit Ihrer Bestellung nicht?", patternId: "negation" },
  { title: "Choose a present together", goal: "Decide whom to give a present to, discuss possible gifts and agree who will buy it.", role: "a friend planning a birthday", opening: "Wir brauchen noch ein Geschenk. Für wen kaufen wir etwas?", patternId: "case-articles" },
  { title: "Join a volunteer group", goal: "Explain what you and a friend can do, ask about the schedule and agree on your first activity.", role: "a volunteer coordinator", opening: "Willkommen! Wie möchten Sie uns helfen?", patternId: "verb-agreement" },
  { title: "Ask a neighbor for help", goal: "Explain a problem in your home, describe what you tried and agree on a way to solve it.", role: "a helpful neighbor", opening: "Hallo! Du brauchst Hilfe. Was ist los?", patternId: "verb-position" },
  { title: "Plan a weekend outing", goal: "Discuss what you did last weekend, suggest a new activity and agree on time and transport.", role: "a friend planning the weekend", opening: "Was hast du letztes Wochenende gemacht?", patternId: "tense" },
] as const;
export function getSpeakingMission(taskId: string): SpeakingMission | null {
  const match = /^(a1|a2|b1)-([1-4])-([1-6])$/.exec(taskId);
  if (!match) return null;
  const index = ((Number(match[2]) - 1) * 6 + Number(match[3]) - 1) % missions.length;
  return { ...missions[index], id: `mission-${index + 1}`, level: match[1].toUpperCase() as SpeakingMission["level"], turns: 4 };
}
export type SpeakingState = {
  mode: "conversation" | "focus"; startedAt: string; ended: boolean;
  turns: { id: string; prompt: string; originalTranscript: string; text: string; reply: string; createdAt: string }[];
  transcript?: { id: string; original: string; text: string; consentAt: string; consumed: boolean };
  requests: { id: string; hash: string; action: string; status: "pending" | "complete" | "failed"; createdAt: string }[];
};
