"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  FileText,
  Gauge,
  Headphones,
  ImagePlus,
  Languages,
  LoaderCircle,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  UploadCloud,
  Volume2,
  WandSparkles,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TopicKey = "housing" | "travel" | "daily";
type AppStatus = "idle" | "scanning" | "writing" | "ready" | "error";

type StoryProfile = {
  topic: string;
  eyebrow: string;
  title: string;
  readingTime: string;
  paragraphs: string[];
  vocabulary: Array<[string, string]>;
  writingPrompt: string;
};

type TesseractLogger = { progress?: number; status?: string };

declare global {
  interface Window {
    Tesseract?: {
      recognize: (
        image: File,
        languages: string,
        options: { logger: (message: TesseractLogger) => void },
      ) => Promise<{ data: { text: string } }>;
    };
  }
}

const LESSON_EXAMPLE = `Kapitel 7: Eine neue Wohnung
Wortschatz: die Wohnung, das Zimmer, der Umzug, der Nachbar, die Miete,
ruhig, hell, besichtigen, einziehen, sich freuen
Grammatik: Perfekt mit haben und sein; Nebensätze mit weil und dass; Modalverben`;

const STORIES: Record<TopicKey, StoryProfile> = {
  housing: {
    topic: "Wohnen & Nachbarschaft",
    eyebrow: "Eine kleine Stadtgeschichte",
    title: "Das Licht im dritten Stock",
    readingTime: "4 min",
    paragraphs: [
      "Mara wohnt seit zwei Monaten in Leipzig. Ihre kleine Wohnung liegt im dritten Stock eines alten Hauses. Das Wohnzimmer ist hell, aber die Küche ist sehr schmal. Trotzdem fühlt Mara sich dort wohl, weil am Nachmittag warmes Licht durch die großen Fenster kommt.",
      "Am Samstag klingelt es früh an der Tür. Vor Mara steht Herr Neumann, ihr neuer Nachbar. Er trägt eine schwere Kiste und sieht müde aus. „Entschuldigung“, sagt er, „können Sie mir vielleicht helfen? Ich bin gestern eingezogen, aber mein Bruder ist noch nicht da.“",
      "Mara stellt ihre Tasse ab und hilft ihm. Zusammen tragen sie die Kiste in seine Wohnung. Im Flur stehen noch viele Kartons. Herr Neumann hat schon das Bett aufgebaut, aber er hat die Lampe nicht gefunden. Deshalb ist sein Zimmer dunkel.",
      "Während sie suchen, erzählt er von seinem Umzug. Seine alte Miete war zu hoch, und die Straße war nachts sehr laut. Er wollte eine ruhigere Wohnung finden. Als er dieses Haus besichtigt hat, hat ihm sofort der grüne Innenhof gefallen.",
      "Unter einem Stapel Zeitungen entdeckt Mara endlich die Lampe. Herr Neumann freut sich, dass sie funktioniert. Dann finden sie auch eine kleine rote Dose. Darin liegt ein Schlüssel, den der Vormieter vergessen hat. Sie wissen nicht, zu welcher Tür er gehört.",
      "Die beiden gehen in den Hof und probieren den Schlüssel an einer alten Holztür. Die Tür öffnet sich langsam. Dahinter ist ein winziger Garten mit einem Tisch und zwei Stühlen. Niemand im Haus hat Mara bisher davon erzählt.",
      "Am Abend sitzen Mara und Herr Neumann draußen. Sie trinken Tee und planen ein Frühstück für alle Nachbarn. Herr Neumann möchte Brot kaufen, und Mara kann einen Kuchen backen. Sie schreiben eine kurze Einladung und hängen sie neben die Haustür.",
      "Mara denkt, dass ein Zuhause nicht nur aus Zimmern und Möbeln besteht. Man braucht auch Menschen, die freundlich sind und einander helfen. Seit diesem Samstag fühlt sich ihre Wohnung ein bisschen größer an — und das ganze Haus ein bisschen heller.",
    ],
    vocabulary: [
      ["die Wohnung", "apartment"],
      ["der Nachbar", "neighbor"],
      ["der Umzug", "move / relocation"],
      ["die Miete", "rent"],
      ["besichtigen", "to view / inspect"],
      ["einziehen", "to move in"],
      ["sich wohlfühlen", "to feel comfortable"],
      ["der Innenhof", "courtyard"],
    ],
    writingPrompt:
      "Du findest hinter einer Tür in deinem Haus einen geheimen Raum. Was ist darin, und wen lädst du ein? Schreibe 5–7 Sätze im Perfekt.",
  },
  travel: {
    topic: "Reisen & Verkehr",
    eyebrow: "Eine Reise mit Umweg",
    title: "Der Zug nach Hamburg",
    readingTime: "4 min",
    paragraphs: [
      "Noah hat lange auf diese Reise gewartet. Am Freitag fährt er mit dem Zug von Köln nach Hamburg. Er möchte dort seine Freundin Elif besuchen. Sein Koffer ist leicht, weil er nur zwei Tage bleiben will. Im Rucksack hat er ein Buch, eine Wasserflasche und seine Fahrkarte.",
      "Am Bahnhof zeigt die große Anzeige plötzlich eine Verspätung von vierzig Minuten. Viele Reisende warten unruhig am Bahnsteig. Noah kauft einen Kaffee und hört eine Durchsage. Der Zug fährt heute nicht direkt, sondern endet schon in Bremen.",
      "Im Abteil sitzt Noah neben einer älteren Frau. Sie heißt Frau Berg und muss ebenfalls nach Hamburg. Weil ihr Handy keinen Strom mehr hat, kann sie ihre Tochter nicht anrufen. Noah leiht ihr sein Ladegerät und erklärt ihr den neuen Fahrplan.",
      "In Bremen müssen alle aussteigen. Der Anschlusszug steht auf einem anderen Gleis, aber der Weg dorthin ist nicht gut erklärt. Noah und Frau Berg folgen zuerst dem falschen Schild. Dann fragen sie einen Mitarbeiter, der ihnen freundlich hilft.",
      "Sie erreichen den Zug in letzter Minute. Ihre Plätze sind schon besetzt, deshalb müssen sie noch einmal mit dem Schaffner sprechen. Zum Glück findet er zwei freie Sitze am Fenster. Frau Berg erzählt, dass sie früher oft allein durch Europa gereist ist.",
      "Draußen werden die Felder langsam dunkel. Noah hat seine Ankunftszeit geändert und Elif eine Nachricht geschickt. Sie antwortet, dass sie trotzdem am Hauptbahnhof auf ihn wartet. Jetzt kann er sich entspannen und die Landschaft ansehen.",
      "Als der Zug endlich in Hamburg ankommt, regnet es stark. Elif steht unter einem gelben Regenschirm und winkt. Auch Frau Bergs Tochter wartet am Ausgang. Alle lachen, obwohl die Reise viel länger gedauert hat als geplant.",
      "Noah hat gelernt, dass eine Verspätung nicht den ganzen Tag ruinieren muss. Manchmal beginnt ein gutes Abenteuer genau dann, wenn der ursprüngliche Plan nicht funktioniert. Am nächsten Morgen erzählt er beim Frühstück von Frau Berg und dem falschen Gleis.",
    ],
    vocabulary: [
      ["die Fahrkarte", "ticket"],
      ["die Verspätung", "delay"],
      ["der Bahnsteig", "platform"],
      ["die Durchsage", "announcement"],
      ["umsteigen", "to change trains"],
      ["das Gleis", "track / platform"],
      ["der Fahrplan", "timetable"],
      ["die Ankunft", "arrival"],
    ],
    writingPrompt:
      "Dein Zug fährt in die falsche Stadt. Was ist passiert, und wie endet die Reise? Schreibe 5–7 Sätze mit weil, deshalb und trotzdem.",
  },
  daily: {
    topic: "Alltag & Pläne",
    eyebrow: "Ein Tag voller kleiner Pläne",
    title: "Der Samstag ohne Handy",
    readingTime: "4 min",
    paragraphs: [
      "Lina arbeitet die ganze Woche in einem kleinen Büro. Deshalb plant sie für Samstag einen ruhigen Tag. Sie möchte lange schlafen, einkaufen und später ihre Freundin Samira treffen. Doch am Morgen merkt sie, dass ihr Handy nicht mehr funktioniert.",
      "Zuerst ist Lina nervös, weil alle Termine und Adressen im Handy gespeichert sind. Sie kann Samira keine Nachricht schicken. Dann erinnert sie sich an den Zettel am Kühlschrank. Dort hat sie die Adresse des neuen Cafés aufgeschrieben.",
      "Lina zieht ihre Jacke an und geht zum Markt. Normalerweise hört sie unterwegs Musik, aber heute hört sie die Stimmen der Verkäufer und das Lachen der Kinder. Sie kauft frisches Gemüse, Käse und ein Brot, das noch warm ist.",
      "Vor einem Blumenstand trifft sie zufällig ihren Kollegen Ben. Er hat seinen kleinen Hund dabei und muss ein Geschenk für seine Mutter finden. Lina hilft ihm, einen bunten Strauß auszuwählen. Ben lädt sie dafür zu einem Kaffee ein.",
      "Im Café sieht Lina die Uhr und erschrickt. Sie muss sich beeilen, denn Samira wartet bestimmt schon. Obwohl sie den schnellsten Weg nimmt, kommt sie zehn Minuten zu spät. Samira sitzt am Fenster und liest ein Buch.",
      "Samira ist nicht böse. Sie sagt, dass sie die ruhige Zeit genossen hat. Die beiden bestellen Kuchen und erzählen sich von ihrer Woche. Lina merkt, dass das Gespräch angenehmer ist, wenn kein Handy auf dem Tisch liegt.",
      "Später gehen sie am Fluss spazieren. Sie machen keine Fotos, aber sie achten auf die Wolken, die Boote und die Musik eines Straßenkünstlers. Lina kann den Moment besser genießen, weil sie nicht ständig auf einen Bildschirm schaut.",
      "Am Abend funktioniert das Handy plötzlich wieder. Lina liest ihre Nachrichten, legt es aber bald zur Seite. Sie hat heute weniger geplant und trotzdem mehr erlebt. Für den nächsten Samstag nimmt sie sich vor, das Handy freiwillig zu Hause zu lassen.",
    ],
    vocabulary: [
      ["der Termin", "appointment"],
      ["sich erinnern", "to remember"],
      ["unterwegs", "on the way"],
      ["zufällig", "by chance"],
      ["sich beeilen", "to hurry"],
      ["genießen", "to enjoy"],
      ["der Bildschirm", "screen"],
      ["sich vornehmen", "to intend / plan"],
    ],
    writingPrompt:
      "Du verbringst einen Tag ohne Handy. Was machst du anders, und wie fühlst du dich? Schreibe 5–7 Sätze mit obwohl, weil und trotzdem.",
  },
};

const GLOSSARY: Record<string, string> = {
  ab: "away / off", aber: "but", abend: "evening", adressen: "addresses",
  adresse: "address", abteil: "train compartment", achten: "to pay attention",
  alle: "all / everyone", allein: "alone", als: "when / as", alte: "old",
  alten: "old", älteren: "older", am: "on the / at the", an: "at / on",
  angenehmer: "more pleasant", ankommt: "arrives", ankunftszeit: "arrival time",
  anrufen: "to call", antwortet: "answers", anzeige: "display board",
  arbeitet: "works", auch: "also", auf: "on / onto", aufgebaut: "assembled",
  aufgeschrieben: "written down", aus: "from / out of", ausgang: "exit",
  auszuwählen: "to choose", aussteigen: "to get off", bahnhof: "station",
  bahnsteig: "platform", backen: "to bake", beginnt: "begins", ben: "Ben",
  berg: "Berg", besetzt: "occupied", besichtigt: "viewed / inspected",
  besser: "better", besteht: "consists", bestimmt: "surely / certainly",
  bett: "bed", bleiben: "to stay", bildschirm: "screen", bin: "am",
  bis: "until / up to", bisher: "until now", bisschen: "a little",
  blumenstand: "flower stall", boote: "boats", böse: "angry", bremen: "Bremen",
  brot: "bread", bruder: "brother", buch: "book", bunten: "colorful",
  café: "café", da: "there", dabei: "with him / along", davon: "about it / from it",
  dahinter: "behind it", dann: "then", darin: "in it", das: "the / that",
  dass: "that", den: "the", der: "the", deshalb: "therefore", die: "the",
  direkt: "directly", doch: "but / however", dort: "there", dose: "tin / container",
  draußen: "outside", durch: "through", durchsage: "announcement", dunkel: "dark",
  ein: "a / one", eine: "a / one", einem: "a / one", einen: "a / one",
  einer: "a / one", eines: "of a / one", einander: "one another",
  einkaufen: "to shop", einladung: "invitation", eingezogen: "moved in",
  elif: "Elif", endet: "ends", endlich: "finally", entdeckt: "discovers",
  entschuldigung: "excuse me / sorry", entspannen: "to relax", erklärt: "explains",
  erschrickt: "is startled", erzählt: "tells", erreichen: "to reach", er: "he",
  erlebt: "experienced", es: "it", ebenfalls: "also / likewise", europa: "Europe",
  fahrkarte: "ticket", fahrplan: "timetable", falschen: "wrong", fährt: "travels / goes",
  felder: "fields", fenster: "window", findet: "finds", finden: "to find",
  flur: "hallway", fluss: "river", folgen: "to follow", fotos: "photos",
  frau: "Ms. / woman", freie: "free / available", freitag: "Friday",
  freiwillig: "voluntarily", freundlich: "friendly / kindly", freundin: "female friend",
  freut: "is happy", früh: "early", früher: "earlier", frühstück: "breakfast",
  für: "for", funktioniert: "works / functions", gefallen: "appealed to",
  gefunden: "found", gegen: "against / around", geändert: "changed", geht: "goes",
  geheimen: "secret", gelernt: "learned", gelben: "yellow", genießen: "to enjoy",
  genossen: "enjoyed", genau: "exactly", gehört: "belongs", gereist: "traveled",
  gespeichert: "saved", geschenk: "gift", geschickt: "sent", gespräch: "conversation",
  gestern: "yesterday", gleis: "track / platform", glück: "luck", große: "large",
  großen: "large", größer: "larger", grüne: "green", gut: "good", gute: "good",
  ganzen: "whole", garten: "garden", gedauert: "lasted", gemüse: "vegetables",
  gemacht: "made", gewartet: "waited", gewählt: "chosen", hamburg: "Hamburg",
  handy: "mobile phone", hat: "has", hauptbahnhof: "main station", haus: "house",
  hauses: "house", haustür: "front door", heißt: "is called", helfen: "to help",
  hell: "bright", heller: "brighter", herr: "Mr.", heute: "today", hinter: "behind",
  hoch: "high", hof: "courtyard", holztür: "wooden door", hört: "hears / listens",
  hund: "dog", ich: "I", ihr: "her / you", ihre: "her / their", ihrer: "her / their",
  ihm: "him", im: "in the", in: "in / into", innenhof: "courtyard", ist: "is",
  jacke: "jacket", jetzt: "now", kaffee: "coffee", kann: "can",
  kartons: "cardboard boxes", käse: "cheese", kaufen: "to buy", kauft: "buys",
  kein: "no / not a", keinen: "no / not any", kinder: "children", kiste: "box / crate",
  kleine: "small", kleinen: "small", klingelt: "rings", koffer: "suitcase", köln: "Cologne",
  kollegen: "colleague", kommt: "comes", können: "can / are able to", küche: "kitchen",
  kuchen: "cake", kühlschrank: "refrigerator", kurz: "short", kurze: "short",
  ladegerät: "charger", lädt: "invites", lampe: "lamp", landschaft: "landscape",
  lange: "long", länger: "longer", langsam: "slowly", laut: "loud", lachen: "to laugh",
  leicht: "light / easy", leiht: "lends", leipzig: "Leipzig", lesen: "to read",
  liest: "reads", liegt: "lies / is located", licht: "light", lina: "Lina",
  macht: "does / makes", machen: "to do / make", man: "one / you", manchmal: "sometimes",
  mara: "Mara", markt: "market", mehr: "more", menschen: "people", merkt: "notices",
  mein: "my", meinem: "my", mir: "me", mit: "with", mitarbeiter: "employee",
  möbeln: "furniture", möchte: "would like", moment: "moment", monaten: "months",
  morgen: "morning / tomorrow", muss: "must / has to", müssen: "must / have to",
  müde: "tired", musik: "music", mutter: "mother", nach: "to / after",
  nachbarn: "neighbors", nachbar: "neighbor", nachmittag: "afternoon",
  nachrichten: "messages", nachricht: "message", nachts: "at night", nimmt: "takes",
  neben: "next to", neumann: "Neumann", neue: "new", neuen: "new", neuer: "new",
  nächsten: "next", nicht: "not", niemand: "nobody", noch: "still / yet", noah: "Noah",
  normalerweise: "normally", nur: "only", obwohl: "although", öffnet: "opens",
  oft: "often", ohne: "without", plan: "plan", planen: "to plan", geplant: "planned",
  plant: "plans", plätze: "seats", plötzlich: "suddenly", probieren: "to try",
  regenschirm: "umbrella", regnet: "it rains", reise: "journey", reisende: "travelers",
  rote: "red", ruhig: "quiet / calmly", ruhigen: "quiet", ruhigere: "quieter",
  ruinieren: "to ruin", rucksack: "backpack", samira: "Samira", samstag: "Saturday",
  sagt: "says", schaffner: "conductor", schaut: "looks", schicken: "to send",
  schild: "sign", schlafen: "to sleep", schlüssel: "key", schmal: "narrow",
  schnellsten: "fastest", schon: "already", schreiben: "to write", schwere: "heavy",
  sehr: "very", sein: "to be / his", seine: "his", seit: "since", seite: "side",
  sie: "she / they / you", sieht: "sees / looks", sind: "are", sitzen: "to sit",
  sitzt: "sits", sofort: "immediately", später: "later", spazieren: "to walk",
  sprechen: "to speak", stapel: "stack", stark: "strongly / heavily", steht: "stands / is",
  stehen: "stand", ständig: "constantly", stimmen: "voices", strom: "power / electricity",
  straße: "street", straßenkünstlers: "street artist's", strauß: "bouquet",
  stock: "floor / storey", stühlen: "chairs", suchen: "to search", tag: "day",
  tage: "days", tasse: "cup", tee: "tea", termine: "appointments", tisch: "table",
  tochter: "daughter", trotzdem: "nevertheless", trägt: "carries / wears",
  tragen: "to carry", treffen: "to meet", trinken: "to drink", tür: "door", uhr: "clock / time",
  um: "at / around / in order to", umzug: "move / relocation", und: "and",
  unruhig: "restlessly", unter: "under", unterwegs: "on the way", ursprüngliche: "original",
  vergessen: "forgotten", verkäufer: "sellers", verspätung: "delay", vierzig: "forty",
  viel: "much / a lot", viele: "many", vielleicht: "perhaps", von: "from / of",
  vor: "before / in front of", vormieter: "previous tenant", wartet: "waits",
  warten: "to wait", warm: "warm", warmes: "warm", war: "was", wasserflasche: "water bottle",
  weg: "way / path", weil: "because", weniger: "less", wenn: "if / when", werden: "to become",
  wieder: "again", will: "wants", winkt: "waves", winziger: "tiny", wissen: "to know",
  woche: "week", wolken: "clouds", wohnt: "lives", wohnung: "apartment",
  wohnzimmer: "living room", wohl: "comfortable / probably", wollte: "wanted",
  zeit: "time", zeitungen: "newspapers", zeigt: "shows", zettel: "note / slip of paper",
  zieht: "puts on / pulls", zimmer: "room", zwei: "two", zur: "to the", zu: "to / too",
  zuhause: "home", zufällig: "by chance", zug: "train", zuerst: "first", zusammen: "together",
};

const TOPIC_TERMS: Record<TopicKey, string[]> = {
  housing: ["wohnung", "wohnen", "zimmer", "miete", "umzug", "nachbar", "haus", "küche", "einziehen"],
  travel: ["reise", "zug", "bahnhof", "fahrkarte", "hotel", "flug", "gleis", "verspätung", "urlaub"],
  daily: ["alltag", "arbeit", "termin", "einkaufen", "freizeit", "wochenende", "handy", "freund", "plan"],
};

function cleanWord(token: string) {
  return token.toLocaleLowerCase("de-DE").replace(/[^a-zäöüßé]/gi, "");
}

function detectTopic(text: string): TopicKey {
  const normalized = text.toLocaleLowerCase("de-DE");
  const scores = Object.entries(TOPIC_TERMS).map(([key, terms]) => [
    key,
    terms.reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0),
  ]) as Array<[TopicKey, number]>;
  scores.sort((a, b) => b[1] - a[1]);
  return scores[0][1] > 0 ? scores[0][0] : "daily";
}

function detectGrammar(text: string) {
  const normalized = text.toLocaleLowerCase("de-DE");
  const focuses: string[] = [];
  if (/perfekt|partizip|haben und sein|ge\w+(t|en)/.test(normalized)) focuses.push("Perfekt");
  if (/nebensatz|weil|dass|obwohl|wenn/.test(normalized)) focuses.push("Nebensätze");
  if (/modalverb|können|müssen|dürfen|sollen|wollen/.test(normalized)) focuses.push("Modalverben");
  if (/dativ/.test(normalized)) focuses.push("Dativ");
  if (/akkusativ/.test(normalized)) focuses.push("Akkusativ");
  return focuses.length ? focuses.slice(0, 3) : ["Perfekt", "Nebensätze", "Modalverben"];
}

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  return new Promise<NonNullable<Window["Tesseract"]>>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-tesseract]");
    if (existing) {
      existing.addEventListener("load", () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error("OCR did not load")));
      existing.addEventListener("error", () => reject(new Error("OCR did not load")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.dataset.tesseract = "true";
    script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error("OCR did not load"));
    script.onerror = () => reject(new Error("OCR did not load"));
    document.head.appendChild(script);
  });
}

function StoryWord({ token, active }: { token: string; active: boolean }) {
  const word = cleanWord(token);
  const meaning = GLOSSARY[word];
  if (!word) return <>{token}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={`story-word ${meaning ? "has-meaning" : ""} ${active ? "active" : ""}`} aria-label={`${word}: ${meaning ?? "German lesson word"}`}>
          {token}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} className="word-tooltip">
        <span>{word}</span><strong>{meaning ?? "German lesson word"}</strong>
      </TooltipContent>
    </Tooltip>
  );
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [lessonText, setLessonText] = useState("");
  const [status, setStatus] = useState<AppStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [topicKey, setTopicKey] = useState<TopicKey>("housing");
  const [grammar, setGrammar] = useState(["Perfekt", "Nebensätze", "Modalverben"]);
  const [isSample, setIsSample] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [rate, setRate] = useState([0.85]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeChar, setActiveChar] = useState(-1);
  const [shadowPrompt, setShadowPrompt] = useState(false);
  const [writing, setWriting] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const story = STORIES[topicKey];
  const storyText = useMemo(() => story.paragraphs.join("\n\n"), [story]);
  const wordCount = useMemo(() => storyText.split(/\s+/).filter(Boolean).length, [storyText]);
  const writingWordCount = writing.trim() ? writing.trim().split(/\s+/).length : 0;

  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false); setIsPaused(false); setActiveChar(-1); setShadowPrompt(false); setWriting("");
  }, [topicKey]);

  function acceptFiles(nextFiles: File[]) {
    const usable = nextFiles.filter((file) => file.type.startsWith("image/")).filter((file) => file.size <= 8 * 1024 * 1024).slice(0, 4);
    setFiles(usable); setErrorMessage(""); setStatus("idle"); setIsSample(false);
  }

  async function createStory(useExample = false) {
    setErrorMessage(""); setProgress(4); setIsSample(false);
    try {
      let sourceText = useExample ? LESSON_EXAMPLE : lessonText.trim();
      if (!useExample && files.length) {
        setStatus("scanning");
        const tesseract = await loadTesseract();
        const scanned: string[] = [];
        for (let index = 0; index < files.length; index += 1) {
          const result = await tesseract.recognize(files[index], "deu+eng", {
            logger: (message) => {
              if (typeof message.progress === "number") setProgress(Math.max(5, Math.round(((index + message.progress) / files.length) * 72)));
            },
          });
          scanned.push(result.data.text);
        }
        sourceText = `${scanned.join("\n")}\n${sourceText}`.trim();
        setLessonText(sourceText);
      }
      if (!sourceText) throw new Error("Add a lesson photo or paste a few vocabulary and grammar notes first.");
      setStatus("writing"); setProgress(82);
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setTopicKey(detectTopic(sourceText)); setGrammar(detectGrammar(sourceText));
      setProgress(100); setStatus("ready");
      window.setTimeout(() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (error) {
      setStatus("error"); setProgress(0);
      setErrorMessage(error instanceof Error ? error.message : "I could not read that lesson.");
    }
  }

  function startSpeech(text = storyText, charOffset = 0, shadow = false) {
    if (!("speechSynthesis" in window)) { setErrorMessage("Audio playback is not supported in this browser."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE"; utterance.rate = rate[0]; utterance.pitch = 1;
    utterance.onboundary = (event) => { if (event.name === "word") setActiveChar(charOffset + event.charIndex); };
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); if (shadow) setShadowPrompt(true); else setActiveChar(-1); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
    utteranceRef.current = utterance; setShadowPrompt(false); setIsSpeaking(true); setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  }

  function toggleSpeech() {
    if (isSpeaking && !isPaused) { window.speechSynthesis.pause(); setIsPaused(true); return; }
    if (isSpeaking && isPaused) { window.speechSynthesis.resume(); setIsPaused(false); return; }
    startSpeech();
  }
  function restartSpeech() { window.speechSynthesis.cancel(); setActiveChar(-1); startSpeech(); }
  function shadowSentence() {
    const sentences: Array<{ text: string; start: number }> = [];
    const matcher = /[^.!?]+[.!?]+/g;
    let match: RegExpExecArray | null;
    while ((match = matcher.exec(storyText))) sentences.push({ text: match[0].trim(), start: match.index });
    const current = sentences.find((sentence, index) => activeChar >= sentence.start && activeChar < (sentences[index + 1]?.start ?? storyText.length)) ?? sentences[0];
    if (current) startSpeech(current.text, current.start, true);
  }
  function renderParagraph(paragraph: string, paragraphIndex: number) {
    const preceding = story.paragraphs.slice(0, paragraphIndex).reduce((length, item) => length + item.length + 2, 0);
    let cursor = 0;
    return paragraph.split(/(\s+)/).map((token, tokenIndex) => {
      const start = preceding + cursor; cursor += token.length;
      const active = activeChar >= start && activeChar < start + token.length;
      if (/^\s+$/.test(token)) return <span key={tokenIndex}>{token}</span>;
      return <StoryWord key={tokenIndex} token={token} active={active} />;
    });
  }
  const busy = status === "scanning" || status === "writing";

  return (
    <TooltipProvider delayDuration={80}>
      <main className="app-shell">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="LeseLaut home">
            <span className="brand-mark" aria-hidden="true"><span>ä</span></span>
            <span><strong>LeseLaut</strong><small>German stories from your lesson</small></span>
          </a>
          <div className="level-pill"><span className="level-dot" />A2 · Your level</div>
        </header>

        <section className="workspace" id="top">
          <aside className="lesson-panel" aria-labelledby="lesson-heading">
            <div className="panel-heading">
              <div className="step-number">01</div>
              <div><p>Today&apos;s material</p><h1 id="lesson-heading">Turn a lesson into a story.</h1></div>
            </div>
            <div className={`drop-zone ${files.length ? "has-files" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); acceptFiles(Array.from(event.dataTransfer.files)); }}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(event) => acceptFiles(Array.from(event.target.files ?? []))} aria-label="Upload lesson photos" />
              {files.length ? (
                <div className="file-stack">
                  <div className="file-icon"><FileText /><Check className="file-check" /></div>
                  <div><strong>{files.length} lesson photo{files.length > 1 ? "s" : ""} ready</strong><span>{files.map((file) => file.name).join(", ")}</span></div>
                  <Button variant="ghost" size="icon-sm" aria-label="Remove lesson photos" onClick={() => setFiles([])}><X /></Button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  <span className="upload-icon"><UploadCloud /></span><strong>Drop your lesson photos here</strong>
                  <span>or choose up to 4 images · JPG, PNG, HEIC</span><em><ImagePlus /> Choose photos</em>
                </button>
              )}
            </div>
            <div className="divider"><span>or add text</span></div>
            <label className="lesson-notes"><span>Vocabulary or grammar notes</span>
              <textarea value={lessonText} onChange={(event) => { setLessonText(event.target.value); setIsSample(false); }} placeholder="e.g. die Wohnung, der Nachbar, Perfekt, weil …" rows={4} />
            </label>
            {busy && (
              <div className="generation-progress" aria-live="polite">
                <div><LoaderCircle className="spin" /><span><strong>{status === "scanning" ? "Reading your lesson…" : "Writing your story…"}</strong><small>{status === "scanning" ? "Finding vocabulary and grammar" : "Keeping it natural and A2-friendly"}</small></span><b>{progress}%</b></div>
                <Progress value={progress} />
              </div>
            )}
            {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
            <Button className="generate-button" size="lg" disabled={busy || (!files.length && !lessonText.trim())} onClick={() => createStory(false)}>
              {busy ? <LoaderCircle className="spin" /> : <WandSparkles />}{busy ? "Creating…" : "Create my A2 story"}
            </Button>
            <button className="try-example" type="button" onClick={() => createStory(true)}><Sparkles /> Try it with a sample lesson</button>
            <div className="privacy-note"><Check /> Photos are read for this story and are not saved.</div>
          </aside>

          <section className="reader-panel" id="story" aria-labelledby="story-title">
            <div className="reader-topline"><div className="step-number dark">02</div><span>{isSample ? "Example story" : status === "ready" ? "Made from your lesson" : "Your reading space"}</span><Badge className="level-badge">A2</Badge></div>
            <div className="story-heading">
              <div><p>{story.eyebrow}</p><h2 id="story-title">{story.title}</h2></div>
              <div className="story-meta"><span><BookOpen /> {wordCount} Wörter</span><span><Headphones /> {story.readingTime}</span></div>
            </div>
            <div className="focus-row" aria-label="Lesson coverage"><span>Focus</span>{grammar.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}<Badge variant="outline">{story.topic}</Badge></div>
            <div className="audio-player">
              <Button className="play-button" size="icon-lg" aria-label={isSpeaking && !isPaused ? "Pause story" : "Play story"} onClick={toggleSpeech}>{isSpeaking && !isPaused ? <Pause /> : <Play className="play-offset" />}</Button>
              <div className="audio-copy"><strong>{isSpeaking ? (isPaused ? "Paused" : "Listening in German") : "Listen to the story"}</strong><span>{isSpeaking ? "The current word follows the voice" : "Natural browser voice · follow word by word"}</span></div>
              <div className="speed-control"><Gauge /><Slider min={0.6} max={1.15} step={0.05} value={rate} onValueChange={setRate} aria-label="Playback speed" /><b>{rate[0].toFixed(2)}×</b></div>
              <Button variant="ghost" size="icon-sm" aria-label="Restart story" onClick={restartSpeech}><RotateCcw /></Button>
            </div>
            <div className="hover-hint"><MousePointer2 /> Hover or tap any underlined word for English</div>
            <article className="story-copy" lang="de">{story.paragraphs.map((paragraph, index) => <p key={index}>{renderParagraph(paragraph, index)}</p>)}</article>
            <div className="practice-grid">
              <section className="practice-card speaking-card">
                <div className="practice-icon"><Volume2 /></div><div><span>Speaking · Schatten</span><h3>Hear one sentence. Repeat it aloud.</h3><p>{shadowPrompt ? "Your turn — repeat the sentence slowly." : "Start with the current sentence, or the first one."}</p></div>
                <Button variant={shadowPrompt ? "default" : "outline"} onClick={shadowSentence}><Volume2 /> {shadowPrompt ? "Hear it again" : "Shadow sentence"}</Button>
              </section>
              <section className="practice-card">
                <div className="practice-icon"><Languages /></div><div><span>Target words</span><h3>{story.vocabulary.length} useful words from this topic</h3>
                  <div className="vocab-list">{story.vocabulary.map(([word, meaning]) => <Tooltip key={word}><TooltipTrigger asChild><button type="button">{word}</button></TooltipTrigger><TooltipContent sideOffset={8} className="word-tooltip"><span>{word}</span><strong>{meaning}</strong></TooltipContent></Tooltip>)}</div>
                </div>
              </section>
            </div>
            <section className="writing-card">
              <div className="writing-heading"><div className="practice-icon"><FileText /></div><div><span>Writing · 5 minutes</span><h3>Continue the story</h3></div><b>{writingWordCount} Wörter</b></div>
              <p>{story.writingPrompt}</p><textarea value={writing} onChange={(event) => setWriting(event.target.value)} placeholder="Schreibe hier auf Deutsch …" rows={5} lang="de" />
            </section>
          </section>
        </section>
      </main>
    </TooltipProvider>
  );
}
