import type { CefrLevel, Unit } from "@/app/curriculum";

type UnitCopy = Pick<Unit, "title" | "shortTitle" | "description">;

const UNIT_COPY: Partial<Record<CefrLevel, readonly UnitCopy[]>> = {
  A1: [
    { title: "Introductions", shortTitle: "Introductions", description: "Greet people, share personal information, and ask simple questions." },
    { title: "Family and People", shortTitle: "Family", description: "Talk about family, age, jobs, appearance, and relationships." },
    { title: "Home and Living", shortTitle: "Home", description: "Name rooms and furniture and explain where things are." },
    { title: "My Day and Time", shortTitle: "Daily Life", description: "Tell the time, make plans, and describe a daily routine." },
    { title: "Food and Drink", shortTitle: "Food", description: "Order food, shop for groceries, and express simple preferences." },
    { title: "Shopping and Clothes", shortTitle: "Shopping", description: "Ask about prices, sizes, and colours and buy everyday items." },
    { title: "Around Town", shortTitle: "Town", description: "Find places, understand directions, and use public services." },
    { title: "Work, School, and Daily Tasks", shortTitle: "Work and School", description: "Handle simple tasks at work, school, and service counters." },
    { title: "Free Time, Weather, and Health", shortTitle: "Free Time", description: "Talk about hobbies, weather, seasons, and simple health problems." },
    { title: "Travel and Real-Life A1", shortTitle: "Travel and Review", description: "Travel, stay at a hotel, and bring the full A1 level together." },
  ],
  A2: [
    { title: "New Directions", shortTitle: "New Directions", description: "Talk about change, relationships, and daily situations with longer connected sentences." },
    { title: "Family and Relationships", shortTitle: "Relationships", description: "Talk about people, feelings, and changes in relationships." },
    { title: "Housing and Neighbours", shortTitle: "Housing", description: "Look for a home, understand rules, and communicate with neighbours." },
    { title: "Time, Appointments, and Routine", shortTitle: "Appointments", description: "Plan, cancel, and set priorities in everyday life." },
    { title: "Food and Health", shortTitle: "Health", description: "Talk about nutrition, symptoms, and helpful habits." },
    { title: "Shopping and Money", shortTitle: "Shopping", description: "Compare products, make complaints, and discuss prices." },
    { title: "City and Transport", shortTitle: "Getting Around", description: "Explain routes, help while travelling, and react to problems." },
    { title: "Travel and Accommodation", shortTitle: "Travel", description: "Prepare and book a trip and solve small travel problems." },
    { title: "School and Learning", shortTitle: "Learning", description: "Find learning strategies, ask questions, and practise with others." },
    { title: "Work and Careers", shortTitle: "Careers", description: "Talk about tasks, applications, and teamwork." },
    { title: "Services and Public Offices", shortTitle: "Everyday Services", description: "Understand forms, ask for information, and use everyday services." },
    { title: "Free Time and Culture", shortTitle: "Free Time", description: "Explain preferences, make suggestions, and plan together." },
    { title: "Media and Digital Life", shortTitle: "Digital Life", description: "Understand messages, solve technical problems, and compare information." },
    { title: "Nature, Weather, and Environment", shortTitle: "Nature", description: "Describe weather, discuss the environment, and make simple plans." },
    { title: "Celebrations and Shared Plans", shortTitle: "Celebrations", description: "Invite people, organise events, and discuss cultural differences politely." },
    { title: "A2 Missions", shortTitle: "Missions", description: "Combine familiar topics, solve problems, and respond clearly." },
  ],
  B1: [
    { title: "Life Stories and Turning Points", shortTitle: "Life Stories", description: "Give connected accounts of experiences, changes, and important decisions." },
    { title: "Relationships and Conflict", shortTitle: "Relationships", description: "Express feelings precisely, clear up misunderstandings, and negotiate compromises." },
    { title: "Housing and Neighbourhoods", shortTitle: "Living Together", description: "Describe housing problems, discuss rules, and develop shared solutions." },
    { title: "Work and Professional Growth", shortTitle: "Working Life", description: "Present experience, take responsibility, and explain career decisions." },
    { title: "Education and Lifelong Learning", shortTitle: "Learning Paths", description: "Compare learning strategies, summarise information, and reflect on progress." },
    { title: "Health and Wellbeing", shortTitle: "Healthy Living", description: "Describe symptoms accurately, weigh advice, and discuss habits." },
    { title: "Consumer Choices, Money, and Responsibility", shortTitle: "Money Matters", description: "Assess offers, explain complaints, and weigh financial decisions." },
    { title: "Travel and Mobility", shortTitle: "On the Move", description: "Tell detailed travel stories, compare information, and respond to problems." },
    { title: "Services and Public Life", shortTitle: "Public Life", description: "Understand formal processes, present requests clearly, and use rights respectfully." },
    { title: "Media and the Digital World", shortTitle: "Media", description: "Assess sources, recognise viewpoints, and reflect on digital communication." },
    { title: "Culture, Language, and Identity", shortTitle: "Culture", description: "Compare experiences, handle ambiguity, and describe cultural perspectives." },
    { title: "Environment and Sustainable Living", shortTitle: "Environment", description: "Explain causes and effects, evaluate measures, and plan shared projects." },
    { title: "Technology and Change", shortTitle: "Technology", description: "Explain developments, weigh opportunities and risks, and understand instructions." },
    { title: "Society and Generations", shortTitle: "Society", description: "Describe social change, compare perspectives, and discuss participation." },
    { title: "Opinions and Constructive Discussion", shortTitle: "Making a Case", description: "Structure viewpoints, respond to objections, and keep discussions constructive." },
    { title: "Plans, Decisions, and the Future", shortTitle: "The Future", description: "Develop goals, express uncertainty, and make well-reasoned decisions." },
    { title: "B1 Exam Practice in Daily Life", shortTitle: "Exam Practice", description: "Combine reading, listening, writing, and speaking in realistic B1 tasks." },
    { title: "B1 Missions: Acting Independently", shortTitle: "Missions", description: "Combine topics and text types, make decisions, and present results." },
  ],
};

export function getUnitCopy(level: CefrLevel, unit: Unit): UnitCopy {
  return UNIT_COPY[level]?.[unit.id - 1] ?? unit;
}

export const LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "Fundamentals",
  A2: "Everyday Life",
  B1: "Independent",
  B2: "Confident",
};
