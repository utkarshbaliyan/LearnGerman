import type { TutorPatternId } from "./tutor-patterns";

type Scenario = { title: string; prompt: string };
// Each pair changes the situation while eliciting the same construction. No model answers are sent.
export const PRACTICE_SCENARIOS: Record<TutorPatternId, [Scenario, Scenario]> = {
  "verb-agreement": [
    { title: "A new flatmate", prompt: "Write to a potential flatmate. Describe what you do on weekdays, what your current flatmate does, and what you could do together. Ask about their routine." },
    { title: "A volunteer team", prompt: "Tell a volunteer organizer which jobs you can do, what your friend can do, and what you both want to do together. Ask when the team meets." },
  ],
  "verb-position": [
    { title: "Change a course appointment", prompt: "Write to your language teacher. You cannot attend tomorrow. Explain why, describe when you are available instead, and ask to move the appointment." },
    { title: "A delayed delivery", prompt: "Write to a shop about a package you need for an upcoming event. Explain why you need it soon, what you will do if it arrives late, and ask for a solution." },
  ],
  "case-articles": [
    { title: "Return a borrowed item", prompt: "Write to a neighbor about a book and a key you borrowed. Say who gave you each item, whom you will return them to, and ask where to meet." },
    { title: "Choose a birthday present", prompt: "Write to a sibling about a birthday gift. Say whom you want to give it to, describe the gift you found, and ask whom you should invite to the celebration." },
  ],
  "tense": [
    { title: "A weekend update", prompt: "Send a friend a message about yesterday's outing. Describe two things that happened, something that went wrong, and your plan for next weekend." },
    { title: "Your first day", prompt: "Tell a friend about your first day at a new job or course. Explain what happened, how you felt, and what you will do next time." },
  ],
  "prepositions": [
    { title: "Find the meeting point", prompt: "Tell a visiting friend where you are waiting and how to reach you from the station. Describe two landmarks and where to go if it rains." },
    { title: "Plan a room", prompt: "Explain to a flatmate where the furniture is now and where you want to move it. Mention a table, a chair and a window, and ask for help." },
  ],
  "adjective-endings": [
    { title: "Find a lost bag", prompt: "Write to the lost-property office. Describe your bag and two things inside it using specific colors, sizes or other distinguishing details. Ask whether they found it." },
    { title: "Choose a second-hand bike", prompt: "Write to a bicycle seller. Describe the kind of bike you need, compare it with your old bike, and ask about a particular feature." },
  ],
  "negation": [
    { title: "Decline an invitation", prompt: "Politely decline an invitation. Explain what you cannot do, something you do not have, and what you would like to do another time." },
    { title: "Correct a booking", prompt: "Write to a hotel. Explain two things that are wrong in your booking and one service you do not need. Ask them to confirm the changes." },
  ],
  "spelling": [
    { title: "A neighborhood notice", prompt: "Write a short notice inviting neighbors to a shared breakfast. Say the day, location, food and drinks, and what guests should bring." },
    { title: "A club announcement", prompt: "Write a short announcement for a book club. Mention the next meeting, what participants will read, and how someone can join." },
  ],
  "other": [
    { title: "Ask for help", prompt: "Write to a friend about a practical problem with your home or studies. Explain the problem clearly, suggest a solution, and ask for specific help." },
    { title: "Make a suggestion", prompt: "Write to a class organizer suggesting an activity. Explain what students would do, why it would help, and what the organizer needs to arrange." },
  ],
};

export type PracticeTask = { id: string; patternId: TutorPatternId; title: string; prompt: string; level: "A1" | "A2" | "B1"; variant: number };
export function getPracticeTask(id: string): PracticeTask | null {
  const match = /^practice-(a1|a2|b1)-(.+)-([12])$/.exec(id);
  if (!match || !Object.hasOwn(PRACTICE_SCENARIOS, match[2])) return null;
  const patternId = match[2] as TutorPatternId;
  const scenario = PRACTICE_SCENARIOS[patternId][Number(match[3]) - 1];
  return { id, patternId, ...scenario, level: match[1].toUpperCase() as PracticeTask["level"], variant: Number(match[3]) };
}
