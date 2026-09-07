export type ChapterOutputTask = { id: string; level: "A1" | "A2" | "B1"; chapter: number; title: string; writing: string; questions: string[]; starter?: string; writingSize: string; suggestedWords: number; speakingSize: string; rubric: string };
const BANK: Record<string, string[][]> = {
  "A1": [
    [
      "Say hello",
      "Introduce yourself with your name and one simple detail: who you are or how you feel.",
      "Ich bin Alex. Wer bist du?",
      "Bist du neu hier?",
      "Ich bin …"
    ],
    [
      "What you do",
      "Tell a classmate two things you do, using regular present-tense verbs.",
      "Was machst du?",
      "Lernst du Deutsch?",
      "Ich lerne …"
    ],
    [
      "Your everyday habits",
      "Say what you read and which language you speak.",
      "Was liest du?",
      "Sprichst du Deutsch?",
      "Ich lese …"
    ],
    [
      "Today and tomorrow",
      "Write three simple sentences about what you do today and tomorrow.",
      "Was machst du heute?",
      "Was machst du morgen?",
      "Heute lerne ich …"
    ],
    [
      "Get to know someone",
      "Ask a new classmate two simple questions and answer one about yourself.",
      "Wie heißt du?",
      "Wo wohnst du?",
      "Wie …?"
    ],
    [
      "Yes or no",
      "Say two things that are true about you and one thing that is not.",
      "Bist du müde?",
      "Hast du ein Auto?",
      "Ich bin nicht …"
    ],
    [
      "Name things at home",
      "Label three things at home with der, die or das. Add one short sentence.",
      "Was ist das? Ein Tisch. Sag es mit der.",
      "Was ist das? Eine Lampe. Sag es mit die.",
      "Das ist der …"
    ],
    [
      "Describe a room",
      "Write three short sentences naming things in a room with ein or eine.",
      "Was ist in deinem Zimmer?",
      "Ist das ein Tisch?",
      "Das ist ein …"
    ],
    [
      "One and many",
      "Make a small list of things for your day: one item and its plural. Use three pairs.",
      "Ein Buch, zwei …?",
      "Eine Tasche, zwei …?",
      "ein Buch — zwei Bücher"
    ],
    [
      "Who does what?",
      "Describe three people and what each does. Keep the subject clear.",
      "Wer lernt Deutsch?",
      "Wer kocht heute?",
      "Der Mann …"
    ],
    [
      "Your shopping list",
      "Tell someone three things you need to buy. Use brauchen and the accusative.",
      "Was brauchst du?",
      "Brauchst du einen Apfel?",
      "Ich brauche …"
    ],
    [
      "Whose is it?",
      "Write three sentences saying which things belong to you or another person.",
      "Ist das deine Tasche?",
      "Wo ist dein Buch?",
      "Das ist mein …"
    ],
    [
      "What you can do",
      "Tell a friend what you can do and what you need to do today.",
      "Was kannst du gut machen?",
      "Was musst du heute machen?",
      "Kannst du morgen kommen?",
      "Ich kann …"
    ],
    [
      "Your daily routine",
      "Describe three steps in your day using separable verbs.",
      "Wann stehst du auf?",
      "Wann kaufst du ein?",
      "Wen rufst du an?",
      "Ich stehe … auf."
    ],
    [
      "Give simple directions",
      "Write three short instructions for a visitor, using the imperative.",
      "Ich bin hier. Was soll ich machen?",
      "Soll ich geradeaus gehen?",
      "Soll ich hier warten?",
      "Geh …"
    ],
    [
      "Order a drink",
      "Write a short café order. Say what you like and what you would like now.",
      "Was möchten Sie trinken?",
      "Möchten Sie auch etwas essen?",
      "Noch etwas?",
      "Ich möchte …"
    ],
    [
      "What is nearby?",
      "Describe what there is in your town and one thing it does not have.",
      "Was gibt es in deiner Stadt?",
      "Gibt es einen Park?",
      "Hat deine Stadt ein Kino?",
      "Es gibt …"
    ],
    [
      "Getting ready",
      "Write a few sentences about how you get ready in the morning.",
      "Wann stehst du auf?",
      "Wann wäschst du dich?",
      "Freust du dich auf den Tag?",
      "Ich wasche mich …"
    ],
    [
      "Helping someone",
      "Tell a classmate whom you help and whom you give something to.",
      "Wem hilfst du?",
      "Was gibst du der Person?",
      "Hilft die Person dir auch?",
      "Ich helfe …"
    ],
    [
      "A free afternoon",
      "Write a short message saying who you meet and where you go, using mit and zu.",
      "Mit wem triffst du dich?",
      "Wohin gehst du danach?",
      "Seit wann kennst du die Person?",
      "Ich gehe mit …"
    ],
    [
      "Where are things?",
      "Tell a friend where three things are in your room. Use location phrases.",
      "Wo ist dein Buch?",
      "Wo steht dein Tisch?",
      "Wo ist deine Tasche?",
      "Das Buch liegt …"
    ],
    [
      "Arrange a meeting",
      "Write a short invitation with a day, time and meeting place.",
      "Wann hast du Zeit?",
      "Um wie viel Uhr treffen wir uns?",
      "Wo treffen wir uns?",
      "Am … habe ich Zeit."
    ],
    [
      "Choose a plan",
      "Offer a friend two simple plans. Say which you prefer using und, aber or denn.",
      "Was möchtest du am Wochenende machen?",
      "Möchtest du lieber lesen oder spazieren gehen?",
      "Warum?",
      "Ich möchte …, aber …"
    ],
    [
      "Yesterday",
      "Write a short message about two things you did yesterday. Use familiar perfect-tense forms.",
      "Was hast du gestern gemacht?",
      "Was hast du gegessen?",
      "Bist du spazieren gegangen?",
      "Gestern habe ich …"
    ]
  ],
  "A2": [
    [
      "Help a new classmate",
      "Write a short welcome message: offer a classmate help, say what you can show them and ask what they need.",
      "Wobei kannst du mir helfen?",
      "Was kannst du mir zeigen?",
      "Was soll ich mitbringen?"
    ],
    [
      "Move into a room",
      "Tell a friend where to put two things and where they are afterwards.",
      "Wohin stellen wir den Tisch?",
      "Wo steht er jetzt?",
      "Wohin legen wir die Bücher?"
    ],
    [
      "Choose a gift",
      "Write a short message about a gift for a friend: what it is, who it is for and what you need to buy.",
      "Für wen suchen wir ein Geschenk?",
      "Was kaufen wir für die Person?",
      "Was brauchen wir noch?"
    ],
    [
      "Visit a friend",
      "Write to a friend about your visit: where you are coming from, who comes with you and how you travel.",
      "Woher kommst du?",
      "Mit wem kommst du?",
      "Wie kommst du zu mir?"
    ],
    [
      "Return a lost item",
      "Describe a found item and explain whose it is. Ask how to return it.",
      "Was hast du gefunden?",
      "Wem gehört es?",
      "Wie können wir es zurückgeben?"
    ],
    [
      "Find the meeting place",
      "Describe a place and a person clearly so a visitor can find your meeting.",
      "Wo treffen wir uns?",
      "Wie erkenne ich das richtige Gebäude?",
      "Wie erkenne ich dich?"
    ],
    [
      "Describe what you need",
      "Write a short request for a useful item. Describe its size, colour and purpose.",
      "Was brauchst du?",
      "Wie soll es aussehen?",
      "Wofür brauchst du es?"
    ],
    [
      "Compare two options",
      "Compare two everyday choices and tell a friend which is better for you.",
      "Welche zwei Möglichkeiten haben wir?",
      "Welche ist günstiger?",
      "Welche passt besser zu dir?"
    ],
    [
      "Choose in a shop",
      "Write a message asking about two items and choosing one. Use dieser and welcher.",
      "Welchen Pullover suchen Sie?",
      "Gefällt Ihnen dieser hier?",
      "Welche Farbe möchten Sie?"
    ],
    [
      "Describe a helpful person",
      "Describe someone who helps you, using a simple nominative relative clause.",
      "Wer hilft dir oft?",
      "Was macht diese Person?",
      "Kennst du jemanden, der gut kochen kann?"
    ],
    [
      "Recommend a place",
      "Recommend a place you know, using an accusative relative clause to describe it.",
      "Welchen Ort empfiehlst du?",
      "Was kann man dort machen?",
      "Gibt es einen Ort, den du oft besuchst?"
    ],
    [
      "Plan together",
      "Tell a friend how you will prepare for a small trip and help each other.",
      "Wie bereiten wir uns vor?",
      "Wie können wir uns helfen?",
      "Wo treffen wir uns?"
    ],
    [
      "Share a recent experience",
      "Write a short message about what you did recently, in time order.",
      "Was hast du am Wochenende gemacht?",
      "Mit wem warst du dort?",
      "Was hat dir gefallen?",
      "Was hast du danach gemacht?"
    ],
    [
      "Explain a difficult day",
      "Tell a friend about a past day: what you had to do and what you could not do.",
      "Was musstest du gestern machen?",
      "Wie viel Zeit hattest du?",
      "Was konntest du nicht machen?",
      "Wie war der Abend?"
    ],
    [
      "Your next plan",
      "Describe a realistic plan for next week and the steps you intend to take.",
      "Was machst du nächste Woche?",
      "Was wirst du vorbereiten?",
      "Wer hilft dir dabei?",
      "Wann fängst du an?"
    ],
    [
      "Change an appointment",
      "Write a short message cancelling an appointment, give a reason with weil and suggest another time.",
      "Warum kannst du nicht kommen?",
      "Wann hast du wieder Zeit?",
      "Passt dir Freitag?",
      "Was soll ich für dich notieren?"
    ],
    [
      "Then and now",
      "Describe one past event with als and a repeated situation with wenn.",
      "Was hast du als Kind gern gemacht?",
      "Was machst du, wenn du frei hast?",
      "Wie war dein erster Schultag?",
      "Was ist heute anders?"
    ],
    [
      "Ask for information",
      "Write a polite request for information about a local activity, using an indirect question.",
      "Was möchtest du über den Kurs wissen?",
      "Weißt du, wann er beginnt?",
      "Welche Information brauchst du noch?",
      "Wie möchtest du dich anmelden?"
    ],
    [
      "Build a learning routine",
      "Tell a friend what you plan to practise and what you find useful or difficult.",
      "Was hast du vor zu lernen?",
      "Was findest du schwierig?",
      "Wie planst du zu üben?",
      "Wann hast du dafür Zeit?"
    ],
    [
      "Make a small change",
      "Explain two actions that help you or someone else reach a practical goal.",
      "Was möchtest du verbessern?",
      "Was machst du, um das zu schaffen?",
      "Wie kann ich dir helfen?",
      "Woran erkennst du Fortschritt?"
    ],
    [
      "Organise shared supplies",
      "Write to a group explaining who gets which supplies and who will bring them.",
      "Was bringen wir mit?",
      "Wem gibst du die Liste?",
      "Kannst du sie mir schicken?",
      "Wer bekommt die übrigen Sachen?"
    ],
    [
      "Plan a celebration",
      "Write an invitation explaining when, how and where you will celebrate.",
      "Wann feiern wir?",
      "Wie kommen die Gäste?",
      "Wo treffen wir uns?",
      "Was machen wir zuerst?"
    ],
    [
      "Solve a small problem",
      "Describe a problem and a practical alternative, using deshalb, trotzdem or sonst.",
      "Was ist das Problem?",
      "Was können wir deshalb machen?",
      "Was geht trotzdem?",
      "Was machen wir sonst?"
    ],
    [
      "Explain a simple process",
      "Explain how an everyday service works, using a few present-passive sentences.",
      "Was wird hier gemacht?",
      "Was wird zuerst geprüft?",
      "Was wird danach vorbereitet?",
      "Wann ist alles fertig?"
    ]
  ],
  "B1": [
    [
      "Introduce a new phase",
      "Write a connected description of your present life and one change you are making, with precise noun descriptions.",
      "Was verändert sich gerade in deinem Leben?",
      "Wie sieht dein Alltag aus?",
      "Welche neue Aufgabe ist wichtig?",
      "Was möchtest du als Nächstes erreichen?"
    ],
    [
      "Explain a decision",
      "Write about a practical decision and its circumstances, using suitable genitive phrases.",
      "Welche Entscheidung hast du getroffen?",
      "Was war der wichtigste Grund?",
      "Welche Rolle spielte deine Familie?",
      "Was war das Ergebnis?"
    ],
    [
      "Recommend a person",
      "Recommend someone for a shared activity and explain their experience and how they help others.",
      "Wen empfiehlst du?",
      "Welche Erfahrungen hat die Person?",
      "Wobei kann sie uns helfen?",
      "Warum passt sie zu uns?"
    ],
    [
      "Resolve a housing issue",
      "Write a clear message about a housing problem involving a neighbour or landlord and propose a solution.",
      "Was ist in der Wohnung passiert?",
      "Mit wem hast du gesprochen?",
      "Was wurde vereinbart?",
      "Was schlägst du jetzt vor?"
    ],
    [
      "Clarify a work plan",
      "Explain a plan, refer back to its details with da-compounds and ask focused questions.",
      "Woran arbeitest du gerade?",
      "Worauf wartest du noch?",
      "Wie gehst du damit um?",
      "Wobei brauchst du Hilfe?"
    ],
    [
      "Organise a group task",
      "Write a message dividing a familiar task among a group, including what is still unassigned.",
      "Was muss die Gruppe erledigen?",
      "Wer übernimmt schon etwas?",
      "Hat jemand noch Zeit?",
      "Was fehlt uns noch?"
    ],
    [
      "Tell a story",
      "Write a short narrative about a memorable learning experience using past-tense narration.",
      "Was ist damals passiert?",
      "Wie begann die Situation?",
      "Was war überraschend?",
      "Wie ging die Geschichte aus?"
    ],
    [
      "Explain what happened first",
      "Describe a misunderstanding and what had happened before it. Make the sequence clear.",
      "Was ist schiefgegangen?",
      "Was war vorher passiert?",
      "Wann hast du das bemerkt?",
      "Wie wurde es geklärt?"
    ],
    [
      "Plans and expectations",
      "Write about a realistic future plan, separating firm arrangements from assumptions.",
      "Was planst du für die nächsten Monate?",
      "Was steht schon fest?",
      "Was wird vermutlich schwierig?",
      "Wie bereitest du dich darauf vor?"
    ],
    [
      "Report a service problem",
      "Write a factual account of a service problem, explaining what was done and what still needs doing.",
      "Was wurde bestellt oder gebucht?",
      "Was wurde tatsächlich geliefert?",
      "Was ist bisher unternommen worden?",
      "Welche Lösung erwartest du?"
    ],
    [
      "Explain an option",
      "Describe how a practical task can be done in different ways, using passive alternatives.",
      "Was muss erledigt werden?",
      "Wie lässt sich das am besten machen?",
      "Welche andere Möglichkeit gibt es?",
      "Welche empfiehlst du?"
    ],
    [
      "Make a polite proposal",
      "Write a polite proposal for a local activity, explaining your preference and offering a compromise.",
      "Was würdest du gern organisieren?",
      "Warum wäre das sinnvoll?",
      "Was könnten andere beitragen?",
      "Welcher Kompromiss wäre möglich?"
    ],
    [
      "Reflect on a mistake",
      "Write about a past mistake, what you would have done differently and what you learned.",
      "Was ist damals schiefgelaufen?",
      "Was hättest du anders gemacht?",
      "Welche Folgen hätte das gehabt?",
      "Was machst du künftig anders?",
      "Welchen Rat gibst du anderen?"
    ],
    [
      "Prepare a backup plan",
      "Write a practical plan with conditions and a fallback if circumstances change.",
      "Was ist dein Plan?",
      "Was machst du, falls es regnet?",
      "Was wäre eine Alternative?",
      "Wer muss informiert werden?",
      "Wann entscheidest du?"
    ],
    [
      "Balance two viewpoints",
      "Compare two familiar choices fairly and explain your own preference using contrast clauses.",
      "Welche zwei Möglichkeiten vergleichst du?",
      "Was spricht für die erste?",
      "Was ist an der zweiten besser?",
      "Was ist dir persönlich wichtiger?",
      "Wie entscheidest du dich?"
    ],
    [
      "Explain a sequence",
      "Describe a change in your daily routine, showing what happens before, after and as soon as something else happens.",
      "Was hat sich verändert?",
      "Was machst du, bevor du beginnst?",
      "Was passiert danach?",
      "Seit wann machst du das so?",
      "Welche Wirkung hat es?"
    ],
    [
      "Use technology thoughtfully",
      "Write advice for a friend about a familiar device or app, including what to do and avoid.",
      "Wofür nutzt du die Technik?",
      "Wie spart sie dir Zeit?",
      "Was sollte man vermeiden?",
      "Was geht auch ohne sie?",
      "Was empfiehlst du einem Anfänger?"
    ],
    [
      "Discuss a shared choice",
      "Write a balanced recommendation for a group, connecting alternatives and advantages clearly.",
      "Was müssen wir entscheiden?",
      "Welche zwei Optionen haben wir?",
      "Was haben beide gemeinsam?",
      "Welche Nachteile bleiben?",
      "Welche Lösung empfiehlst du?"
    ],
    [
      "Explain a habit",
      "Write a short opinion about a familiar habit, using nominalized words where they sound natural.",
      "Welche Gewohnheit ist dir wichtig?",
      "Was bringt dir das im Alltag?",
      "Was fällt dir dabei schwer?",
      "Was sagen andere dazu?",
      "Was rätst du ihnen?"
    ],
    [
      "Describe an event clearly",
      "Describe a local event using a few participles as adjectives, without making the sentences unnecessarily complex.",
      "Welche Veranstaltung hast du besucht?",
      "Was ist dir aufgefallen?",
      "Wie waren die beteiligten Menschen?",
      "Gab es ein Problem?",
      "Würdest du wieder hingehen?"
    ],
    [
      "Pass on information",
      "Write a message passing on another person's plans. Distinguish what they said from your own view; dass clauses are enough.",
      "Was hat die Person erzählt?",
      "Was plant sie genau?",
      "Was ist noch unklar?",
      "Was denkst du darüber?",
      "Was möchtest du nachfragen?"
    ],
    [
      "Coordinate a request",
      "Write a clear message arranging who sends which information to whom. Avoid unclear pronoun references.",
      "Welche Unterlagen brauchen wir?",
      "Wer schickt sie wem?",
      "Kannst du mir den Ablauf erklären?",
      "Was fehlt noch?",
      "Wie bestätigen wir den Empfang?"
    ],
    [
      "Build a connected explanation",
      "Write a connected account of a familiar problem and solution. Make references and transitions easy to follow.",
      "Welches Problem möchtest du erklären?",
      "Wie ist es entstanden?",
      "Welche Lösung hast du versucht?",
      "Wie hängt das mit dem Ergebnis zusammen?",
      "Was folgt daraus?"
    ],
    [
      "Write a formal request",
      "Write a polite, clearly structured request to an organisation: explain the situation, ask for a solution and close appropriately.",
      "Was ist Ihr Anliegen?",
      "Was ist bisher passiert?",
      "Welche Lösung wünschen Sie sich?",
      "Welche Angaben sind noch wichtig?",
      "Bis wann brauchen Sie eine Antwort?"
    ]
  ]
};
export function getChapterOutputTask(taskId: string): ChapterOutputTask | null {
  const match = /^(a1|a2|b1)-([1-4])-([1-6])$/.exec(taskId);
  if (!match) return null;
  const level = match[1].toUpperCase() as ChapterOutputTask["level"];
  const chapter = (Number(match[2]) - 1) * 6 + Number(match[3]);
  const [title, writing, ...rest] = BANK[level][chapter - 1];
  const beginner = level === "A1";
  const questions = beginner ? rest.slice(0, -1) : rest;
  const writingSize = beginner ? chapter <= 3 ? "2 short sentences" : chapter <= 12 ? "3 short sentences" : "4–5 short sentences" : level === "A2" ? chapter <= 12 ? "4–6 sentences" : "6–8 sentences" : chapter <= 12 ? "A short connected text · about 80–100 words" : "A connected text · about 100–140 words";
  const rubric = `${level}, chapter ${chapter}. ${writingSize} is guidance, never a minimum word-count penalty. ${beginner ? "Accept short simple clauses and small errors when the message is clear. Never require reasons, complex connectors, past tense or untaught grammar unless this specific task teaches it. Early chapters permit fragments and formulaic answers. Give at most one short correction." : level === "A2" ? "Accept simple linked sentences on this familiar situation. Do not demand argumentation, idiomatic language or formal sophistication. Give at most two brief corrections." : "Expect connected everyday explanations with reasons and clear sequence. Do not demand academic argumentation or C-level accuracy. Give at most two brief corrections."} Assess the requested message and the chapter pattern, not unrelated missing vocabulary. Sentence starters are learning support, not a requirement to copy.`;
  return { id: taskId, level, chapter, title, writing, questions, starter: beginner ? rest.at(-1) : undefined, writingSize, suggestedWords: beginner ? chapter <= 3 ? 10 : chapter <= 12 ? 20 : 35 : level === "A2" ? chapter <= 12 ? 45 : 65 : chapter <= 12 ? 90 : 120, speakingSize: beginner ? "One short answer at a time" : level === "A2" ? "1–2 sentences per answer" : "2–3 connected sentences per answer", rubric };
}
