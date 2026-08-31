import {
  A1_LESSON_THIRTEEN_EXERCISES,
  A1_LESSON_FOURTEEN_EXERCISES,
} from "@/app/grammar/a1-lessons-thirteen-fourteen-exercises";
import {
  A1_LESSON_FIFTEEN_EXERCISES,
  A1_LESSON_SIXTEEN_EXERCISES,
} from "@/app/grammar/a1-lessons-fifteen-sixteen-exercises";
import {
  A1_LESSON_SEVENTEEN_EXERCISES,
  A1_LESSON_EIGHTEEN_EXERCISES,
} from "@/app/grammar/a1-lessons-seventeen-eighteen-exercises";
import type { GrammarLessonContent } from "@/app/grammar/course";

export const A1_MODULE_THREE_LESSONS: Record<string, GrammarLessonContent> = {
  "a1-3-1": {
    id: "a1-3-1",
    lead: "Modal verbs let you describe ability, necessity, intention, permission, and advice. They are among the most frequent verbs in spoken German, and they create a sentence bracket: the conjugated modal stands near the beginning while the main action appears as an infinitive at the end.",
    pattern: "subject + conjugated modal + middle field + infinitive · Ich kann heute kommen.",
    explanation: [
      "German modal verbs change the meaning of another verb. können expresses ability or possibility, müssen necessity, wollen intention, dürfen permission, and sollen advice, instructions, or an expectation from another source.",
      "Only the modal verb is conjugated. The second verb stays in its infinitive form: Ich muss arbeiten, not Ich muss arbeite. In a statement, the modal normally occupies position two and the infinitive closes the clause.",
      "The singular forms of können, müssen, wollen, dürfen, and sollen change their stem and have no ending with ich and er/sie/es: ich kann, er muss, sie will, ich darf, er soll. The plural forms return to the infinitive stem.",
      "In a yes/no question, the conjugated modal comes first: Kannst du helfen? In a W-question, it follows the question word: Wann kannst du helfen? The infinitive remains at the end in both patterns.",
      "Negation changes meaning carefully. nicht können means to be unable; nicht dürfen means not to be allowed; nicht müssen means not to have to. The last two are not interchangeable.",
      "German often omits an obvious action after a modal in short conversational answers: Kannst du Deutsch? – Ja, ein bisschen. The full idea is Kannst du Deutsch sprechen?, but the context supplies the action.",
    ],
    tables: [
      {
        title: "Core meanings of the A1 modal verbs",
        headers: ["Modal", "Core meaning", "German example", "English"],
        rows: [
          ["können", "ability / possibility", "Ich kann schwimmen.", "I can swim."],
          ["müssen", "necessity", "Wir müssen gehen.", "We have to leave."],
          ["wollen", "intention / strong wish", "Er will Arzt werden.", "He wants to become a doctor."],
          ["dürfen", "permission", "Darf ich hereinkommen?", "May I come in?"],
          ["sollen", "advice / instruction", "Du sollst mehr schlafen.", "You should sleep more."],
        ],
      },
      {
        title: "Present-tense forms",
        caption: "The singular loses the umlaut in können, müssen, and dürfen. ich and er/sie/es have no personal ending.",
        headers: ["Subject", "können", "müssen", "wollen", "dürfen", "sollen"],
        rows: [
          ["ich", "kann", "muss", "will", "darf", "soll"],
          ["du", "kannst", "musst", "willst", "darfst", "sollst"],
          ["er / sie / es", "kann", "muss", "will", "darf", "soll"],
          ["wir", "können", "müssen", "wollen", "dürfen", "sollen"],
          ["ihr", "könnt", "müsst", "wollt", "dürft", "sollt"],
          ["sie / Sie", "können", "müssen", "wollen", "dürfen", "sollen"],
        ],
      },
      {
        title: "The sentence bracket",
        headers: ["Sentence type", "Left bracket", "Middle field", "Right bracket"],
        rows: [
          ["statement", "Ich muss", "heute lange", "arbeiten."],
          ["time first", "Heute muss", "ich lange", "arbeiten."],
          ["yes/no question", "Musst", "du heute lange", "arbeiten?"],
          ["W-question", "Warum musst", "du heute lange", "arbeiten?"],
        ],
      },
    ],
    sections: [
      {
        title: "Choose meaning before form",
        paragraphs: [
          "Begin by asking what relationship the speaker expresses toward the action. Ability selects können; external or practical necessity selects müssen; a plan selects wollen; permission selects dürfen; advice or someone else's instruction selects sollen.",
          "The same action can take every modal and produce a different message. Learning these contrasts as a mini-dialogue is more useful than memorising five English labels.",
        ],
        examples: [
          { german: "Ich kann heute kommen.", english: "I am able to come today." },
          { german: "Ich muss heute kommen.", english: "I have to come today." },
          { german: "Ich darf heute kommen.", english: "I am allowed to come today." },
          { german: "Ich soll heute kommen.", english: "I am supposed to come today." },
        ],
      },
      {
        title: "One conjugated verb, one final infinitive",
        paragraphs: [
          "Treat the modal and infinitive as the two sides of a frame. Everything else—subject after position one, objects, time, and manner—fits between them.",
          "When a separable verb follows a modal, it stays joined because it is an infinitive: Ich rufe an becomes Ich muss anrufen. Do not split the infinitive again.",
        ],
        examples: [
          { german: "Morgen will Mia ihre Mutter anrufen.", english: "Tomorrow Mia wants to call her mother." },
          { german: "Wir müssen um sieben aufstehen.", english: "We have to get up at seven." },
          { german: "Kannst du das Licht ausmachen?", english: "Can you turn off the light?" },
        ],
      },
      {
        title: "Permission, prohibition, and necessity",
        paragraphs: [
          "Darf ich …? is the standard way to request permission. The negative Du darfst nicht … is a prohibition. By contrast, Du musst nicht … removes an obligation: you do not have to do it, but you may.",
          "For friendly advice, sollen often reports what another person recommends: Der Arzt sagt, ich soll mehr trinken. Direct personal advice can also use Du solltest later in the course.",
        ],
        examples: [
          { german: "Darf ich hier sitzen?", english: "May I sit here?" },
          { german: "Du darfst hier nicht rauchen.", english: "You are not allowed to smoke here." },
          { german: "Du musst heute nicht arbeiten.", english: "You do not have to work today." },
        ],
      },
    ],
    examples: [
      { german: "Ich kann ein bisschen Deutsch sprechen.", english: "I can speak a little German." },
      { german: "Heute müssen wir früh gehen.", english: "Today we have to leave early.", note: "The time phrase is first; müssen remains second." },
      { german: "Willst du mitkommen?", english: "Do you want to come along?" },
      { german: "Soll ich das Fenster öffnen?", english: "Shall I open the window?" },
    ],
    mistakes: [
      { wrong: "Ich kann spreche Deutsch.", right: "Ich kann Deutsch sprechen.", why: "The main action stays an infinitive at the end." },
      { wrong: "Du musst heute arbeitest.", right: "Du musst heute arbeiten.", why: "Only the modal is conjugated." },
      { wrong: "Wir heute können kommen.", right: "Wir können heute kommen.", why: "The conjugated modal must occupy position two." },
      { wrong: "Du musst nicht rauchen. (prohibition)", right: "Du darfst nicht rauchen.", why: "nicht müssen removes necessity; nicht dürfen expresses prohibition." },
    ],
    memoryTip: "Build a frame: conjugate the modal on the left, park the action infinitive on the right, and place the remaining information between them.",
    exercises: A1_LESSON_THIRTEEN_EXERCISES,
  },
  "a1-3-2": {
    id: "a1-3-2",
    lead: "Separable verbs package a basic action together with a meaningful prefix. In a simple main clause, German separates those parts and places them around the sentence; in an infinitive, the same verb stays together.",
    pattern: "anrufen → Ich rufe dich an. · modal + infinitive → Ich muss dich anrufen.",
    explanation: [
      "Many everyday German verbs consist of a prefix plus a verb: auf + stehen, ein + kaufen, an + rufen. The prefix often changes the meaning enough that the complete verb must be learned as one vocabulary item.",
      "When a separable verb is the conjugated verb in a statement, conjugate the stem and move the prefix to the end: Mia kauft heute ein. The stem forms the left bracket and the prefix the right bracket.",
      "In a yes/no question, the conjugated stem comes first and the prefix remains last: Rufst du mich an? In a W-question, the stem follows the question word: Wann rufst du mich an?",
      "After a modal verb, the separable verb is an infinitive and stays joined: Ich muss einkaufen. The modal is now conjugated, so it creates the sentence bracket with the complete infinitive.",
      "Common separable prefixes include ab-, an-, auf-, aus-, ein-, mit-, vor-, weg-, zu-, and zurück-. They are normally stressed in speech: ÁNrufen, ÁUFstehen, ÉINkaufen.",
      "Not every prefix separates. Frequent inseparable prefixes such as be-, er-, ver-, and zer- remain attached: Ich besuche meine Freundin. At A1, learn each new verb with a clear split example when it is separable.",
    ],
    tables: [
      {
        title: "High-frequency separable verbs",
        headers: ["Infinitive", "Split form", "English", "Example"],
        rows: [
          ["aufstehen", "steht … auf", "get up", "Er steht früh auf."],
          ["anrufen", "ruft … an", "call", "Sie ruft mich an."],
          ["einkaufen", "kauft … ein", "shop", "Wir kaufen heute ein."],
          ["ankommen", "kommt … an", "arrive", "Der Zug kommt an."],
          ["mitbringen", "bringt … mit", "bring along", "Bringst du Brot mit?"],
          ["abholen", "holt … ab", "pick up", "Ich hole Mia ab."],
          ["fernsehen", "sieht … fern", "watch TV", "Er sieht abends fern."],
          ["zumachen", "macht … zu", "close", "Mach die Tür zu."],
        ],
      },
      {
        title: "Word order across sentence types",
        headers: ["Type", "Conjugated part", "Middle", "Final part"],
        rows: [
          ["statement", "Ich rufe", "meine Mutter", "an."],
          ["time first", "Heute rufe", "ich meine Mutter", "an."],
          ["yes/no question", "Rufst", "du deine Mutter", "an?"],
          ["W-question", "Wann rufst", "du deine Mutter", "an?"],
          ["with modal", "Ich muss", "meine Mutter", "anrufen."],
        ],
      },
      {
        title: "Separable and inseparable prefixes",
        headers: ["Usually separable", "Example", "Usually inseparable", "Example"],
        rows: [
          ["an-", "anrufen", "be-", "besuchen"],
          ["auf-", "aufmachen", "er-", "erklären"],
          ["ein-", "einkaufen", "ver-", "verstehen"],
          ["mit-", "mitkommen", "zer-", "zerstören"],
        ],
      },
    ],
    sections: [
      {
        title: "Hear the sentence bracket",
        paragraphs: [
          "The separated prefix is not an optional particle. It completes the lexical verb, so listeners wait for it. Speaking the entire bracket as one rhythm—Ich RUFe dich morgen AN—helps prevent the prefix from being forgotten.",
          "Information such as objects, time, place, and negation normally comes before the closing prefix. The prefix is the final verbal element of a simple main clause.",
        ],
        examples: [
          { german: "Ich hole dich um acht am Bahnhof ab.", english: "I will pick you up at the station at eight." },
          { german: "Mia macht heute das Fenster nicht auf.", english: "Mia is not opening the window today." },
          { german: "Wann kommt der Bus in Berlin an?", english: "When does the bus arrive in Berlin?" },
        ],
      },
      {
        title: "Joined whenever it is an infinitive",
        paragraphs: [
          "The dictionary form is one word: aufstehen, anrufen, einkaufen. Keep it joined after a modal because the whole verb is an infinitive at the end.",
          "This contrast is a powerful diagnostic: if the separable verb is conjugated, split it; if another verb is conjugated and this verb is infinitive, keep it joined.",
        ],
        examples: [
          { german: "Ich stehe früh auf.", english: "I get up early." },
          { german: "Ich muss früh aufstehen.", english: "I have to get up early." },
          { german: "Wir wollen heute einkaufen.", english: "We want to shop today." },
        ],
      },
      {
        title: "Learn meaning with the complete verb",
        paragraphs: [
          "A familiar stem does not guarantee a predictable meaning. stehen means stand, aufstehen means get up, and verstehen means understand. Store each as a complete vocabulary entry.",
          "A useful flashcard contains the infinitive, a split sentence, and its stressed prefix. That gives vocabulary, grammar, and pronunciation in one retrieval cue.",
        ],
        examples: [
          { german: "aufstehen – Ich stehe um sieben auf.", english: "get up – I get up at seven." },
          { german: "anrufen – Rufst du mich morgen an?", english: "call – Are you calling me tomorrow?" },
          { german: "mitbringen – Ich muss meinen Pass mitbringen.", english: "bring along – I have to bring my passport." },
        ],
      },
    ],
    examples: [
      { german: "Heute kaufe ich im Zentrum ein.", english: "Today I am shopping in the city centre." },
      { german: "Der Zug kommt um neun an.", english: "The train arrives at nine." },
      { german: "Rufst du mich später an?", english: "Will you call me later?" },
      { german: "Wir müssen das Kind abholen.", english: "We have to pick up the child.", note: "After a modal, abholen stays joined." },
    ],
    mistakes: [
      { wrong: "Ich aufstehe um sieben.", right: "Ich stehe um sieben auf.", why: "A conjugated separable verb splits in a main clause." },
      { wrong: "Sie anruft ihre Mutter.", right: "Sie ruft ihre Mutter an.", why: "Conjugate the stem and send the prefix to the end." },
      { wrong: "Ich muss stehe früh auf.", right: "Ich muss früh aufstehen.", why: "After a modal, the complete infinitive stays joined." },
      { wrong: "Er steht auf früh.", right: "Er steht früh auf.", why: "The prefix closes the clause after the middle-field information." },
    ],
    memoryTip: "Ask which verb is conjugated. If it is the separable verb, split it; if it is a modal, keep the separable infinitive joined at the end.",
    exercises: A1_LESSON_FOURTEEN_EXERCISES,
  },
  "a1-3-3": {
    id: "a1-3-3",
    lead: "The imperative gives instructions, directions, advice, invitations, and urgent commands. German chooses a different form for one familiar person, several familiar people, and formal address, so the relationship with the listener is part of the grammar.",
    pattern: "du: Komm! · ihr: Kommt! · Sie: Kommen Sie!",
    explanation: [
      "Use the du imperative for one familiar person. Remove du and usually the -st ending: du kommst → Komm! Many verbs may add -e, and stems ending in -d or -t normally need it: Arbeite!",
      "Stem-changing verbs with e→i or e→ie keep that change: du sprichst → Sprich!, du liest → Lies!, du nimmst → Nimm! Verbs with a→ä normally lose the umlaut: du fährst → Fahr!",
      "Use the ihr imperative for several familiar people. It is the normal ihr form without the pronoun: ihr kommt → Kommt!, ihr wartet → Wartet!, ihr seid → Seid!",
      "Use the formal imperative for one or more people addressed as Sie. Place the infinitive first and Sie immediately after it: Kommen Sie!, Warten Sie!, Setzen Sie sich!",
      "sein is irregular in all three forms: Sei! for du, Seid! for ihr, and Seien Sie! for formal address.",
      "bitte makes instructions more courteous and can stand near the beginning, middle, or end. Intonation and context matter: a grammatically correct command can still sound abrupt without bitte, a greeting, or an explanation.",
    ],
    tables: [
      {
        title: "Three audiences, three command forms",
        headers: ["Audience", "Source form", "Imperative", "English"],
        rows: [
          ["du", "du kommst", "Komm bitte!", "Please come!"],
          ["ihr", "ihr kommt", "Kommt bitte!", "Please come!"],
          ["Sie", "Sie kommen", "Kommen Sie bitte!", "Please come!"],
        ],
      },
      {
        title: "Important du forms",
        headers: ["Infinitive", "du form", "Imperative", "Reason"],
        rows: [
          ["machen", "du machst", "Mach!", "regular stem"],
          ["arbeiten", "du arbeitest", "Arbeite!", "-e after -t"],
          ["sprechen", "du sprichst", "Sprich!", "e→i remains"],
          ["lesen", "du liest", "Lies!", "e→ie remains"],
          ["nehmen", "du nimmst", "Nimm!", "irregular stem"],
          ["fahren", "du fährst", "Fahr!", "a→ä does not remain"],
        ],
      },
      {
        title: "sein and reflexive commands",
        headers: ["Audience", "sein", "sich setzen", "sich beeilen"],
        rows: [
          ["du", "Sei ruhig!", "Setz dich!", "Beeil dich!"],
          ["ihr", "Seid ruhig!", "Setzt euch!", "Beeilt euch!"],
          ["Sie", "Seien Sie ruhig!", "Setzen Sie sich!", "Beeilen Sie sich!"],
        ],
      },
    ],
    sections: [
      {
        title: "Select the listener first",
        paragraphs: [
          "Before changing the verb, decide whether the listener is du, ihr, or Sie. That single social decision determines the entire command structure.",
          "If you would address the person by their first name as du, use Komm! If you are speaking to that person plus friends, use Kommt! In a polite professional exchange, use Kommen Sie!",
        ],
        examples: [
          { german: "Lena, komm bitte herein!", english: "Lena, please come in!" },
          { german: "Kinder, kommt bitte herein!", english: "Children, please come in!" },
          { german: "Frau Klein, kommen Sie bitte herein!", english: "Ms Klein, please come in!" },
        ],
      },
      {
        title: "Prefixes and pronouns keep their jobs",
        paragraphs: [
          "A separable prefix still goes to the end: Ruf mich an!, Macht das Fenster auf!, Steigen Sie hier aus! Reflexive pronouns change with the listener: dich, euch, or sich.",
          "Negative commands follow the same negation principles as statements. Use kein with nouns and nicht for the action or another element.",
        ],
        examples: [
          { german: "Ruf mich später an!", english: "Call me later!" },
          { german: "Setzt euch bitte!", english: "Please sit down!" },
          { german: "Vergessen Sie Ihren Pass nicht!", english: "Do not forget your passport!" },
        ],
      },
      {
        title: "Clear does not have to mean rude",
        paragraphs: [
          "Instructions on signs, recipes, and forms are naturally direct. In conversation, add bitte, mal, doch, a greeting, or a reason when appropriate. At A1, bitte is the safest tool.",
          "Punctuation marks the intended tone in writing. An exclamation mark is common in teaching examples, but a period can make formal written instructions feel neutral rather than urgent.",
        ],
        examples: [
          { german: "Warten Sie bitte einen Moment.", english: "Please wait a moment." },
          { german: "Komm bitte kurz mit.", english: "Please come along for a moment." },
          { german: "Nehmen Sie zweimal täglich eine Tablette.", english: "Take one tablet twice daily." },
        ],
      },
    ],
    examples: [
      { german: "Mach bitte die Tür zu!", english: "Please close the door!" },
      { german: "Lest den Text und beantwortet die Fragen!", english: "Read the text and answer the questions!" },
      { german: "Unterschreiben Sie bitte hier.", english: "Please sign here." },
      { german: "Sei vorsichtig!", english: "Be careful!" },
    ],
    mistakes: [
      { wrong: "Du komm bitte rein!", right: "Komm bitte rein!", why: "The subject du is normally omitted." },
      { wrong: "Ihr wartet hier!", right: "Wartet hier!", why: "Omit ihr but keep the -t ending." },
      { wrong: "Sitzen bitte Sie hier!", right: "Sitzen Sie bitte hier!", why: "Formal commands use infinitive + Sie." },
      { wrong: "Les den Text!", right: "Lies den Text!", why: "lesen keeps its e→ie stem change in the du imperative." },
    ],
    memoryTip: "Name the listener silently—du, ihr, or Sie—then build the matching command. Add bitte whenever the situation calls for cooperation rather than urgency.",
    exercises: A1_LESSON_FIFTEEN_EXERCISES,
  },
  "a1-3-4": {
    id: "a1-3-4",
    lead: "German separates general likes, enjoyment of activities, and polite present wishes. mögen usually takes a noun, gern modifies an activity, and möchten asks for or proposes something politely.",
    pattern: "Ich mag Kaffee. · Ich trinke gern Kaffee. · Ich möchte jetzt einen Kaffee.",
    explanation: [
      "Use mögen for a general preference toward a person or thing: Ich mag Tee. The irregular singular forms are ich mag, du magst, and er/sie/es mag; the plural forms use mögen or mögt.",
      "Use gern or gerne with an activity verb: Ich koche gern. German literally presents the action as something done gladly. gern is not a verb, so the activity verb still carries the person ending.",
      "Use möchten for a polite wish in the current situation: Ich möchte einen Tee. It can take a noun object or a second verb: Ich möchte zahlen. The infinitive goes to the end.",
      "möchten conjugates as ich möchte, du möchtest, er/sie/es möchte, wir möchten, ihr möchtet, sie/Sie möchten. The umlaut belongs to every form.",
      "Ask Magst du Kaffee? about a general preference. Ask Möchtest du einen Kaffee? when offering coffee now. English like and would like hide this important German distinction.",
      "wollen is stronger and more direct than möchten. It is useful for firm intentions, but möchten is normally more appropriate in cafés, shops, hotels, requests, and polite social exchanges.",
    ],
    tables: [
      {
        title: "Three ways to talk about preference",
        headers: ["Purpose", "Structure", "German", "English"],
        rows: [
          ["general noun preference", "mögen + noun", "Ich mag Kaffee.", "I like coffee."],
          ["activity preference", "verb + gern", "Ich trinke gern Kaffee.", "I like drinking coffee."],
          ["present polite wish", "möchten + noun/verb", "Ich möchte einen Kaffee.", "I would like a coffee."],
        ],
      },
      {
        title: "Present forms",
        headers: ["Subject", "mögen", "möchten", "Example"],
        rows: [
          ["ich", "mag", "möchte", "Ich möchte zahlen."],
          ["du", "magst", "möchtest", "Magst du Tee?"],
          ["er / sie / es", "mag", "möchte", "Sie möchte bestellen."],
          ["wir", "mögen", "möchten", "Wir möchten gehen."],
          ["ihr", "mögt", "möchtet", "Möchtet ihr essen?"],
          ["sie / Sie", "mögen", "möchten", "Was möchten Sie?"],
        ],
      },
      {
        title: "Question contrast",
        headers: ["Question", "Time focus", "Natural answer", "Meaning"],
        rows: [
          ["Magst du Tee?", "general", "Ja, sehr.", "Do you like tea?"],
          ["Trinkst du gern Tee?", "general activity", "Ja, jeden Morgen.", "Do you like drinking tea?"],
          ["Möchtest du einen Tee?", "now / specific", "Ja, gern.", "Would you like a tea?"],
        ],
      },
    ],
    sections: [
      {
        title: "Match the grammar to the object of liking",
        paragraphs: [
          "If the preference points to a noun, mögen is usually the direct A1 choice. If it points to doing something, conjugate that activity and add gern.",
          "This distinction prevents constructions copied from English such as Ich mag kochen. That form can occur in broader German, but Ich koche gern is the clearer and more productive A1 pattern.",
        ],
        examples: [
          { german: "Ich mag Bücher.", english: "I like books." },
          { german: "Ich lese gern.", english: "I like reading." },
          { german: "Sie mag Sport, aber sie läuft nicht gern.", english: "She likes sport, but she does not like running." },
        ],
      },
      {
        title: "Polite wishes create a sentence bracket",
        paragraphs: [
          "With a noun, möchten behaves as the only verb: Ich möchte eine Suppe. With another action, möchte is conjugated and the action infinitive closes the clause: Ich möchte eine Suppe bestellen.",
          "In questions, move the conjugated form according to the normal rule: Möchtest du mitkommen? Was möchten Sie trinken?",
        ],
        examples: [
          { german: "Ich möchte bitte zahlen.", english: "I would like to pay, please." },
          { german: "Möchtet ihr noch etwas essen?", english: "Would you like something else to eat?" },
          { german: "Was möchten Sie bestellen?", english: "What would you like to order?" },
        ],
      },
      {
        title: "Negation and stronger preferences",
        paragraphs: [
          "Negate noun preferences with kein when there is no definite article: Ich mag keinen Fisch. Negate activities with nicht gern: Ich schwimme nicht gern.",
          "gern can be compared: gern, lieber, am liebsten. These forms let you rank activities without adjective endings: Ich trinke gern Tee, lieber Kaffee und am liebsten Wasser.",
        ],
        examples: [
          { german: "Er mag keine laute Musik.", english: "He does not like loud music." },
          { german: "Ich fahre nicht gern nachts.", english: "I do not like driving at night." },
          { german: "Am liebsten koche ich zu Hause.", english: "I like cooking at home best." },
        ],
      },
    ],
    examples: [
      { german: "Magst du italienisches Essen?", english: "Do you like Italian food?" },
      { german: "Meine Eltern reisen gern.", english: "My parents like travelling." },
      { german: "Ich möchte einen Termin vereinbaren.", english: "I would like to arrange an appointment." },
      { german: "Möchten Sie noch etwas?", english: "Would you like anything else?" },
    ],
    mistakes: [
      { wrong: "Ich möge Kaffee.", right: "Ich mag Kaffee.", why: "The present ich form of mögen is mag." },
      { wrong: "Ich mag schwimmen gern.", right: "Ich schwimme gern.", why: "Use the activity verb with gern." },
      { wrong: "Ich möchte bestelle eine Suppe.", right: "Ich möchte eine Suppe bestellen.", why: "The action after möchten stays an infinitive at the end." },
      { wrong: "Was mögen Sie? (restaurant order)", right: "Was möchten Sie?", why: "A current polite wish uses möchten." },
    ],
    memoryTip: "Thing in general: mögen. Activity in general: verb + gern. Polite wish now: möchten. Practise all three with the same topic.",
    exercises: A1_LESSON_SIXTEEN_EXERCISES,
  },
  "a1-3-5": {
    id: "a1-3-5",
    lead: "es gibt and haben both describe what is present, but they organize information differently. es gibt introduces something that exists or is available; haben connects a person, place, or thing to what it possesses or contains.",
    pattern: "Es gibt hier einen Park. · Die Stadt hat einen Park.",
    explanation: [
      "Use es gibt to say that something exists or is available: In der Straße gibt es eine Apotheke. The phrase is fixed in the present tense, and the noun phrase after it is accusative.",
      "The accusative is visible most clearly with masculine nouns: ein Park becomes einen Park; kein Bahnhof becomes keinen Bahnhof. Feminine, neuter, and plural article forms look familiar.",
      "When another element comes first, gibt stays in position two and es follows it: In der Stadt gibt es viele Cafés. In a yes/no question, use Gibt es …?",
      "Use haben when the grammatical subject is the owner, container, or bearer of a feature: Das Hotel hat einen Aufzug. Conjugate haben for that subject: ich habe, du hast, er/sie/es hat, wir haben, ihr habt, sie/Sie haben.",
      "Negate an absent noun with kein rather than nicht: Es gibt keinen Bus. Das Zimmer hat keinen Balkon. Choose the ending from the noun's gender and accusative case.",
      "Sometimes both structures describe the same situation from different viewpoints: Im Hotel gibt es ein Restaurant introduces the restaurant; Das Hotel hat ein Restaurant presents it as a hotel feature.",
    ],
    tables: [
      {
        title: "Choose the viewpoint",
        headers: ["Purpose", "Structure", "German", "English"],
        rows: [
          ["introduce existence", "es gibt + accusative", "Hier gibt es einen Markt.", "There is a market here."],
          ["ask availability", "Gibt es + accusative?", "Gibt es noch Tickets?", "Are tickets still available?"],
          ["describe possession/feature", "subject + haben", "Das Haus hat einen Garten.", "The house has a garden."],
        ],
      },
      {
        title: "Accusative forms after es gibt and haben",
        headers: ["Gender / number", "Positive", "Negative", "Example"],
        rows: [
          ["masculine", "einen", "keinen", "einen / keinen Park"],
          ["feminine", "eine", "keine", "eine / keine Bank"],
          ["neuter", "ein", "kein", "ein / kein Kino"],
          ["plural", "—", "keine", "Cafés / keine Cafés"],
        ],
      },
      {
        title: "Present tense of haben",
        headers: ["Subject", "Form", "German example", "English"],
        rows: [
          ["ich", "habe", "Ich habe Zeit.", "I have time."],
          ["du", "hast", "Hast du ein Auto?", "Do you have a car?"],
          ["er / sie / es", "hat", "Das Zimmer hat WLAN.", "The room has Wi-Fi."],
          ["wir", "haben", "Wir haben zwei Kinder.", "We have two children."],
          ["ihr", "habt", "Habt ihr Hunger?", "Are you hungry?"],
          ["sie / Sie", "haben", "Haben Sie Zeit?", "Do you have time?"],
        ],
      },
    ],
    sections: [
      {
        title: "Existence has no personal owner",
        paragraphs: [
          "The es in es gibt is a grammatical placeholder, not a person or object that owns something. Do not translate English there is word by word as es ist or es hat.",
          "Because gibt is the finite verb, normal position-two rules still apply. A place or time can occupy position one without changing the expression's core structure.",
        ],
        examples: [
          { german: "Es gibt heute ein Problem.", english: "There is a problem today." },
          { german: "Heute gibt es ein Problem.", english: "Today there is a problem." },
          { german: "Gibt es ein Problem?", english: "Is there a problem?" },
        ],
      },
      {
        title: "Possession includes features and conditions",
        paragraphs: [
          "haben is broader than legal ownership. Rooms have windows, towns have parks, cars have problems, and people have time, hunger, or appointments.",
          "The subject controls the haben form, while the thing possessed is normally an accusative object. Keep those roles separate when choosing both verb and article.",
        ],
        examples: [
          { german: "Die Wohnung hat drei Zimmer.", english: "The apartment has three rooms." },
          { german: "Das Auto hat ein Problem.", english: "The car has a problem." },
          { german: "Wir haben heute keine Zeit.", english: "We have no time today." },
        ],
      },
      {
        title: "Build useful availability questions",
        paragraphs: [
          "Gibt es …? is essential in travel and daily services: Gibt es WLAN?, Gibt es einen Aufzug?, Gibt es noch Karten? Use Haben Sie …? when asking a person or business what they have available.",
          "Answers can be short but should preserve the correct noun form: Ja, es gibt einen. Nein, leider nicht. Ja, wir haben noch ein Zimmer.",
        ],
        examples: [
          { german: "Gibt es hier eine Apotheke?", english: "Is there a pharmacy here?" },
          { german: "Hat das Zimmer einen Balkon?", english: "Does the room have a balcony?" },
          { german: "Haben Sie noch Tickets?", english: "Do you still have tickets?" },
        ],
      },
    ],
    examples: [
      { german: "In meinem Viertel gibt es einen Supermarkt.", english: "There is a supermarket in my neighbourhood." },
      { german: "Gibt es im Hotel WLAN?", english: "Is there Wi-Fi in the hotel?" },
      { german: "Unsere Wohnung hat keinen Balkon.", english: "Our apartment does not have a balcony." },
      { german: "Wir haben morgen einen Termin.", english: "We have an appointment tomorrow." },
    ],
    mistakes: [
      { wrong: "Es hat hier einen Bahnhof.", right: "Es gibt hier einen Bahnhof.", why: "Existence is expressed with es gibt." },
      { wrong: "Es gibt ein Park.", right: "Es gibt einen Park.", why: "The phrase after es gibt is accusative; Park is masculine." },
      { wrong: "Meine Stadt haben viele Cafés.", right: "Meine Stadt hat viele Cafés.", why: "The singular subject Stadt takes hat." },
      { wrong: "Das Zimmer hat nicht Balkon.", right: "Das Zimmer hat keinen Balkon.", why: "An absent noun is negated with kein." },
    ],
    memoryTip: "Use es gibt to introduce what exists; use haben to name who or what has it. In both patterns, check the following noun as an accusative object.",
    exercises: A1_LESSON_SEVENTEEN_EXERCISES,
  },
  "a1-3-6": {
    id: "a1-3-6",
    lead: "A reflexive verb sends its action back to the subject: the person washing is also the person being washed. German marks that relationship with a reflexive pronoun that changes to match the subject.",
    pattern: "ich → mich · du → dich · er/sie/es → sich · wir → uns · ihr → euch · sie/Sie → sich",
    explanation: [
      "Use a reflexive pronoun when the subject and object refer to the same person or people: Ich wasche mich. The verb agrees with the subject; the reflexive pronoun identifies who receives the action.",
      "The A1 accusative reflexive forms are mich, dich, sich, uns, euch, and sich. Third-person singular, third-person plural, and formal Sie all use sich.",
      "With a pronoun subject in a neutral statement, the order is subject + verb + reflexive pronoun: Ich beeile mich. In a question: Beeilst du dich? After a time phrase: Heute beeile ich mich.",
      "With a noun subject after the verb, the short reflexive pronoun normally comes first: Heute freut sich Mia. This keeps short pronouns near the conjugated verb.",
      "Separable reflexive verbs create a bracket: Ich ziehe mich an. After a modal, the pronoun follows the modal and the full infinitive stays at the end: Ich muss mich anziehen.",
      "Some verbs can be reflexive or non-reflexive depending on meaning: Ich wasche mich versus Ich wasche das Auto. Others are normally learned with sich, such as sich beeilen, sich freuen, and sich interessieren.",
    ],
    tables: [
      {
        title: "Accusative reflexive pronouns",
        headers: ["Subject", "Reflexive", "German example", "English"],
        rows: [
          ["ich", "mich", "Ich wasche mich.", "I wash myself."],
          ["du", "dich", "Du beeilst dich.", "You hurry."],
          ["er / sie / es", "sich", "Mia setzt sich.", "Mia sits down."],
          ["wir", "uns", "Wir treffen uns.", "We meet."],
          ["ihr", "euch", "Ihr freut euch.", "You are pleased."],
          ["sie / Sie", "sich", "Setzen Sie sich.", "Sit down."],
        ],
      },
      {
        title: "Common A1 reflexive verbs",
        headers: ["Verb", "Meaning", "Example", "English"],
        rows: [
          ["sich waschen", "wash oneself", "Ich wasche mich.", "I wash."],
          ["sich anziehen", "get dressed", "Er zieht sich an.", "He gets dressed."],
          ["sich setzen", "sit down", "Setzt euch!", "Sit down!"],
          ["sich beeilen", "hurry", "Wir beeilen uns.", "We hurry."],
          ["sich freuen auf", "look forward to", "Ich freue mich auf Freitag.", "I look forward to Friday."],
          ["sich treffen", "meet each other", "Sie treffen sich um acht.", "They meet at eight."],
        ],
      },
      {
        title: "Word-order patterns",
        headers: ["Pattern", "German", "Pronoun position", "English"],
        rows: [
          ["neutral", "Mia freut sich.", "after verb", "Mia is pleased."],
          ["time first + pronoun subject", "Heute freut sie sich.", "after subject pronoun", "Today she is pleased."],
          ["time first + noun subject", "Heute freut sich Mia.", "before noun subject", "Today Mia is pleased."],
          ["modal", "Mia muss sich beeilen.", "after modal/middle subject", "Mia has to hurry."],
          ["separable", "Mia zieht sich an.", "before final prefix", "Mia gets dressed."],
        ],
      },
    ],
    sections: [
      {
        title: "Make the subject–pronoun pair automatic",
        paragraphs: [
          "Do not select a reflexive pronoun from the English translation alone. Point back to the German subject: ich requires mich, du requires dich, wir requires uns, and ihr requires euch.",
          "Practise the chain aloud with one stable verb: Ich wasche mich, du wäschst dich, er wäscht sich, wir waschen uns, ihr wascht euch, sie waschen sich.",
        ],
        examples: [
          { german: "Ich beeile mich.", english: "I hurry." },
          { german: "Du beeilst dich.", english: "You hurry." },
          { german: "Wir beeilen uns.", english: "We hurry." },
          { german: "Beeilt ihr euch?", english: "Are you hurrying?" },
        ],
      },
      {
        title: "Reflexive or ordinary object?",
        paragraphs: [
          "Ask whether the object is the same person as the subject. If yes, use a matching reflexive pronoun. If the action affects another person or thing, use the ordinary noun or pronoun instead.",
          "With plural subjects, a reflexive form can also express each other: Wir treffen uns means we meet each other. The same form can therefore be reflexive or reciprocal depending on the verb and situation.",
        ],
        examples: [
          { german: "Ich wasche mich.", english: "I wash myself." },
          { german: "Ich wasche das Auto.", english: "I wash the car." },
          { german: "Wir treffen uns vor dem Kino.", english: "We meet each other in front of the cinema." },
        ],
      },
      {
        title: "Combine reflexives with familiar structures",
        paragraphs: [
          "Reflexive pronouns interact with questions, time-first word order, separable verbs, modals, and imperatives. The earlier rules remain active; the pronoun simply occupies its short-object position.",
          "For the imperative, match both forms to the listener: Setz dich!, Setzt euch!, Setzen Sie sich! This is an efficient review of audience and reflexive agreement together.",
        ],
        examples: [
          { german: "Wann ziehst du dich an?", english: "When are you getting dressed?" },
          { german: "Heute muss ich mich beeilen.", english: "Today I have to hurry." },
          { german: "Setzen Sie sich bitte!", english: "Please sit down!" },
        ],
      },
    ],
    examples: [
      { german: "Ich wasche mich jeden Morgen.", english: "I wash every morning." },
      { german: "Mia zieht sich schnell an.", english: "Mia gets dressed quickly." },
      { german: "Wir freuen uns auf das Wochenende.", english: "We are looking forward to the weekend." },
      { german: "Musst du dich beeilen?", english: "Do you have to hurry?" },
    ],
    mistakes: [
      { wrong: "Ich wasche dich. (myself)", right: "Ich wasche mich.", why: "The pronoun must refer back to ich." },
      { wrong: "Du ziehst mich an. (yourself)", right: "Du ziehst dich an.", why: "The subject du requires dich." },
      { wrong: "Wir uns beeilen heute.", right: "Wir beeilen uns heute.", why: "The conjugated verb remains in position two." },
      { wrong: "Setzen Sie Sie bitte.", right: "Setzen Sie sich bitte.", why: "Formal Sie uses the reflexive pronoun sich." },
    ],
    memoryTip: "Draw an arrow from the action back to its subject. Then say the fixed pair aloud: ich–mich, du–dich, er/sie/es–sich, wir–uns, ihr–euch, sie/Sie–sich.",
    exercises: A1_LESSON_EIGHTEEN_EXERCISES,
  },
};
