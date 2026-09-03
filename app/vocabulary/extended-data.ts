import type { VocabularyCategory, VocabularyWord } from "@/app/vocabulary/data";

type LexiconRow = [german: string, english: string, category: VocabularyCategory];

// Generated from the MIT-licensed Tartarus German B1 vocabulary corpus.
// Only standalone dictionary headwords and their primary English definitions are retained.
// See THIRD_PARTY_NOTICES.md and scripts/build-extended-vocabulary.mjs.
const EXTENDED_B1_ROWS: LexiconRow[] = [
  [
    "das Recht",
    "right",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Fall",
    "case",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Stand",
    "stand",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gott",
    "God",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Politik",
    "politics",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Regierung",
    "government",
    "Dienstleistungen & Behörden"
  ],
  [
    "der Bereich",
    "area",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Wert",
    "value",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Krieg",
    "war",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Lage",
    "situation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Rolle",
    "role",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Tod",
    "death",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Blick",
    "glance",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Partei",
    "party",
    "Freizeit, Kultur & Sport"
  ],
  [
    "das System",
    "system",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Suche",
    "search",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rahmen",
    "frame",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Höhe",
    "height",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sex",
    "sex",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Titel",
    "title",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Chance",
    "chance",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Sicherheit",
    "security",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Medium",
    "medium",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Saison",
    "season",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gedanke",
    "thought",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Gemeinde",
    "community",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Nähe",
    "proximity",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sinn",
    "sense",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kultur",
    "culture",
    "Grundlagen & Kommunikation"
  ],
  [
    "der König",
    "king",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Opfer",
    "victim",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Region",
    "region",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wirtschaft",
    "economy",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Bevölkerung",
    "population",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kreis",
    "circle",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Rede",
    "speech",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Politiker",
    "politician",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Erfahrung",
    "experience",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kampf",
    "fight",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kraft",
    "strength",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Präsident",
    "president",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Druck",
    "pressure",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Gefahr",
    "danger",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Natur",
    "nature",
    "Natur, Wetter & Umwelt"
  ],
  [
    "die Schuld",
    "guilt",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wahrheit",
    "truth",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Runde",
    "round",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Serie",
    "series",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Gewalt",
    "violence",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Werk",
    "work",
    "Arbeit & Beruf"
  ],
  [
    "der Begriff",
    "concept",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bericht",
    "report",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Freiheit",
    "freedom",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Leistung",
    "performance",
    "Familie & Menschen"
  ],
  [
    "der Versuch",
    "attempt",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Sicht",
    "view",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Zeitpunkt",
    "point in time",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "die Anzahl",
    "number",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "der Bau",
    "construction",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Meister",
    "master",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Volk",
    "people",
    "Familie & Menschen"
  ],
  [
    "das Mittel",
    "means",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Position",
    "position",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schutz",
    "protection",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Leid",
    "sorrow",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Studie",
    "study",
    "Schule & Lernen"
  ],
  [
    "die Technik",
    "technology",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Union",
    "union",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Werbung",
    "advertising",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Amt",
    "office",
    "Arbeit & Beruf"
  ],
  [
    "der Einfluss",
    "influence",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gebiet",
    "area",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Hoffnung",
    "hope",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Show",
    "show",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Version",
    "version",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Basis",
    "basis",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schaden",
    "damage",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Aktion",
    "action",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Funktion",
    "function",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Inhalt",
    "content",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Soldat",
    "soldier",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Zustand",
    "state",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Künstler",
    "artist",
    "Freizeit, Kultur & Sport"
  ],
  [
    "die Umgebung",
    "surroundings",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gegensatz",
    "contrast",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Prozess",
    "process",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dienst",
    "service",
    "Dienstleistungen & Behörden"
  ],
  [
    "das Interview",
    "interview",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Praxis",
    "practice",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Szene",
    "scene",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Verlag",
    "publisher",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Armee",
    "army",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Auftrag",
    "order",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Konzept",
    "concept",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Plus",
    "plus",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rat",
    "advice",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Spitze",
    "tip",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Star",
    "star",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bürgermeister",
    "mayor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gegner",
    "opponent",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Heimat",
    "homeland",
    "Zuhause & Wohnen"
  ],
  [
    "die Industrie",
    "industry",
    "Arbeit & Beruf"
  ],
  [
    "die Leitung",
    "management",
    "Familie & Menschen"
  ],
  [
    "die Liga",
    "league",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Waffe",
    "weapon",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Finale",
    "final",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Leiter",
    "leader",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Verwendung",
    "use",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ausgabe",
    "expense",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Jude",
    "Jew",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Religion",
    "religion",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Angriff",
    "attack",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Forschung",
    "research",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Grundlage",
    "basis",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Seele",
    "soul",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Falle",
    "trap",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Frieden",
    "peace",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Lauf",
    "course",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Milliarde",
    "billion",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Not",
    "need",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Presse",
    "press",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Produktion",
    "production",
    "Einkaufen & Kleidung"
  ],
  [
    "die Wissenschaft",
    "science",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Wunder",
    "miracle",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bedarf",
    "need",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Einführung",
    "introduction",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Masse",
    "mass",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Geist",
    "spirit",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Verhältnis",
    "relationship",
    "Familie & Menschen"
  ],
  [
    "die Ebene",
    "level",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Erinnerung",
    "memory",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Handel",
    "trade",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hinweis",
    "hint",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Institut",
    "institute",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Lager",
    "warehouse",
    "Zuhause & Wohnen"
  ],
  [
    "die Reaktion",
    "reaction",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Gegend",
    "area",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kommission",
    "commission",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Risiko",
    "risk",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Stil",
    "style",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Stimmung",
    "mood",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Zuschauer",
    "spectator",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gewinn",
    "profit",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Prinzip",
    "principle",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Tradition",
    "tradition",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Tätigkeit",
    "activity",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Vorstellung",
    "idea",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Antrag",
    "application",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Anwendung",
    "application",
    "Grundlagen & Kommunikation"
  ],
  [
    "die City",
    "city center",
    "Stadt & Verkehr"
  ],
  [
    "das Parlament",
    "parliament",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Steuer",
    "tax",
    "Dienstleistungen & Behörden"
  ],
  [
    "die Aufnahme",
    "recording",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Auftritt",
    "performance",
    "Familie & Menschen"
  ],
  [
    "die Förderung",
    "support",
    "Grundlagen & Kommunikation"
  ],
  [
    "die News",
    "news",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Sammlung",
    "collection",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Standard",
    "standard",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Theorie",
    "theory",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Verständnis",
    "understanding",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Realität",
    "reality",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Republik",
    "republic",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Zugang",
    "access",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Einrichtung",
    "facility",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Experte",
    "expert",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gegenteil",
    "opposite",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kategorie",
    "category",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Nutzung",
    "use",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Posten",
    "post",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Wechsel",
    "change",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ansicht",
    "view",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Design",
    "design",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Anhänger",
    "follower",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Anlass",
    "occasion",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Einheit",
    "unit",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gewicht",
    "weight",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Minister",
    "minister",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Niveau",
    "level",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fläche",
    "surface",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Medizin",
    "medicine",
    "Gesundheit & Körper"
  ],
  [
    "der Beweis",
    "proof",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kommunikation",
    "communication",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Manager",
    "manager",
    "Familie & Menschen"
  ],
  [
    "die Mühe",
    "effort",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rang",
    "rank",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Besitz",
    "possession",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Detail",
    "detail",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Figur",
    "figure",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Flucht",
    "escape",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Formel",
    "formula",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Griff",
    "grip",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Mut",
    "courage",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Phase",
    "phase",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Prof",
    "professor",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Teilnahme",
    "participation",
    "Freizeit, Kultur & Sport"
  ],
  [
    "die Übersetzung",
    "translation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Code",
    "code",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Debatte",
    "debate",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ehre",
    "honor",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Forum",
    "forum",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Journalist",
    "journalist",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schwanz",
    "tail",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Schwierigkeit",
    "difficulty",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Spur",
    "trace",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schnitt",
    "cut",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Silber",
    "silver",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Status",
    "status",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Anwalt",
    "lawyer",
    "Dienstleistungen & Behörden"
  ],
  [
    "der Engel",
    "angel",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Krise",
    "crisis",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Mist",
    "manure",
    "Familie & Menschen"
  ],
  [
    "die Strafe",
    "punishment",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Abschnitt",
    "section",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Geburt",
    "birth",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kern",
    "core",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Kreuz",
    "cross",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Planung",
    "planning",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schatten",
    "shadow",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Unternehmer",
    "entrepreneur",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Verbrechen",
    "crime",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Veränderung",
    "change",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Änderung",
    "change",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Übersicht",
    "overview",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Besitzer",
    "owner",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Blog",
    "blog",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Fakt",
    "fact",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Hochschule",
    "university",
    "Schule & Lernen"
  ],
  [
    "der Pfarrer",
    "pastor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sender",
    "sender",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sieger",
    "winner",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Statistik",
    "statistics",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Umfeld",
    "environment",
    "Natur, Wetter & Umwelt"
  ],
  [
    "der User",
    "user",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Weltkrieg",
    "world war",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Botschaft",
    "message",
    "Medien & Digitales"
  ],
  [
    "die Geschwindigkeit",
    "speed",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Herkunft",
    "origin",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Humor",
    "humor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kanal",
    "canal",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Stellung",
    "position",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Variante",
    "variant",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Community",
    "community",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Frühjahr",
    "spring",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Graf",
    "count",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kombination",
    "combination",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Papst",
    "Pope",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rand",
    "edge",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Server",
    "server",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Verbot",
    "prohibition",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Vortrag",
    "lecture",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bock",
    "male goat",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Christ",
    "Christian",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Führer",
    "leader",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gefängnis",
    "prison",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Lehre",
    "teaching",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Management",
    "management",
    "Familie & Menschen"
  ],
  [
    "die Tat",
    "deed",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Trend",
    "trend",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Vorbereitung",
    "preparation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Zufall",
    "coincidence",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bezirk",
    "district",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Brand",
    "fire",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Landwirtschaft",
    "agriculture",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Last",
    "load",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Studio",
    "studio",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Summe",
    "sum",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Drittel",
    "third",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Heim",
    "home",
    "Zuhause & Wohnen"
  ],
  [
    "das Motto",
    "motto",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Schrift",
    "writing",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Strategie",
    "strategy",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Struktur",
    "structure",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Stufe",
    "step",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Stärke",
    "strength",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Anbieter",
    "provider",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Anfrage",
    "inquiry",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Gegenwart",
    "present",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Handlung",
    "action",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Konkurrenz",
    "competition",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schlag",
    "hit",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Vorbild",
    "role model",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Weile",
    "while",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Wissenschaftler",
    "scientist",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Abenteuer",
    "adventure",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Archiv",
    "archive",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Effekt",
    "effect",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Element",
    "element",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Ereignis",
    "event",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Game",
    "game",
    "Freizeit, Kultur & Sport"
  ],
  [
    "der Kerl",
    "guy",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Messe",
    "fair",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Netzwerk",
    "network",
    "Arbeit & Beruf"
  ],
  [
    "der Schuss",
    "shot",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Schönheit",
    "beauty",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Unterhaltung",
    "entertainment",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Wesen",
    "being",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Überblick",
    "overview",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Beamte",
    "official",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Chat",
    "chat",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Chemie",
    "chemistry",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Format",
    "format",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Geschlecht",
    "gender",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kandidat",
    "candidate",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "die Mischung",
    "mixture",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pop",
    "pop",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Sitzung",
    "meeting",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Wachstum",
    "growth",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Account",
    "account",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Atmosphäre",
    "atmosphere",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Held",
    "hero",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schneider",
    "tailor",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Umfrage",
    "survey",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Deal",
    "deal",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Definition",
    "definition",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Gerechtigkeit",
    "justice",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kapitän",
    "captain",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Perspektive",
    "perspective",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Regelung",
    "regulation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Teufel",
    "devil",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Vorsicht",
    "caution",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Aufstieg",
    "ascent",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Edition",
    "edition",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Front",
    "front",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Jäger",
    "hunter",
    "Grundlagen & Kommunikation"
  ],
  [
    "der King",
    "king",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Verbesserung",
    "improvement",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Aussicht",
    "view",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Cup",
    "cup",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Entfernung",
    "distance",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Eröffnung",
    "opening",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Geheimnis",
    "secret",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kohle",
    "coal",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Oberfläche",
    "surface",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Option",
    "option",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Verteidigung",
    "defense",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Beratung",
    "consultation",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Center",
    "center",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Fokus",
    "focus",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Forscher",
    "researcher",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hafen",
    "port",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Nation",
    "nation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Spannung",
    "tension",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Chaos",
    "chaos",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Feind",
    "enemy",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Flügel",
    "wing",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gebrauch",
    "use",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Haufen",
    "heap",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Haushalt",
    "household",
    "Zuhause & Wohnen"
  ],
  [
    "die Lady",
    "lady",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Militär",
    "military",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schriftsteller",
    "writer",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sprecher",
    "speaker",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Anhalt",
    "stop",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Event",
    "event",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kampagne",
    "campaign",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Krone",
    "crown",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Level",
    "level",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Migrant",
    "migrant",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Priester",
    "priest",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Träger",
    "carrier",
    "Stadt & Verkehr"
  ],
  [
    "die Träne",
    "tear",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Villa",
    "villa",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bachelor",
    "bachelor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Faktor",
    "factor",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Home",
    "home",
    "Zuhause & Wohnen"
  ],
  [
    "der Händler",
    "dealer",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Logo",
    "logo",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Planet",
    "planet",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Wandel",
    "change",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Annahme",
    "assumption",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Befehl",
    "command",
    "Familie & Menschen"
  ],
  [
    "der Berater",
    "consultant",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gipfel",
    "summit",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Klang",
    "sound",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Mathematik",
    "mathematics",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Motivation",
    "motivation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Neubau",
    "new building",
    "Zuhause & Wohnen"
  ],
  [
    "der Profi",
    "professional",
    "Arbeit & Beruf"
  ],
  [
    "die Technologie",
    "technology",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Unterlage",
    "document",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Aspekt",
    "aspect",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Demo",
    "demo",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Drama",
    "drama",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Halbfinale",
    "semi-final",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Jagd",
    "hunt",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Kloster",
    "monastery",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Konferenz",
    "conference",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Mädel",
    "girl",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Objekt",
    "object",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Türke",
    "Turk",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Weltmeister",
    "world champion",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Austausch",
    "exchange",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Block",
    "block",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dialog",
    "dialogue",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fassung",
    "version",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Grab",
    "grave",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Provinz",
    "province",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Signal",
    "signal",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Symbol",
    "symbol",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Unsinn",
    "nonsense",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Update",
    "update",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "die Vorlage",
    "template",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Arena",
    "arena",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Idiot",
    "idiot",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kumpel",
    "buddy",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Motiv",
    "motive",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Protest",
    "protest",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Tourismus",
    "tourism",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Virus",
    "virus",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Angehörige",
    "relative",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dreck",
    "dirt",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Knochen",
    "bone",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Laune",
    "mood",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pokal",
    "cup",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Regisseur",
    "director",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Streifen",
    "stripe",
    "Reisen & Unterkunft"
  ],
  [
    "das Talent",
    "talent",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Vorwurf",
    "reproach",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wurzel",
    "root",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wut",
    "rage",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Meldung",
    "report",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Muslim",
    "Muslim",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Power",
    "power",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Spieltag",
    "matchday",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "die Agentur",
    "agency",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Argument",
    "argument",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Empfang",
    "reception",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Katastrophe",
    "catastrophe",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Legende",
    "legend",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Mangel",
    "lack",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Stille",
    "silence",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Versammlung",
    "meeting",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wärme",
    "warmth",
    "Grundlagen & Kommunikation"
  ],
  [
    "das College",
    "college",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Erziehung",
    "upbringing",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Geduld",
    "patience",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kämpfer",
    "fighter",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Zunge",
    "tongue",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Aufenthalt",
    "stay",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Betreuung",
    "care",
    "Stadt & Verkehr"
  ],
  [
    "die Empfehlung",
    "recommendation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Finanz",
    "finance",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Metall",
    "metal",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Model",
    "model",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ressource",
    "resource",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Tempo",
    "speed",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Web",
    "web",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Action",
    "Action",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bayer",
    "Bavarian",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Betreiber",
    "operator",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Champion",
    "champion",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fortsetzung",
    "continuation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Intelligenz",
    "intelligence",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kongress",
    "congress",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Nahrung",
    "food",
    "Essen & Trinken"
  ],
  [
    "das Pech",
    "bad luck",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pirat",
    "pirate",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Skandal",
    "scandal",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Tendenz",
    "tendency",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Treffer",
    "hit",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Verlängerung",
    "extension",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Abitur",
    "Abitur",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Begegnung",
    "encounter",
    "Grundlagen & Kommunikation"
  ],
  [
    "der DJ",
    "DJ",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Dokumentation",
    "documentation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gesang",
    "singing",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Halbzeit",
    "halftime",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "die Persönlichkeit",
    "personality",
    "Familie & Menschen"
  ],
  [
    "die Platte",
    "plate",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sir",
    "Sir",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sound",
    "sound",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Störung",
    "disturbance",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Support",
    "support",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Tempel",
    "temple",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Ufer",
    "bank",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Botschafter",
    "ambassador",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Fortschritt",
    "progress",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Friedhof",
    "cemetery",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Grafik",
    "graphic",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kredit",
    "credit",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kugel",
    "ball",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schmuck",
    "jewelry",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Vergnügen",
    "pleasure",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Distanz",
    "distance",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Entwickler",
    "developer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Panik",
    "panic",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wette",
    "bet",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Zelle",
    "cell",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Adler",
    "eagle",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Angestellte",
    "employee",
    "Arbeit & Beruf"
  ],
  [
    "die Beschwerde",
    "complaint",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bogen",
    "bow",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Erbe",
    "inheritance",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Faust",
    "fist",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Jazz",
    "jazz",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Lob",
    "praise",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Luxus",
    "luxury",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Radfahrer",
    "cyclist",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Stream",
    "stream",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Verwandte",
    "relative",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Boy",
    "boy",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dom",
    "cathedral",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fabrik",
    "factory",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Handbuch",
    "manual",
    "Familie & Menschen"
  ],
  [
    "die Kammer",
    "chamber",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Mitteilung",
    "message",
    "Medien & Digitales"
  ],
  [
    "die Rettung",
    "rescue",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sportler",
    "athlete",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Strich",
    "line",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Umbau",
    "renovation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Winkel",
    "angle",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Übergang",
    "transition",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Alpe",
    "alpine pasture",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Budget",
    "budget",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Demonstrant",
    "demonstrator",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Miss",
    "Miss",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Moderator",
    "moderator",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Reiter",
    "rider",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Rätsel",
    "riddle",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Springer",
    "jumper",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sprung",
    "jump",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Unglück",
    "misfortune",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Aufregung",
    "excitement",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Blödsinn",
    "nonsense",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Boss",
    "boss",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Check",
    "check (review",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Eintrag",
    "entry",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Funk",
    "radio",
    "Medien & Digitales"
  ],
  [
    "das GB",
    "Gigabyte",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Handwerk",
    "craft",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Kfz",
    "motor vehicle",
    "Stadt & Verkehr"
  ],
  [
    "der Käufer",
    "buyer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Moral",
    "morale",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Saal",
    "hall",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ausrüstung",
    "equipment",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Emotion",
    "emotion",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Girl",
    "girl",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Höhle",
    "cave",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Image",
    "image",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kanzler",
    "chancellor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rechtsanwalt",
    "lawyer",
    "Dienstleistungen & Behörden"
  ],
  [
    "die Route",
    "route",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Akku",
    "rechargeable battery",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Begleitung",
    "accompaniment",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Brite",
    "Briton",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Coach",
    "coach",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Einblick",
    "insight",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Episode",
    "episode",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Genuss",
    "enjoyment",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Geruch",
    "smell",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Kennzeichen",
    "characteristic",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Pack",
    "pack",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rekord",
    "record",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Treue",
    "loyalty",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Vision",
    "vision",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Camp",
    "camp",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Empfänger",
    "recipient",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Experiment",
    "experiment",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gedächtnis",
    "memory",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Trauer",
    "grief",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Universum",
    "universe",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wüste",
    "desert",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Agenda",
    "agenda",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Architekt",
    "architect",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Begeisterung",
    "enthusiasm",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Designer",
    "designer",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Eisen",
    "iron",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Erlaubnis",
    "permission",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Jury",
    "jury",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Katalog",
    "catalog",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Orientierung",
    "orientation",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Protokoll",
    "protocol",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Seminar",
    "seminar",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Spielzeit",
    "playing time",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "der Anblick",
    "sight",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Bauarbeit",
    "construction work",
    "Arbeit & Beruf"
  ],
  [
    "die Bronze",
    "bronze",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Einstieg",
    "entry",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gutschein",
    "voucher",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Klick",
    "click",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kommune",
    "municipality",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Mitleid",
    "pity",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Staub",
    "dust",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Tagebuch",
    "diary",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Verdienst",
    "earnings",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Alarm",
    "alarm",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Bezahlung",
    "payment",
    "Einkaufen & Kleidung"
  ],
  [
    "das Bundesland",
    "federal state",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Dunkelheit",
    "darkness",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Duo",
    "duo",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Feedback",
    "feedback",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hektar",
    "hectare",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Journal",
    "journal",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kai",
    "quay",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kürze",
    "brevity",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Malerei",
    "painting",
    "Gesundheit & Körper"
  ],
  [
    "das Paradies",
    "paradise",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Scherz",
    "joke",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Veranstalter",
    "organizer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Demonstration",
    "demonstration",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Disziplin",
    "discipline",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Entdeckung",
    "discovery",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Filter",
    "filter",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Freiwillige",
    "volunteer",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gaming",
    "gaming",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Horn",
    "horn",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kälte",
    "coldness",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Mittelmeer",
    "Mediterranean Sea",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ostsee",
    "Baltic Sea",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Resultat",
    "result",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Sparkasse",
    "savings bank",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Verstärkung",
    "reinforcement",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Anordnung",
    "arrangement",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Becken",
    "basin",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Beobachtung",
    "observation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Besserung",
    "improvement",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hintern",
    "bottom",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kaufmann",
    "merchant",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Leinwand",
    "canvas",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Lücke",
    "gap",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Marathon",
    "marathon",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Mix",
    "mix",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Volumen",
    "volume",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Boxen",
    "boxing",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Crew",
    "crew",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gerücht",
    "rumor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Helm",
    "helmet",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hügel",
    "hill",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Ingenieur",
    "engineer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kapelle",
    "chapel",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Lizenz",
    "license",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Match",
    "match (sports",
    "Freizeit, Kultur & Sport"
  ],
  [
    "der Ruhestand",
    "retirement",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Schwangerschaft",
    "pregnancy",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Testament",
    "will",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Viertelfinale",
    "quarter-final",
    "Freizeit, Kultur & Sport"
  ],
  [
    "der Bass",
    "bass (music",
    "Freizeit, Kultur & Sport"
  ],
  [
    "die Belohnung",
    "reward",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Einleitung",
    "introduction",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fantasie",
    "fantasy",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Gnade",
    "grace",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hauptmann",
    "captain",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Kommando",
    "command",
    "Familie & Menschen"
  ],
  [
    "die Künstlerin",
    "female artist",
    "Freizeit, Kultur & Sport"
  ],
  [
    "die Rasse",
    "breed",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schein",
    "shine",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Stadtrat",
    "city council",
    "Stadt & Verkehr"
  ],
  [
    "das Vorjahr",
    "previous year",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "die Weltmeisterschaft",
    "world championship",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bruch",
    "break",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Denkmal",
    "monument",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Echo",
    "echo",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Erfindung",
    "invention",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Exemplar",
    "specimen",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Explosion",
    "explosion",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Flamme",
    "flame",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kita",
    "daycare",
    "Stadt & Verkehr"
  ],
  [
    "das Plastik",
    "plastic",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Sorte",
    "sort",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Vermutung",
    "assumption",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Anbau",
    "cultivation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Beleuchtung",
    "lighting",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Benutzung",
    "use",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Blase",
    "bubble",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Einbruch",
    "burglary",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Erdbeben",
    "earthquake",
    "Freizeit, Kultur & Sport"
  ],
  [
    "der Faden",
    "thread",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fahne",
    "flag",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Offizier",
    "officer",
    "Arbeit & Beruf"
  ],
  [
    "der Store",
    "store",
    "Einkaufen & Kleidung"
  ],
  [
    "der Style",
    "style",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Öffnung",
    "opening",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Amateur",
    "amateur",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Europäer",
    "European",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fantasy",
    "fantasy",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Herausgeber",
    "editor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Knoten",
    "knot",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Passagier",
    "passenger",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Stich",
    "sting",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Vorgang",
    "process",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dance",
    "dance",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fakultät",
    "faculty",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Gift",
    "poison",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Haken",
    "hook",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kreativität",
    "creativity",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ladung",
    "cargo",
    "Stadt & Verkehr"
  ],
  [
    "die Medaille",
    "medal",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Neuigkeit",
    "news",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Palast",
    "palace",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Report",
    "report",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Review",
    "review",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Techniker",
    "technician",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Übersetzer",
    "translator",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Ausblick",
    "view",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Campus",
    "campus",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Dating",
    "dating",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Jungfrau",
    "virgin",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kamerad",
    "comrade",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Konsum",
    "consumption",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Marsch",
    "march",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Meile",
    "mile",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Moschee",
    "mosque",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Musical",
    "musical",
    "Freizeit, Kultur & Sport"
  ],
  [
    "der Schäfer",
    "shepherd",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Sturz",
    "fall",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ankündigung",
    "announcement",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Doku",
    "documentary",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Favorit",
    "favorite",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Glanz",
    "shine",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Gottesdienst",
    "church service",
    "Dienstleistungen & Behörden"
  ],
  [
    "die Hardware",
    "hardware",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Insekt",
    "insect",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Potenzial",
    "potential",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rapper",
    "rapper",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Statement",
    "statement",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Trio",
    "trio",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Versand",
    "shipping",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Zimmermann",
    "carpenter",
    "Stadt & Verkehr"
  ],
  [
    "der Applaus",
    "applause",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Beobachter",
    "observer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Dummheit",
    "stupidity",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fassade",
    "facade",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hubschrauber",
    "helicopter",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Label",
    "label",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Maßstab",
    "scale",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Orgel",
    "organ",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Player",
    "player",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Rohr",
    "pipe",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Vertretung",
    "representation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Währung",
    "currency",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Anime",
    "anime",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Benehmen",
    "behavior",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Ernte",
    "harvest",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Internetseite",
    "website",
    "Medien & Digitales"
  ],
  [
    "der Kommissar",
    "commissioner",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Komödie",
    "comedy",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Panorama",
    "panorama",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Rakete",
    "rocket",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rundfunk",
    "broadcasting",
    "Stadt & Verkehr"
  ],
  [
    "die Rückseite",
    "back",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Speicher",
    "storage",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Stürmer",
    "striker",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Takt",
    "beat",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Trikot",
    "jersey",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Verlierer",
    "loser",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Work",
    "work",
    "Arbeit & Beruf"
  ],
  [
    "die Achse",
    "axis",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Erholung",
    "recovery",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Filiale",
    "branch (of a company",
    "Arbeit & Beruf"
  ],
  [
    "der Flieger",
    "pilot",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Herrscher",
    "ruler",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Horizont",
    "horizon",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Nacken",
    "neck",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Nagel",
    "nail",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Quartal",
    "quarter",
    "Freizeit, Kultur & Sport"
  ],
  [
    "der Sauerstoff",
    "oxygen",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Space",
    "space",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Talk",
    "talk",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Tweet",
    "tweet",
    "Grundlagen & Kommunikation"
  ],
  [
    "die URL",
    "URL",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Wohnraum",
    "living space",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Abbildung",
    "illustration",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Abo",
    "subscription",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Audio",
    "audio",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Bindung",
    "bond",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Diener",
    "servant",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Enttäuschung",
    "disappointment",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Fass",
    "barrel",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Flüssigkeit",
    "liquid",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Klappe",
    "flap",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Krimi",
    "crime novel",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Läufer",
    "runner",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Priorität",
    "priority",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Produzent",
    "producer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Reinigung",
    "cleaning",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Steuerzahler",
    "taxpayer",
    "Dienstleistungen & Behörden"
  ],
  [
    "die Taktik",
    "tactic",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Workshop",
    "workshop",
    "Einkaufen & Kleidung"
  ],
  [
    "die Abwesenheit",
    "absence",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Anweisung",
    "instruction",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Aufsatz",
    "essay",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Buche",
    "beech",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Bucht",
    "bay",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Captain",
    "captain",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Channel",
    "channel",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Diplom",
    "diploma",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Family",
    "family",
    "Familie & Menschen"
  ],
  [
    "die Gabe",
    "gift",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Horror",
    "horror",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Komponist",
    "composer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Leber",
    "liver",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Organ",
    "organ",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Porto",
    "postage",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schiedsrichter",
    "referee",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schreiber",
    "writer",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Speed",
    "speed",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Tageszeitung",
    "daily newspaper",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Trailer",
    "trailer",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Umkreis",
    "vicinity",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Verzeichnis",
    "directory",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Witwe",
    "widow",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Aufsicht",
    "supervision",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Beton",
    "concrete",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Comedy",
    "comedy",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Drache",
    "dragon",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Entlassung",
    "dismissal",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Fächer",
    "fan",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hang",
    "slope",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Karneval",
    "carnival",
    "Stadt & Verkehr"
  ],
  [
    "die Krankenkasse",
    "health insurance fund",
    "Gesundheit & Körper"
  ],
  [
    "die Publikation",
    "publication",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Redakteur",
    "editor",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Stärkung",
    "strengthening",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Anmerkung",
    "note",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Charme",
    "charm",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Darsteller",
    "actor",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Heimspiel",
    "home game",
    "Zuhause & Wohnen"
  ],
  [
    "die Mühle",
    "mill",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Puls",
    "pulse",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Teen",
    "teen",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Uniform",
    "uniform",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Agent",
    "agent",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bundeskanzler",
    "Federal Chancellor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Einzelhandel",
    "retail",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Export",
    "export",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Glaube",
    "belief",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hacker",
    "hacker",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kram",
    "stuff",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Punk",
    "punk",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Schauspiel",
    "play",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Transfer",
    "transfer",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Country",
    "country",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Dosis",
    "dose",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Energy",
    "energy",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Entspannung",
    "relaxation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Feder",
    "feather",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Forst",
    "forest",
    "Natur, Wetter & Umwelt"
  ],
  [
    "der Fund",
    "find",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Indianer",
    "Native American",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Lautsprecher",
    "loudspeaker",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Ortsteil",
    "district",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pastor",
    "pastor",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Schnauze",
    "snout",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Straßenverkehr",
    "road traffic",
    "Stadt & Verkehr"
  ],
  [
    "die Säule",
    "column",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wache",
    "guard",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Angel",
    "fishing rod",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Banner",
    "banner",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Blues",
    "blues",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Board",
    "board",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Cam",
    "cam",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Container",
    "container",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Ermittler",
    "investigator",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Geste",
    "gesture",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Key",
    "key",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Klarheit",
    "clarity",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Periode",
    "period",
    "Zeit, Zahlen & Mengen"
  ],
  [
    "das Porträt",
    "portrait",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Wettkampf",
    "competition",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Überschrift",
    "headline",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Akzent",
    "accent",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dialekt",
    "dialect",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Grube",
    "pit",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Maut",
    "toll",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Niederschlag",
    "precipitation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Page",
    "bellboy",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Rückblick",
    "retrospect",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Spezialist",
    "specialist",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Streik",
    "strike",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Unsicherheit",
    "uncertainty",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Übergabe",
    "handover",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Aussprache",
    "pronunciation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Duft",
    "scent",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Feuerwerk",
    "fireworks",
    "Arbeit & Beruf"
  ],
  [
    "die Installation",
    "installation",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Jersey",
    "jersey (fabric",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Kombi",
    "station wagon",
    "Stadt & Verkehr"
  ],
  [
    "der Kurier",
    "courier",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pole",
    "Pole",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Port",
    "port",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Ratgeber",
    "advisor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Räuber",
    "robber",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Salon",
    "salon",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Siedlung",
    "settlement",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Stadium",
    "stadium",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Trip",
    "trip",
    "Reisen & Unterkunft"
  ],
  [
    "der Walker",
    "walker",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Airline",
    "airline",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Handschrift",
    "handwriting",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Harmonie",
    "harmony",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Hülle",
    "cover",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Landstraße",
    "country road",
    "Stadt & Verkehr"
  ],
  [
    "der Newsletter",
    "newsletter",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schrei",
    "scream",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Spinner",
    "weirdo",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Taufe",
    "baptism",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Araber",
    "Arab",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Balance",
    "balance",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Beat",
    "beat",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Button",
    "button",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Elektronik",
    "electronics",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Heimatstadt",
    "hometown",
    "Zuhause & Wohnen"
  ],
  [
    "das Jahrbuch",
    "yearbook",
    "Schule & Lernen"
  ],
  [
    "die Klassik",
    "classical music",
    "Freizeit, Kultur & Sport"
  ],
  [
    "das Quartier",
    "quarter",
    "Freizeit, Kultur & Sport"
  ],
  [
    "der Sammler",
    "collector",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Schrott",
    "scrap",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Skala",
    "scale",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Stab",
    "staff",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Stadtgebiet",
    "urban area",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Thriller",
    "thriller",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Wellness",
    "wellness",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Wirt",
    "host",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Zubehör",
    "accessories",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Abi",
    "high school diploma",
    "Schule & Lernen"
  ],
  [
    "die Absage",
    "cancellation",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Cash",
    "cash",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Damm",
    "dam",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Flyer",
    "flyer",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Hirsch",
    "deer",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Inspiration",
    "inspiration",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kabine",
    "cabin",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Kopftuch",
    "headscarf",
    "Stadt & Verkehr"
  ],
  [
    "das Korn",
    "grain",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Landung",
    "landing",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Langeweile",
    "boredom",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pfeil",
    "arrow",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Realschule",
    "secondary modern school",
    "Schule & Lernen"
  ],
  [
    "der Spam",
    "spam",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Stange",
    "pole",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Tarif",
    "tariff",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Untertitel",
    "subtitle",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Allee",
    "avenue",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Balken",
    "beam",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Berührung",
    "touch",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Bike",
    "bike",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Differenz",
    "difference",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Erleichterung",
    "relief",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fahrbahn",
    "roadway",
    "Stadt & Verkehr"
  ],
  [
    "die Kiefer",
    "jaw",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Kompliment",
    "compliment",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Map",
    "map",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Minimum",
    "minimum",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Nationalpark",
    "national park",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Neid",
    "envy",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Pille",
    "pill",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Tagesordnung",
    "agenda",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Verwirrung",
    "confusion",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Vorwort",
    "foreword",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Abgang",
    "departure",
    "Freizeit, Kultur & Sport"
  ],
  [
    "die Arbeitsbedingung",
    "working condition",
    "Arbeit & Beruf"
  ],
  [
    "die Ausrede",
    "excuse",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Body",
    "body (clothing item",
    "Einkaufen & Kleidung"
  ],
  [
    "die Brauerei",
    "brewery",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dieb",
    "thief",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Dschungel",
    "jungle",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Fashion",
    "fashion",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Guide",
    "guide",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Hygiene",
    "hygiene",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Jahrestag",
    "anniversary",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kleinanzeige",
    "classified ad",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Kollektion",
    "collection",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Lebensweise",
    "way of life",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Leine",
    "leash",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Lobby",
    "lobby",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Lunge",
    "lung",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Männchen",
    "male",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pfad",
    "path",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Quadratmeter",
    "square meter",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Router",
    "router",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Schulzeit",
    "school time",
    "Schule & Lernen"
  ],
  [
    "der Syrer",
    "Syrian",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Südwesten",
    "southwest",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Teich",
    "pond",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Weide",
    "pasture",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Ansprechpartner",
    "contact person",
    "Familie & Menschen"
  ],
  [
    "die Beauty",
    "beauty",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Bestseller",
    "bestseller",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Biss",
    "bite",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Bude",
    "stall",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Casino",
    "casino",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Deck",
    "deck",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Einbrecher",
    "burglar",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Entschluss",
    "decision",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Erfinder",
    "inventor",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Freundeskreis",
    "circle of friends",
    "Familie & Menschen"
  ],
  [
    "die Heirat",
    "marriage",
    "Familie & Menschen"
  ],
  [
    "der Kontrast",
    "contrast",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Pilz",
    "mushroom",
    "Zuhause & Wohnen"
  ],
  [
    "der Profit",
    "profit",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Registrierung",
    "registration",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Spa",
    "spa",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Statue",
    "statue",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Unruhe",
    "unrest",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Verleger",
    "publisher",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Abkürzung",
    "abbreviation",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Anstrengung",
    "effort",
    "Grundlagen & Kommunikation"
  ],
  [
    "das Atelier",
    "studio",
    "Grundlagen & Kommunikation"
  ],
  [
    "der Betrüger",
    "swindler",
    "Grundlagen & Kommunikation"
  ],
  [
    "die Cap",
    "cap",
    "Grundlagen & Kommunikation"
  ],
  [
    "gelten",
    "to be valid",
    "Verben"
  ],
  [
    "stimmen",
    "to be correct",
    "Verben"
  ],
  [
    "schaffen",
    "to create",
    "Verben"
  ],
  [
    "handeln",
    "to act",
    "Verben"
  ],
  [
    "gefallen",
    "to please",
    "Verben"
  ],
  [
    "reichen",
    "to be enough",
    "Verben"
  ],
  [
    "bieten",
    "to offer",
    "Verben"
  ],
  [
    "verlassen",
    "to leave",
    "Verben"
  ],
  [
    "bezeichnen",
    "to describe",
    "Verben"
  ],
  [
    "erfahren",
    "to experience",
    "Verben"
  ],
  [
    "befinden",
    "to be located",
    "Verben"
  ],
  [
    "verletzen",
    "to injure",
    "Verben"
  ],
  [
    "sterben",
    "to die",
    "Verben"
  ],
  [
    "aufnehmen",
    "to record",
    "Verben"
  ],
  [
    "beschäftigen",
    "to employ",
    "Verben"
  ],
  [
    "leisten",
    "to achieve",
    "Verben"
  ],
  [
    "enthalten",
    "to contain",
    "Verben"
  ],
  [
    "einsetzen",
    "to insert",
    "Verben"
  ],
  [
    "erfolgen",
    "to take place",
    "Verben"
  ],
  [
    "erscheinen",
    "to appear",
    "Verben"
  ],
  [
    "betragen",
    "to amount to",
    "Verben"
  ],
  [
    "übernehmen",
    "to take over",
    "Verben"
  ],
  [
    "treten",
    "to step",
    "Verben"
  ],
  [
    "leiden",
    "to suffer",
    "Verben"
  ],
  [
    "eröffnen",
    "to open (a business",
    "Verben"
  ],
  [
    "besitzen",
    "to own",
    "Verben"
  ],
  [
    "entsprechen",
    "to correspond to",
    "Verben"
  ],
  [
    "stecken",
    "to stick",
    "Verben"
  ],
  [
    "erleben",
    "to experience",
    "Verben"
  ],
  [
    "überraschen",
    "to surprise",
    "Verben"
  ],
  [
    "dienen",
    "to serve",
    "Verben"
  ],
  [
    "behalten",
    "to keep",
    "Verben"
  ],
  [
    "erfüllen",
    "to fulfill",
    "Verben"
  ],
  [
    "töten",
    "to kill",
    "Verben"
  ],
  [
    "retten",
    "to save",
    "Verben"
  ],
  [
    "erhöhen",
    "to increase",
    "Verben"
  ],
  [
    "betreffen",
    "to concern",
    "Verben"
  ],
  [
    "lohnen",
    "to be worth it",
    "Verben"
  ],
  [
    "sorgen",
    "to worry",
    "Verben"
  ],
  [
    "stammen",
    "to originate from",
    "Verben"
  ],
  [
    "darstellen",
    "to represent",
    "Verben"
  ],
  [
    "präsentieren",
    "to present",
    "Verben"
  ],
  [
    "verfolgen",
    "to pursue",
    "Verben"
  ],
  [
    "weisen",
    "to point",
    "Verben"
  ],
  [
    "verbreiten",
    "to spread",
    "Verben"
  ],
  [
    "auszeichnen",
    "to distinguish",
    "Verben"
  ],
  [
    "hassen",
    "to hate",
    "Verben"
  ],
  [
    "kümmern",
    "to care",
    "Verben"
  ],
  [
    "überlegen",
    "to consider",
    "Verben"
  ],
  [
    "begeistern",
    "to inspire",
    "Verben"
  ],
  [
    "herstellen",
    "to produce",
    "Verben"
  ],
  [
    "behaupten",
    "to claim",
    "Verben"
  ],
  [
    "erstellen",
    "to create",
    "Verben"
  ],
  [
    "trennen",
    "to separate",
    "Verben"
  ],
  [
    "verheiraten",
    "to marry",
    "Verben"
  ],
  [
    "verpassen",
    "to miss (a train",
    "Verben"
  ],
  [
    "aufbauen",
    "to build up",
    "Verben"
  ],
  [
    "benötigen",
    "to need",
    "Verben"
  ],
  [
    "vergeben",
    "to forgive",
    "Verben"
  ],
  [
    "beschließen",
    "to decide",
    "Verben"
  ],
  [
    "produzieren",
    "to produce",
    "Verben"
  ],
  [
    "umfassen",
    "to comprise",
    "Verben"
  ],
  [
    "aufstellen",
    "to set up",
    "Verben"
  ],
  [
    "einführen",
    "to introduce",
    "Verben"
  ],
  [
    "existieren",
    "to exist",
    "Verben"
  ],
  [
    "sichern",
    "to secure",
    "Verben"
  ],
  [
    "verschwinden",
    "to disappear",
    "Verben"
  ],
  [
    "besetzen",
    "to occupy",
    "Verben"
  ],
  [
    "enttäuschen",
    "to disappoint",
    "Verben"
  ],
  [
    "greifen",
    "to grasp",
    "Verben"
  ],
  [
    "beantworten",
    "to answer",
    "Verben"
  ],
  [
    "zwingen",
    "to force",
    "Verben"
  ],
  [
    "klappen",
    "to work out",
    "Verben"
  ],
  [
    "einrichten",
    "to furnish",
    "Verben"
  ],
  [
    "sperren",
    "to block",
    "Verben"
  ],
  [
    "nachdenken",
    "to think about",
    "Verben"
  ],
  [
    "schweigen",
    "to be silent",
    "Verben"
  ],
  [
    "treiben",
    "to drive",
    "Verben"
  ],
  [
    "erledigen",
    "to complete",
    "Verben"
  ],
  [
    "fassen",
    "to grasp",
    "Verben"
  ],
  [
    "spenden",
    "to donate",
    "Verben"
  ],
  [
    "unterhalten",
    "to entertain",
    "Verben"
  ],
  [
    "verstärken",
    "to strengthen",
    "Verben"
  ],
  [
    "erheben",
    "to raise",
    "Verben"
  ],
  [
    "erweitern",
    "to expand",
    "Verben"
  ],
  [
    "fördern",
    "to promote",
    "Verben"
  ],
  [
    "garantieren",
    "to guarantee",
    "Verben"
  ],
  [
    "gewöhnen",
    "to get used to",
    "Verben"
  ],
  [
    "richten",
    "to direct",
    "Verben"
  ],
  [
    "betonen",
    "to emphasize",
    "Verben"
  ],
  [
    "umgehen",
    "to deal with",
    "Verben"
  ],
  [
    "übersetzen",
    "to translate",
    "Verben"
  ],
  [
    "bestimmen",
    "to determine",
    "Verben"
  ],
  [
    "erwischen",
    "to catch",
    "Verben"
  ],
  [
    "spüren",
    "to feel",
    "Verben"
  ],
  [
    "übergeben",
    "to hand over",
    "Verben"
  ],
  [
    "angehen",
    "to concern",
    "Verben"
  ],
  [
    "filmen",
    "to film",
    "Verben"
  ],
  [
    "angreifen",
    "to attack",
    "Verben"
  ],
  [
    "schießen",
    "to shoot",
    "Verben"
  ],
  [
    "verlieben",
    "to fall in love",
    "Verben"
  ],
  [
    "wenden",
    "to turn",
    "Verben"
  ],
  [
    "abgeben",
    "to hand in",
    "Verben"
  ],
  [
    "definieren",
    "to define",
    "Verben"
  ],
  [
    "ergänzen",
    "to complete",
    "Verben"
  ],
  [
    "vorkommen",
    "to occur",
    "Verben"
  ],
  [
    "überleben",
    "to survive",
    "Verben"
  ],
  [
    "siegen",
    "to win",
    "Verben"
  ],
  [
    "ansprechen",
    "to address",
    "Verben"
  ],
  [
    "anzeigen",
    "to display",
    "Verben"
  ],
  [
    "erzeugen",
    "to produce",
    "Verben"
  ],
  [
    "landen",
    "to land",
    "Verben"
  ],
  [
    "auffallen",
    "to stand out",
    "Verben"
  ],
  [
    "aufheben",
    "to pick up",
    "Verben"
  ],
  [
    "ausführen",
    "to execute",
    "Verben"
  ],
  [
    "beeinflussen",
    "to influence",
    "Verben"
  ],
  [
    "begrenzen",
    "to limit",
    "Verben"
  ],
  [
    "empfangen",
    "to receive",
    "Verben"
  ],
  [
    "konzentrieren",
    "to concentrate",
    "Verben"
  ],
  [
    "bergen",
    "to rescue",
    "Verben"
  ],
  [
    "investieren",
    "to invest",
    "Verben"
  ],
  [
    "verlängern",
    "to extend",
    "Verben"
  ],
  [
    "äußern",
    "to express",
    "Verben"
  ],
  [
    "finanzieren",
    "to finance",
    "Verben"
  ],
  [
    "kontrollieren",
    "to control",
    "Verben"
  ],
  [
    "vermitteln",
    "to mediate",
    "Verben"
  ],
  [
    "anerkennen",
    "to recognize",
    "Verben"
  ],
  [
    "beachten",
    "to observe",
    "Verben"
  ],
  [
    "festlegen",
    "to determine",
    "Verben"
  ],
  [
    "leiten",
    "to lead",
    "Verben"
  ],
  [
    "senden",
    "to send",
    "Verben"
  ],
  [
    "wetten",
    "to bet",
    "Verben"
  ],
  [
    "klagen",
    "to complain",
    "Verben"
  ],
  [
    "eingehen",
    "to enter",
    "Verben"
  ],
  [
    "verlegen",
    "to misplace",
    "Verben"
  ],
  [
    "berühren",
    "to touch",
    "Verben"
  ],
  [
    "besorgen",
    "to get",
    "Verben"
  ],
  [
    "zielen",
    "to aim",
    "Verben"
  ],
  [
    "nahen",
    "to approach",
    "Verben"
  ],
  [
    "erfinden",
    "to invent",
    "Verben"
  ],
  [
    "zulassen",
    "to allow",
    "Verben"
  ],
  [
    "auslösen",
    "to trigger",
    "Verben"
  ],
  [
    "stehlen",
    "to steal",
    "Verben"
  ],
  [
    "übersehen",
    "to overlook",
    "Verben"
  ],
  [
    "aufführen",
    "to perform",
    "Verben"
  ],
  [
    "binden",
    "to tie",
    "Verben"
  ],
  [
    "aufregen",
    "to excite",
    "Verben"
  ],
  [
    "ausbilden",
    "to train",
    "Verben"
  ],
  [
    "bestrafen",
    "to punish",
    "Verben"
  ],
  [
    "umgeben",
    "to surround",
    "Verben"
  ],
  [
    "versorgen",
    "to provide",
    "Verben"
  ],
  [
    "abnehmen",
    "to decrease",
    "Verben"
  ],
  [
    "betreten",
    "to enter",
    "Verben"
  ],
  [
    "schreien",
    "to scream",
    "Verben"
  ],
  [
    "begegnen",
    "to meet",
    "Verben"
  ],
  [
    "formulieren",
    "to formulate",
    "Verben"
  ],
  [
    "unterbringen",
    "to accommodate",
    "Verben"
  ],
  [
    "bewerben",
    "to apply (for a job",
    "Verben"
  ],
  [
    "engagieren",
    "to engage",
    "Verben"
  ],
  [
    "gebrauchen",
    "to use",
    "Verben"
  ],
  [
    "hinweisen",
    "to point out",
    "Verben"
  ],
  [
    "bekämpfen",
    "to fight",
    "Verben"
  ],
  [
    "berechnen",
    "to calculate",
    "Verben"
  ],
  [
    "blicken",
    "to look",
    "Verben"
  ],
  [
    "ignorieren",
    "to ignore",
    "Verben"
  ],
  [
    "kehren",
    "to sweep",
    "Verben"
  ],
  [
    "verlaufen",
    "to get lost",
    "Verben"
  ],
  [
    "anstellen",
    "to queue",
    "Verben"
  ],
  [
    "ausprobieren",
    "to try out",
    "Verben"
  ],
  [
    "beleidigen",
    "to insult",
    "Verben"
  ],
  [
    "fürchten",
    "to fear",
    "Verben"
  ],
  [
    "installieren",
    "to install",
    "Verben"
  ],
  [
    "kreisen",
    "to circle",
    "Verben"
  ],
  [
    "leeren",
    "to empty",
    "Verben"
  ],
  [
    "texten",
    "to text",
    "Verben"
  ],
  [
    "abwarten",
    "to wait",
    "Verben"
  ],
  [
    "anschließen",
    "to connect",
    "Verben"
  ],
  [
    "bevorzugen",
    "to prefer",
    "Verben"
  ],
  [
    "festhalten",
    "to hold on",
    "Verben"
  ],
  [
    "fließen",
    "to flow",
    "Verben"
  ],
  [
    "heben",
    "to lift",
    "Verben"
  ],
  [
    "nerven",
    "to annoy",
    "Verben"
  ],
  [
    "steigern",
    "to increase",
    "Verben"
  ],
  [
    "stoßen",
    "to push",
    "Verben"
  ],
  [
    "streichen",
    "to paint",
    "Verben"
  ],
  [
    "wehren",
    "to defend oneself",
    "Verben"
  ],
  [
    "aufwachsen",
    "to grow up",
    "Verben"
  ],
  [
    "bedecken",
    "to cover",
    "Verben"
  ],
  [
    "schieben",
    "to push",
    "Verben"
  ],
  [
    "wundern",
    "to wonder",
    "Verben"
  ],
  [
    "trauen",
    "to trust",
    "Verben"
  ],
  [
    "aufhalten",
    "to stop",
    "Verben"
  ],
  [
    "realisieren",
    "to realize",
    "Verben"
  ],
  [
    "verabschieden",
    "to say goodbye",
    "Verben"
  ],
  [
    "zurückkehren",
    "to return",
    "Verben"
  ],
  [
    "befassen",
    "to deal with",
    "Verben"
  ],
  [
    "blasen",
    "to blow",
    "Verben"
  ],
  [
    "genügen",
    "to suffice",
    "Verben"
  ],
  [
    "pflegen",
    "to care for",
    "Verben"
  ],
  [
    "senken",
    "to lower",
    "Verben"
  ],
  [
    "veranstalten",
    "to organize",
    "Verben"
  ],
  [
    "versagen",
    "to fail",
    "Verben"
  ],
  [
    "versichern",
    "to assure",
    "Verben"
  ],
  [
    "ausrichten",
    "to align",
    "Verben"
  ],
  [
    "beruhigen",
    "to calm",
    "Verben"
  ],
  [
    "eintragen",
    "to enter",
    "Verben"
  ],
  [
    "mitbekommen",
    "to notice",
    "Verben"
  ],
  [
    "einbauen",
    "to install",
    "Verben"
  ],
  [
    "fliehen",
    "to flee",
    "Verben"
  ],
  [
    "tauchen",
    "to dive",
    "Verben"
  ],
  [
    "abbrechen",
    "to break off",
    "Verben"
  ],
  [
    "begreifen",
    "to grasp",
    "Verben"
  ],
  [
    "benennen",
    "to name",
    "Verben"
  ],
  [
    "erben",
    "to inherit",
    "Verben"
  ],
  [
    "verarbeiten",
    "to process",
    "Verben"
  ],
  [
    "einfallen",
    "to come to mind",
    "Verben"
  ],
  [
    "lehren",
    "to teach",
    "Verben"
  ],
  [
    "mitteilen",
    "to inform",
    "Verben"
  ],
  [
    "stürzen",
    "to fall",
    "Verben"
  ],
  [
    "übertreiben",
    "to exaggerate",
    "Verben"
  ],
  [
    "begraben",
    "to bury",
    "Verben"
  ],
  [
    "blockieren",
    "to block",
    "Verben"
  ],
  [
    "hinzufügen",
    "to add",
    "Verben"
  ],
  [
    "orientieren",
    "to orient",
    "Verben"
  ],
  [
    "zukommen",
    "to approach",
    "Verben"
  ],
  [
    "demonstrieren",
    "to demonstrate",
    "Verben"
  ],
  [
    "lehnen",
    "to lean",
    "Verben"
  ],
  [
    "vergehen",
    "to pass",
    "Verben"
  ],
  [
    "werben",
    "to advertise",
    "Verben"
  ],
  [
    "ausstellen",
    "to exhibit",
    "Verben"
  ],
  [
    "beherrschen",
    "to master",
    "Verben"
  ],
  [
    "locken",
    "to lure",
    "Verben"
  ],
  [
    "abstimmen",
    "to vote",
    "Verben"
  ],
  [
    "auftauchen",
    "to emerge",
    "Verben"
  ],
  [
    "beschweren",
    "to complain",
    "Verben"
  ],
  [
    "besiegen",
    "to defeat",
    "Verben"
  ],
  [
    "jagen",
    "to hunt",
    "Verben"
  ],
  [
    "kotzen",
    "to vomit",
    "Verben"
  ],
  [
    "schalten",
    "to switch",
    "Verben"
  ],
  [
    "zusammenstellen",
    "to compile",
    "Verben"
  ],
  [
    "aufrufen",
    "to call up",
    "Verben"
  ],
  [
    "deuten",
    "to interpret",
    "Verben"
  ],
  [
    "einnehmen",
    "to take",
    "Verben"
  ],
  [
    "gestatten",
    "to allow",
    "Verben"
  ],
  [
    "verbrennen",
    "to burn",
    "Verben"
  ],
  [
    "anwenden",
    "to apply",
    "Verben"
  ],
  [
    "auffordern",
    "to request",
    "Verben"
  ],
  [
    "ausfallen",
    "to be cancelled",
    "Verben"
  ],
  [
    "befürchten",
    "to fear",
    "Verben"
  ],
  [
    "eignen",
    "to be suitable",
    "Verben"
  ],
  [
    "regieren",
    "to govern",
    "Verben"
  ],
  [
    "befördern",
    "to transport",
    "Verben"
  ],
  [
    "erneuern",
    "to renew",
    "Verben"
  ],
  [
    "fortsetzen",
    "to continue",
    "Verben"
  ],
  [
    "hauen",
    "to hit",
    "Verben"
  ],
  [
    "stillen",
    "to breastfeed",
    "Verben"
  ],
  [
    "entnehmen",
    "to take out",
    "Verben"
  ],
  [
    "speichern",
    "to save",
    "Verben"
  ],
  [
    "lagern",
    "to store",
    "Verben"
  ],
  [
    "eintreten",
    "to enter",
    "Verben"
  ],
  [
    "kommunizieren",
    "to communicate",
    "Verben"
  ],
  [
    "zusehen",
    "to watch",
    "Verben"
  ],
  [
    "aktivieren",
    "to activate",
    "Verben"
  ],
  [
    "befestigen",
    "to fasten",
    "Verben"
  ],
  [
    "einhalten",
    "to comply with",
    "Verben"
  ],
  [
    "schämen",
    "to be ashamed",
    "Verben"
  ],
  [
    "abbauen",
    "to dismantle",
    "Verben"
  ],
  [
    "drängen",
    "to urge",
    "Verben"
  ],
  [
    "transportieren",
    "to transport",
    "Verben"
  ],
  [
    "belohnen",
    "to reward",
    "Verben"
  ],
  [
    "entkommen",
    "to escape",
    "Verben"
  ],
  [
    "ernähren",
    "to feed",
    "Verben"
  ],
  [
    "heilen",
    "to heal",
    "Verben"
  ],
  [
    "inspirieren",
    "to inspire",
    "Verben"
  ],
  [
    "publizieren",
    "to publish",
    "Verben"
  ],
  [
    "vorwerfen",
    "to accuse",
    "Verben"
  ],
  [
    "austauschen",
    "to exchange",
    "Verben"
  ],
  [
    "ausschließen",
    "to exclude",
    "Verben"
  ],
  [
    "herausfinden",
    "to find out",
    "Verben"
  ],
  [
    "kombinieren",
    "to combine",
    "Verben"
  ],
  [
    "lenken",
    "to steer",
    "Verben"
  ],
  [
    "überholen",
    "to overtake",
    "Verben"
  ],
  [
    "aushalten",
    "to endure",
    "Verben"
  ],
  [
    "nützen",
    "to be useful",
    "Verben"
  ],
  [
    "ruhen",
    "to rest",
    "Verben"
  ],
  [
    "spezialisieren",
    "to specialize",
    "Verben"
  ],
  [
    "verringern",
    "to reduce",
    "Verben"
  ],
  [
    "abreißen",
    "to tear off",
    "Verben"
  ],
  [
    "einschließen",
    "to include",
    "Verben"
  ],
  [
    "spiegeln",
    "to reflect",
    "Verben"
  ],
  [
    "verschließen",
    "to lock",
    "Verben"
  ],
  [
    "abhalten",
    "to hold",
    "Verben"
  ],
  [
    "einbringen",
    "to bring in",
    "Verben"
  ],
  [
    "umbringen",
    "to kill",
    "Verben"
  ],
  [
    "verwechseln",
    "to confuse",
    "Verben"
  ],
  [
    "freigeben",
    "to release",
    "Verben"
  ],
  [
    "stützen",
    "to support",
    "Verben"
  ],
  [
    "abbilden",
    "to depict",
    "Verben"
  ],
  [
    "abschneiden",
    "to cut off",
    "Verben"
  ],
  [
    "aufteilen",
    "to divide",
    "Verben"
  ],
  [
    "beibringen",
    "to teach",
    "Verben"
  ],
  [
    "lecken",
    "to lick",
    "Verben"
  ],
  [
    "abschalten",
    "to switch off",
    "Verben"
  ],
  [
    "basteln",
    "to craft",
    "Verben"
  ],
  [
    "heulen",
    "to howl",
    "Verben"
  ],
  [
    "spritzen",
    "to spray",
    "Verben"
  ],
  [
    "ablegen",
    "to put down",
    "Verben"
  ],
  [
    "ausdenken",
    "to invent",
    "Verben"
  ],
  [
    "faszinieren",
    "to fascinate",
    "Verben"
  ],
  [
    "flüchten",
    "to flee",
    "Verben"
  ],
  [
    "gleichen",
    "to resemble",
    "Verben"
  ],
  [
    "hingehen",
    "to go there",
    "Verben"
  ],
  [
    "vergrößern",
    "to enlarge",
    "Verben"
  ],
  [
    "verschicken",
    "to send",
    "Verben"
  ],
  [
    "zweifeln",
    "to doubt",
    "Verben"
  ],
  [
    "ablaufen",
    "to expire",
    "Verben"
  ],
  [
    "aufbewahren",
    "to store",
    "Verben"
  ],
  [
    "beleuchten",
    "to illuminate",
    "Verben"
  ],
  [
    "nachlesen",
    "to look up",
    "Verben"
  ],
  [
    "platzieren",
    "to place",
    "Verben"
  ],
  [
    "versammeln",
    "to gather",
    "Verben"
  ],
  [
    "blättern",
    "to leaf through",
    "Verben"
  ],
  [
    "saufen",
    "to drink",
    "Verben"
  ],
  [
    "verderben",
    "to spoil",
    "Verben"
  ],
  [
    "erziehen",
    "to educate",
    "Verben"
  ],
  [
    "kassieren",
    "to collect",
    "Verben"
  ],
  [
    "reinigen",
    "to clean",
    "Verben"
  ],
  [
    "schlucken",
    "to swallow",
    "Verben"
  ],
  [
    "stinken",
    "to stink",
    "Verben"
  ],
  [
    "umbauen",
    "to rebuild",
    "Verben"
  ],
  [
    "auflegen",
    "to hang up",
    "Verben"
  ],
  [
    "loben",
    "to praise",
    "Verben"
  ],
  [
    "räumen",
    "to clear",
    "Verben"
  ],
  [
    "segeln",
    "to sail",
    "Verben"
  ],
  [
    "zunehmen",
    "to increase",
    "Verben"
  ],
  [
    "abhängen",
    "to depend on",
    "Verben"
  ],
  [
    "argumentieren",
    "to argue",
    "Verben"
  ],
  [
    "eintreffen",
    "to arrive",
    "Verben"
  ],
  [
    "steuern",
    "to steer",
    "Verben"
  ],
  [
    "kühlen",
    "to cool",
    "Verben"
  ],
  [
    "nachfragen",
    "to inquire",
    "Verben"
  ],
  [
    "nähern",
    "to approach",
    "Verben"
  ],
  [
    "schütteln",
    "to shake",
    "Verben"
  ],
  [
    "ausreichen",
    "to be sufficient",
    "Verben"
  ],
  [
    "bedauern",
    "to regret",
    "Verben"
  ],
  [
    "riskieren",
    "to risk",
    "Verben"
  ],
  [
    "zittern",
    "to tremble",
    "Verben"
  ],
  [
    "ablösen",
    "to detach",
    "Verben"
  ],
  [
    "beschleunigen",
    "to accelerate",
    "Verben"
  ],
  [
    "erholen",
    "to recover",
    "Verben"
  ],
  [
    "explodieren",
    "to explode",
    "Verben"
  ],
  [
    "hacken",
    "to chop",
    "Verben"
  ],
  [
    "hochladen",
    "to upload",
    "Verben"
  ],
  [
    "kippen",
    "to tip",
    "Verben"
  ],
  [
    "rühren",
    "to stir",
    "Verben"
  ],
  [
    "verwalten",
    "to manage",
    "Verben"
  ],
  [
    "aufklären",
    "to clarify",
    "Verben"
  ],
  [
    "erlernen",
    "to learn",
    "Verben"
  ],
  [
    "mithalten",
    "to keep up (with)",
    "Verben"
  ],
  [
    "operieren",
    "to operate",
    "Verben"
  ],
  [
    "protestieren",
    "to protest",
    "Verben"
  ],
  [
    "staunen",
    "to be amazed",
    "Verben"
  ],
  [
    "verdoppeln",
    "to double",
    "Verben"
  ],
  [
    "ausweichen",
    "to avoid",
    "Verben"
  ],
  [
    "bewundern",
    "to admire",
    "Verben"
  ],
  [
    "checken",
    "to check",
    "Verben"
  ],
  [
    "erfreuen",
    "to please",
    "Verben"
  ],
  [
    "knacken",
    "to crack",
    "Verben"
  ],
  [
    "notieren",
    "to note down",
    "Verben"
  ],
  [
    "sortieren",
    "to sort",
    "Verben"
  ],
  [
    "verschenken",
    "to give away",
    "Verben"
  ],
  [
    "zurückgehen",
    "to go back",
    "Verben"
  ],
  [
    "anrichten",
    "to cause",
    "Verben"
  ],
  [
    "durchgehen",
    "to go through",
    "Verben"
  ],
  [
    "hindern",
    "to hinder",
    "Verben"
  ],
  [
    "kapieren",
    "to get it",
    "Verben"
  ],
  [
    "meistern",
    "to master",
    "Verben"
  ],
  [
    "platzen",
    "to burst",
    "Verben"
  ],
  [
    "täuschen",
    "to deceive",
    "Verben"
  ],
  [
    "vereinfachen",
    "to simplify",
    "Verben"
  ],
  [
    "wegnehmen",
    "to take away",
    "Verben"
  ],
  [
    "abdecken",
    "to cover",
    "Verben"
  ],
  [
    "abstellen",
    "to turn off",
    "Verben"
  ],
  [
    "fertigstellen",
    "to complete",
    "Verben"
  ],
  [
    "kürzen",
    "to shorten",
    "Verben"
  ],
  [
    "verpacken",
    "to pack",
    "Verben"
  ],
  [
    "weitergeben",
    "to pass on",
    "Verben"
  ],
  [
    "einlegen",
    "to insert",
    "Verben"
  ],
  [
    "moderieren",
    "to moderate",
    "Verben"
  ],
  [
    "stürmen",
    "to storm",
    "Verben"
  ],
  [
    "vermieten",
    "to rent out",
    "Verben"
  ],
  [
    "verärgern",
    "to annoy",
    "Verben"
  ],
  [
    "ähneln",
    "to resemble",
    "Verben"
  ],
  [
    "durchziehen",
    "to pull through",
    "Verben"
  ],
  [
    "einsperren",
    "to lock up",
    "Verben"
  ],
  [
    "erkunden",
    "to explore",
    "Verben"
  ],
  [
    "montieren",
    "to assemble",
    "Verben"
  ],
  [
    "zulegen",
    "to gain",
    "Verben"
  ],
  [
    "ablenken",
    "to distract",
    "Verben"
  ],
  [
    "einfügen",
    "to insert",
    "Verben"
  ],
  [
    "ernten",
    "to harvest",
    "Verben"
  ],
  [
    "erwachen",
    "to awaken",
    "Verben"
  ],
  [
    "nachgehen",
    "to follow up on",
    "Verben"
  ],
  [
    "überfahren",
    "to run over",
    "Verben"
  ],
  [
    "aufsteigen",
    "to ascend",
    "Verben"
  ],
  [
    "erkranken",
    "to fall ill",
    "Verben"
  ],
  [
    "kleiden",
    "to dress",
    "Verben"
  ],
  [
    "jucken",
    "to itch",
    "Verben"
  ],
  [
    "schonen",
    "to spare",
    "Verben"
  ],
  [
    "abgehen",
    "to depart",
    "Verben"
  ],
  [
    "anfahren",
    "to drive up to",
    "Verben"
  ],
  [
    "auslassen",
    "to omit",
    "Verben"
  ],
  [
    "wehen",
    "to blow",
    "Verben"
  ],
  [
    "auflisten",
    "to list",
    "Verben"
  ],
  [
    "flirten",
    "to flirt",
    "Verben"
  ],
  [
    "programmieren",
    "to program",
    "Verben"
  ],
  [
    "saugen",
    "to suck",
    "Verben"
  ],
  [
    "strahlen",
    "to shine",
    "Verben"
  ],
  [
    "zaubern",
    "to conjure",
    "Verben"
  ],
  [
    "zugreifen",
    "to grab",
    "Verben"
  ],
  [
    "anzünden",
    "to light",
    "Verben"
  ],
  [
    "beschützen",
    "to protect",
    "Verben"
  ],
  [
    "einbrechen",
    "to break in",
    "Verben"
  ],
  [
    "marschieren",
    "to march",
    "Verben"
  ],
  [
    "weiterhelfen",
    "to help further",
    "Verben"
  ],
  [
    "anbauen",
    "to cultivate",
    "Verben"
  ],
  [
    "auszahlen",
    "to pay out",
    "Verben"
  ],
  [
    "einschlagen",
    "to strike",
    "Verben"
  ],
  [
    "taufen",
    "to baptize",
    "Verben"
  ],
  [
    "hinbekommen",
    "to manage",
    "Verben"
  ],
  [
    "robben",
    "to crawl",
    "Verben"
  ],
  [
    "weigern",
    "to refuse",
    "Verben"
  ],
  [
    "zuschlagen",
    "to slam",
    "Verben"
  ],
  [
    "bereuen",
    "to regret",
    "Verben"
  ],
  [
    "formen",
    "to form",
    "Verben"
  ],
  [
    "jubeln",
    "to cheer",
    "Verben"
  ],
  [
    "tönen",
    "to sound",
    "Verben"
  ],
  [
    "vermischen",
    "to mix",
    "Verben"
  ],
  [
    "zusammenhängen",
    "to be connected",
    "Verben"
  ],
  [
    "einteilen",
    "to divide",
    "Verben"
  ],
  [
    "schmücken",
    "to decorate",
    "Verben"
  ],
  [
    "knien",
    "to kneel",
    "Verben"
  ],
  [
    "reiben",
    "to rub",
    "Verben"
  ],
  [
    "schmerzen",
    "to hurt",
    "Verben"
  ],
  [
    "unterteilen",
    "to subdivide",
    "Verben"
  ],
  [
    "verhungern",
    "to starve",
    "Verben"
  ],
  [
    "verständigen",
    "to inform",
    "Verben"
  ],
  [
    "zusagen",
    "to agree",
    "Verben"
  ],
  [
    "auftragen",
    "to apply",
    "Verben"
  ],
  [
    "einholen",
    "to catch up",
    "Verben"
  ],
  [
    "erschrecken",
    "to frighten",
    "Verben"
  ],
  [
    "schulden",
    "to owe",
    "Verben"
  ],
  [
    "loslassen",
    "to let go",
    "Verben"
  ],
  [
    "rutschen",
    "to slide",
    "Verben"
  ],
  [
    "schmunzeln",
    "to smile",
    "Verben"
  ],
  [
    "untergehen",
    "to sink",
    "Verben"
  ],
  [
    "bekanntgeben",
    "to announce",
    "Verben"
  ],
  [
    "bewohnen",
    "to inhabit",
    "Verben"
  ],
  [
    "eingeben",
    "to enter",
    "Verben"
  ],
  [
    "einigen",
    "to agree",
    "Verben"
  ],
  [
    "knüpfen",
    "to tie",
    "Verben"
  ],
  [
    "ablesen",
    "to read off",
    "Verben"
  ],
  [
    "aufdecken",
    "to uncover",
    "Verben"
  ],
  [
    "freilassen",
    "to release",
    "Verben"
  ],
  [
    "nachsehen",
    "to check",
    "Verben"
  ],
  [
    "umrechnen",
    "to convert",
    "Verben"
  ],
  [
    "vorführen",
    "to demonstrate",
    "Verben"
  ],
  [
    "amüsieren",
    "to amuse",
    "Verben"
  ],
  [
    "beugen",
    "to bend",
    "Verben"
  ],
  [
    "optimieren",
    "to optimize",
    "Verben"
  ],
  [
    "verwöhnen",
    "to spoil",
    "Verben"
  ],
  [
    "befolgen",
    "to follow",
    "Verben"
  ],
  [
    "bohren",
    "to drill",
    "Verben"
  ],
  [
    "kreuzen",
    "to cross",
    "Verben"
  ],
  [
    "schleppen",
    "to drag",
    "Verben"
  ],
  [
    "schmelzen",
    "to melt",
    "Verben"
  ],
  [
    "umarmen",
    "to hug",
    "Verben"
  ],
  [
    "anheben",
    "to lift",
    "Verben"
  ],
  [
    "brüllen",
    "to roar",
    "Verben"
  ],
  [
    "durchhalten",
    "to persevere",
    "Verben"
  ],
  [
    "knallen",
    "to bang",
    "Verben"
  ],
  [
    "kratzen",
    "to scratch",
    "Verben"
  ],
  [
    "nachholen",
    "to catch up",
    "Verben"
  ],
  [
    "weiterleiten",
    "to forward",
    "Verben"
  ],
  [
    "zubereiten",
    "to prepare (food)",
    "Verben"
  ],
  [
    "datieren",
    "to date (from",
    "Verben"
  ],
  [
    "fasten",
    "to fast",
    "Verben"
  ],
  [
    "glänzen",
    "to shine",
    "Verben"
  ],
  [
    "pinkeln",
    "to pee",
    "Verben"
  ],
  [
    "streamen",
    "to stream",
    "Verben"
  ],
  [
    "unterstreichen",
    "to underline",
    "Verben"
  ],
  [
    "vergiften",
    "to poison",
    "Verben"
  ],
  [
    "abstürzen",
    "to crash",
    "Verben"
  ],
  [
    "forschen",
    "to research",
    "Verben"
  ],
  [
    "streicheln",
    "to stroke",
    "Verben"
  ],
  [
    "verzieren",
    "to decorate",
    "Verben"
  ],
  [
    "aufbrechen",
    "to break open",
    "Verben"
  ],
  [
    "einstecken",
    "to put in",
    "Verben"
  ],
  [
    "erraten",
    "to guess",
    "Verben"
  ],
  [
    "herunterladen",
    "to download",
    "Verben"
  ],
  [
    "eigen",
    "own",
    "Adjektive & Adverbien"
  ],
  [
    "online",
    "online",
    "Adjektive & Adverbien"
  ],
  [
    "echt",
    "real",
    "Adjektive & Adverbien"
  ],
  [
    "solche",
    "such",
    "Adjektive & Adverbien"
  ],
  [
    "meist",
    "most",
    "Adjektive & Adverbien"
  ],
  [
    "ernst",
    "serious",
    "Adjektive & Adverbien"
  ],
  [
    "einzig",
    "only",
    "Adjektive & Adverbien"
  ],
  [
    "rein",
    "pure",
    "Adjektive & Adverbien"
  ],
  [
    "manch",
    "some",
    "Adjektive & Adverbien"
  ],
  [
    "politisch",
    "political",
    "Adjektive & Adverbien"
  ],
  [
    "solch",
    "such",
    "Adjektive & Adverbien"
  ],
  [
    "europäisch",
    "European",
    "Adjektive & Adverbien"
  ],
  [
    "selten",
    "rarely",
    "Adjektive & Adverbien"
  ],
  [
    "komplett",
    "complete",
    "Adjektive & Adverbien"
  ],
  [
    "einzeln",
    "single",
    "Adjektive & Adverbien"
  ],
  [
    "knapp",
    "scarce",
    "Adjektive & Adverbien"
  ],
  [
    "total",
    "total",
    "Adjektive & Adverbien"
  ],
  [
    "ehrlich",
    "honest",
    "Adjektive & Adverbien"
  ],
  [
    "zahlreich",
    "numerous",
    "Adjektive & Adverbien"
  ],
  [
    "absolut",
    "absolute",
    "Adjektive & Adverbien"
  ],
  [
    "heutig",
    "today's",
    "Adjektive & Adverbien"
  ],
  [
    "gesamt",
    "entire",
    "Adjektive & Adverbien"
  ],
  [
    "international",
    "international",
    "Adjektive & Adverbien"
  ],
  [
    "relativ",
    "relatively",
    "Adjektive & Adverbien"
  ],
  [
    "Schweizer",
    "Swiss",
    "Adjektive & Adverbien"
  ],
  [
    "wahr",
    "true",
    "Adjektive & Adverbien"
  ],
  [
    "sozial",
    "social",
    "Adjektive & Adverbien"
  ],
  [
    "allgemein",
    "general",
    "Adjektive & Adverbien"
  ],
  [
    "extrem",
    "extreme",
    "Adjektive & Adverbien"
  ],
  [
    "tot",
    "dead",
    "Adjektive & Adverbien"
  ],
  [
    "Wiener",
    "Viennese",
    "Adjektive & Adverbien"
  ],
  [
    "notwendig",
    "necessary",
    "Adjektive & Adverbien"
  ],
  [
    "unglaublich",
    "incredible",
    "Adjektive & Adverbien"
  ],
  [
    "einig",
    "united",
    "Adjektive & Adverbien"
  ],
  [
    "extra",
    "extra",
    "Adjektive & Adverbien"
  ],
  [
    "genannt",
    "called",
    "Adjektive & Adverbien"
  ],
  [
    "vergangen",
    "past",
    "Adjektive & Adverbien"
  ],
  [
    "offiziell",
    "official",
    "Adjektive & Adverbien"
  ],
  [
    "technisch",
    "technical",
    "Adjektive & Adverbien"
  ],
  [
    "heilig",
    "holy",
    "Adjektive & Adverbien"
  ],
  [
    "original",
    "original",
    "Adjektive & Adverbien"
  ],
  [
    "real",
    "real",
    "Adjektive & Adverbien"
  ],
  [
    "übrig",
    "left over",
    "Adjektive & Adverbien"
  ],
  [
    "jährlich",
    "annual",
    "Adjektive & Adverbien"
  ],
  [
    "kommend",
    "coming",
    "Adjektive & Adverbien"
  ],
  [
    "tätig",
    "active",
    "Adjektive & Adverbien"
  ],
  [
    "unterschiedlich",
    "different",
    "Adjektive & Adverbien"
  ],
  [
    "zentral",
    "central",
    "Adjektive & Adverbien"
  ],
  [
    "definitiv",
    "definite",
    "Adjektive & Adverbien"
  ],
  [
    "gratis",
    "free",
    "Adjektive & Adverbien"
  ],
  [
    "ober",
    "upper",
    "Adjektive & Adverbien"
  ],
  [
    "witzig",
    "funny",
    "Adjektive & Adverbien"
  ],
  [
    "erforderlich",
    "necessary",
    "Adjektive & Adverbien"
  ],
  [
    "ewig",
    "eternal",
    "Adjektive & Adverbien"
  ],
  [
    "geeignet",
    "suitable",
    "Adjektive & Adverbien"
  ],
  [
    "inner",
    "inner",
    "Adjektive & Adverbien"
  ],
  [
    "zufällig",
    "by chance",
    "Adjektive & Adverbien"
  ],
  [
    "speziell",
    "special",
    "Adjektive & Adverbien"
  ],
  [
    "ausreichend",
    "sufficient",
    "Adjektive & Adverbien"
  ],
  [
    "ernsthaft",
    "serious",
    "Adjektive & Adverbien"
  ],
  [
    "genügend",
    "sufficient",
    "Adjektive & Adverbien"
  ],
  [
    "national",
    "national",
    "Adjektive & Adverbien"
  ],
  [
    "klassisch",
    "classic",
    "Adjektive & Adverbien"
  ],
  [
    "ordentlich",
    "tidy",
    "Adjektive & Adverbien"
  ],
  [
    "locker",
    "loose",
    "Adjektive & Adverbien"
  ],
  [
    "sichtbar",
    "visible",
    "Adjektive & Adverbien"
  ],
  [
    "bayerisch",
    "Bavarian",
    "Adjektive & Adverbien"
  ],
  [
    "dicht",
    "dense",
    "Adjektive & Adverbien"
  ],
  [
    "inklusive",
    "inclusive",
    "Adjektive & Adverbien"
  ],
  [
    "zuständig",
    "responsible",
    "Adjektive & Adverbien"
  ],
  [
    "fett",
    "fat",
    "Adjektive & Adverbien"
  ],
  [
    "herzlich",
    "cordial",
    "Adjektive & Adverbien"
  ],
  [
    "Kölner",
    "Cologne",
    "Adjektive & Adverbien"
  ],
  [
    "parallel",
    "parallel",
    "Adjektive & Adverbien"
  ],
  [
    "katholisch",
    "Catholic",
    "Adjektive & Adverbien"
  ],
  [
    "staatlich",
    "state-owned",
    "Adjektive & Adverbien"
  ],
  [
    "Münchner",
    "Munich",
    "Adjektive & Adverbien"
  ],
  [
    "wirtschaftlich",
    "economic",
    "Adjektive & Adverbien"
  ],
  [
    "übel",
    "nauseous",
    "Adjektive & Adverbien"
  ],
  [
    "lächerlich",
    "ridiculous",
    "Adjektive & Adverbien"
  ],
  [
    "fair",
    "fair",
    "Adjektive & Adverbien"
  ],
  [
    "gering",
    "low",
    "Adjektive & Adverbien"
  ],
  [
    "westlich",
    "western",
    "Adjektive & Adverbien"
  ],
  [
    "menschlich",
    "human",
    "Adjektive & Adverbien"
  ],
  [
    "verrückt",
    "crazy",
    "Adjektive & Adverbien"
  ],
  [
    "lokal",
    "local",
    "Adjektive & Adverbien"
  ],
  [
    "mobil",
    "mobile",
    "Adjektive & Adverbien"
  ],
  [
    "peinlich",
    "embarrassing",
    "Adjektive & Adverbien"
  ],
  [
    "fein",
    "fine",
    "Adjektive & Adverbien"
  ],
  [
    "demokratisch",
    "democratic",
    "Adjektive & Adverbien"
  ],
  [
    "streng",
    "strict",
    "Adjektive & Adverbien"
  ],
  [
    "erstaunlich",
    "astonishing",
    "Adjektive & Adverbien"
  ],
  [
    "finanziell",
    "financial",
    "Adjektive & Adverbien"
  ],
  [
    "intensiv",
    "intensive",
    "Adjektive & Adverbien"
  ],
  [
    "römisch",
    "Roman",
    "Adjektive & Adverbien"
  ],
  [
    "evangelisch",
    "evangelical",
    "Adjektive & Adverbien"
  ],
  [
    "spontan",
    "spontaneous",
    "Adjektive & Adverbien"
  ],
  [
    "verständlich",
    "understandable",
    "Adjektive & Adverbien"
  ],
  [
    "erhältlich",
    "available",
    "Adjektive & Adverbien"
  ],
  [
    "mega",
    "great",
    "Adjektive & Adverbien"
  ],
  [
    "seltsam",
    "strange",
    "Adjektive & Adverbien"
  ],
  [
    "traditionell",
    "traditional",
    "Adjektive & Adverbien"
  ],
  [
    "christlich",
    "Christian",
    "Adjektive & Adverbien"
  ],
  [
    "riesig",
    "huge",
    "Adjektive & Adverbien"
  ],
  [
    "zugänglich",
    "accessible",
    "Adjektive & Adverbien"
  ],
  [
    "weiblich",
    "female",
    "Adjektive & Adverbien"
  ],
  [
    "fern",
    "far",
    "Adjektive & Adverbien"
  ],
  [
    "heil",
    "whole",
    "Adjektive & Adverbien"
  ],
  [
    "blind",
    "blind",
    "Adjektive & Adverbien"
  ],
  [
    "passend",
    "suitable",
    "Adjektive & Adverbien"
  ],
  [
    "schief",
    "crooked",
    "Adjektive & Adverbien"
  ],
  [
    "städtisch",
    "urban",
    "Adjektive & Adverbien"
  ],
  [
    "hilfreich",
    "helpful",
    "Adjektive & Adverbien"
  ],
  [
    "kulturell",
    "cultural",
    "Adjektive & Adverbien"
  ],
  [
    "restlich",
    "remaining",
    "Adjektive & Adverbien"
  ],
  [
    "geplant",
    "planned",
    "Adjektive & Adverbien"
  ],
  [
    "lebend",
    "living",
    "Adjektive & Adverbien"
  ],
  [
    "regional",
    "regional",
    "Adjektive & Adverbien"
  ],
  [
    "schuldig",
    "guilty",
    "Adjektive & Adverbien"
  ],
  [
    "stehend",
    "standing",
    "Adjektive & Adverbien"
  ],
  [
    "exakt",
    "exact",
    "Adjektive & Adverbien"
  ],
  [
    "schick",
    "chic",
    "Adjektive & Adverbien"
  ],
  [
    "unklar",
    "unclear",
    "Adjektive & Adverbien"
  ],
  [
    "ideal",
    "ideal",
    "Adjektive & Adverbien"
  ],
  [
    "kompliziert",
    "complicated",
    "Adjektive & Adverbien"
  ],
  [
    "örtlich",
    "local",
    "Adjektive & Adverbien"
  ],
  [
    "arabisch",
    "Arabic",
    "Adjektive & Adverbien"
  ],
  [
    "berühmt",
    "famous",
    "Adjektive & Adverbien"
  ],
  [
    "kräftig",
    "strong",
    "Adjektive & Adverbien"
  ],
  [
    "männlich",
    "male",
    "Adjektive & Adverbien"
  ],
  [
    "niedrig",
    "low",
    "Adjektive & Adverbien"
  ],
  [
    "kurzfristig",
    "short-term",
    "Adjektive & Adverbien"
  ],
  [
    "mächtig",
    "powerful",
    "Adjektive & Adverbien"
  ],
  [
    "stabil",
    "stable",
    "Adjektive & Adverbien"
  ],
  [
    "theoretisch",
    "theoretical",
    "Adjektive & Adverbien"
  ],
  [
    "wahnsinnig",
    "insane",
    "Adjektive & Adverbien"
  ],
  [
    "wütend",
    "furious",
    "Adjektive & Adverbien"
  ],
  [
    "herrlich",
    "wonderful",
    "Adjektive & Adverbien"
  ],
  [
    "solo",
    "solo",
    "Adjektive & Adverbien"
  ],
  [
    "gemein",
    "mean",
    "Adjektive & Adverbien"
  ],
  [
    "genial",
    "brilliant",
    "Adjektive & Adverbien"
  ],
  [
    "matt",
    "dull",
    "Adjektive & Adverbien"
  ],
  [
    "schlau",
    "clever",
    "Adjektive & Adverbien"
  ],
  [
    "schwanger",
    "pregnant",
    "Adjektive & Adverbien"
  ],
  [
    "treu",
    "loyal",
    "Adjektive & Adverbien"
  ],
  [
    "heimlich",
    "secret",
    "Adjektive & Adverbien"
  ],
  [
    "konservativ",
    "conservative",
    "Adjektive & Adverbien"
  ],
  [
    "militärisch",
    "military",
    "Adjektive & Adverbien"
  ],
  [
    "attraktiv",
    "attractive",
    "Adjektive & Adverbien"
  ],
  [
    "elektrisch",
    "electric",
    "Adjektive & Adverbien"
  ],
  [
    "furchtbar",
    "terrible",
    "Adjektive & Adverbien"
  ],
  [
    "gewöhnlich",
    "usual",
    "Adjektive & Adverbien"
  ],
  [
    "illegal",
    "illegal",
    "Adjektive & Adverbien"
  ],
  [
    "islamisch",
    "Islamic",
    "Adjektive & Adverbien"
  ],
  [
    "körperlich",
    "physical",
    "Adjektive & Adverbien"
  ],
  [
    "problemlos",
    "problem-free",
    "Adjektive & Adverbien"
  ],
  [
    "südlich",
    "southern",
    "Adjektive & Adverbien"
  ],
  [
    "Bremer",
    "from Bremen",
    "Adjektive & Adverbien"
  ],
  [
    "friedlich",
    "peaceful",
    "Adjektive & Adverbien"
  ],
  [
    "lebendig",
    "alive",
    "Adjektive & Adverbien"
  ],
  [
    "nördlich",
    "northern",
    "Adjektive & Adverbien"
  ],
  [
    "gelegen",
    "located",
    "Adjektive & Adverbien"
  ],
  [
    "unangenehm",
    "unpleasant",
    "Adjektive & Adverbien"
  ],
  [
    "verzweifelt",
    "desperate",
    "Adjektive & Adverbien"
  ],
  [
    "betrunken",
    "drunk",
    "Adjektive & Adverbien"
  ],
  [
    "flach",
    "flat",
    "Adjektive & Adverbien"
  ],
  [
    "grob",
    "rough",
    "Adjektive & Adverbien"
  ],
  [
    "verbunden",
    "connected",
    "Adjektive & Adverbien"
  ],
  [
    "geheim",
    "secret",
    "Adjektive & Adverbien"
  ],
  [
    "logisch",
    "logical",
    "Adjektive & Adverbien"
  ],
  [
    "nice",
    "nice",
    "Adjektive & Adverbien"
  ],
  [
    "merkwürdig",
    "strange",
    "Adjektive & Adverbien"
  ],
  [
    "Pariser",
    "Parisian",
    "Adjektive & Adverbien"
  ],
  [
    "alternativ",
    "alternative",
    "Adjektive & Adverbien"
  ],
  [
    "anwesend",
    "present",
    "Adjektive & Adverbien"
  ],
  [
    "einheimisch",
    "native",
    "Adjektive & Adverbien"
  ],
  [
    "königlich",
    "royal",
    "Adjektive & Adverbien"
  ],
  [
    "fähig",
    "capable",
    "Adjektive & Adverbien"
  ],
  [
    "intern",
    "internal",
    "Adjektive & Adverbien"
  ],
  [
    "ländlich",
    "rural",
    "Adjektive & Adverbien"
  ],
  [
    "nervös",
    "nervous",
    "Adjektive & Adverbien"
  ],
  [
    "smart",
    "smart",
    "Adjektive & Adverbien"
  ],
  [
    "Stuttgarter",
    "from Stuttgart",
    "Adjektive & Adverbien"
  ],
  [
    "unwahrscheinlich",
    "improbable",
    "Adjektive & Adverbien"
  ],
  [
    "deutschsprachig",
    "German-speaking",
    "Adjektive & Adverbien"
  ],
  [
    "effektiv",
    "effective",
    "Adjektive & Adverbien"
  ],
  [
    "gültig",
    "valid",
    "Adjektive & Adverbien"
  ],
  [
    "legal",
    "legal",
    "Adjektive & Adverbien"
  ],
  [
    "gewählt",
    "elected",
    "Adjektive & Adverbien"
  ],
  [
    "hessisch",
    "Hessian",
    "Adjektive & Adverbien"
  ],
  [
    "identisch",
    "identical",
    "Adjektive & Adverbien"
  ],
  [
    "objektiv",
    "objective",
    "Adjektive & Adverbien"
  ],
  [
    "sinnlos",
    "senseless",
    "Adjektive & Adverbien"
  ],
  [
    "aufrecht",
    "upright",
    "Adjektive & Adverbien"
  ],
  [
    "emotional",
    "emotional",
    "Adjektive & Adverbien"
  ],
  [
    "indirekt",
    "indirect",
    "Adjektive & Adverbien"
  ],
  [
    "kreativ",
    "creative",
    "Adjektive & Adverbien"
  ],
  [
    "professionell",
    "professional",
    "Adjektive & Adverbien"
  ],
  [
    "qualifiziert",
    "qualified",
    "Adjektive & Adverbien"
  ],
  [
    "Dresdner",
    "Dresden",
    "Adjektive & Adverbien"
  ],
  [
    "elektronisch",
    "electronic",
    "Adjektive & Adverbien"
  ],
  [
    "fix",
    "fixed",
    "Adjektive & Adverbien"
  ],
  [
    "künstlich",
    "artificial",
    "Adjektive & Adverbien"
  ],
  [
    "safe",
    "safe",
    "Adjektive & Adverbien"
  ],
  [
    "unheimlich",
    "uncanny",
    "Adjektive & Adverbien"
  ],
  [
    "gründlich",
    "thorough",
    "Adjektive & Adverbien"
  ],
  [
    "hip",
    "hip",
    "Adjektive & Adverbien"
  ],
  [
    "künstlerisch",
    "artistic",
    "Adjektive & Adverbien"
  ],
  [
    "sanft",
    "gentle",
    "Adjektive & Adverbien"
  ],
  [
    "aggressiv",
    "aggressive",
    "Adjektive & Adverbien"
  ],
  [
    "brutal",
    "brutal",
    "Adjektive & Adverbien"
  ],
  [
    "chemisch",
    "chemical",
    "Adjektive & Adverbien"
  ],
  [
    "frühzeitig",
    "early",
    "Adjektive & Adverbien"
  ],
  [
    "problematisch",
    "problematic",
    "Adjektive & Adverbien"
  ],
  [
    "einzel",
    "single",
    "Adjektive & Adverbien"
  ],
  [
    "Nürnberger",
    "from Nuremberg",
    "Adjektive & Adverbien"
  ],
  [
    "Salzburger",
    "from Salzburg",
    "Adjektive & Adverbien"
  ],
  [
    "Düsseldorfer",
    "from Düsseldorf",
    "Adjektive & Adverbien"
  ],
  [
    "kriminell",
    "criminal",
    "Adjektive & Adverbien"
  ],
  [
    "optimal",
    "optimal",
    "Adjektive & Adverbien"
  ],
  [
    "pur",
    "pure",
    "Adjektive & Adverbien"
  ],
  [
    "schwedisch",
    "Swedish",
    "Adjektive & Adverbien"
  ],
  [
    "verwandt",
    "related",
    "Adjektive & Adverbien"
  ],
  [
    "vorder",
    "front",
    "Adjektive & Adverbien"
  ],
  [
    "afrikanisch",
    "African",
    "Adjektive & Adverbien"
  ],
  [
    "feucht",
    "damp",
    "Adjektive & Adverbien"
  ],
  [
    "angegeben",
    "stated",
    "Adjektive & Adverbien"
  ],
  [
    "Londoner",
    "Londoner",
    "Adjektive & Adverbien"
  ],
  [
    "urban",
    "urban",
    "Adjektive & Adverbien"
  ],
  [
    "bescheuert",
    "stupid",
    "Adjektive & Adverbien"
  ],
  [
    "erweitert",
    "extended",
    "Adjektive & Adverbien"
  ],
  [
    "fällig",
    "due",
    "Adjektive & Adverbien"
  ],
  [
    "organisiert",
    "organized",
    "Adjektive & Adverbien"
  ],
  [
    "steigend",
    "rising",
    "Adjektive & Adverbien"
  ],
  [
    "studierend",
    "studying",
    "Adjektive & Adverbien"
  ],
  [
    "unerwartet",
    "unexpected",
    "Adjektive & Adverbien"
  ],
  [
    "verbessert",
    "improved",
    "Adjektive & Adverbien"
  ],
  [
    "behindert",
    "disabled",
    "Adjektive & Adverbien"
  ],
  [
    "erwartet",
    "expected",
    "Adjektive & Adverbien"
  ],
  [
    "erwähnt",
    "mentioned",
    "Adjektive & Adverbien"
  ],
  [
    "human",
    "humane",
    "Adjektive & Adverbien"
  ],
  [
    "lose",
    "loose",
    "Adjektive & Adverbien"
  ],
  [
    "naiv",
    "naive",
    "Adjektive & Adverbien"
  ],
  [
    "netto",
    "net",
    "Adjektive & Adverbien"
  ],
  [
    "unschuldig",
    "innocent",
    "Adjektive & Adverbien"
  ],
  [
    "harmlos",
    "harmless",
    "Adjektive & Adverbien"
  ],
  [
    "niederländisch",
    "Dutch (language",
    "Adjektive & Adverbien"
  ],
  [
    "solide",
    "solid",
    "Adjektive & Adverbien"
  ],
  [
    "verbreitet",
    "widespread",
    "Adjektive & Adverbien"
  ],
  [
    "verändert",
    "changed",
    "Adjektive & Adverbien"
  ],
  [
    "wörtlich",
    "literal",
    "Adjektive & Adverbien"
  ],
  [
    "entfernt",
    "distant",
    "Adjektive & Adverbien"
  ],
  [
    "extern",
    "external",
    "Adjektive & Adverbien"
  ],
  [
    "liebevoll",
    "loving",
    "Adjektive & Adverbien"
  ],
  [
    "mies",
    "lousy",
    "Adjektive & Adverbien"
  ],
  [
    "regulär",
    "regular",
    "Adjektive & Adverbien"
  ],
  [
    "syrisch",
    "Syrian",
    "Adjektive & Adverbien"
  ],
  [
    "ausverkauft",
    "sold out",
    "Adjektive & Adverbien"
  ],
  [
    "erwünscht",
    "desired",
    "Adjektive & Adverbien"
  ],
  [
    "platt",
    "flat",
    "Adjektive & Adverbien"
  ],
  [
    "schwäbisch",
    "Swabian",
    "Adjektive & Adverbien"
  ],
  [
    "asiatisch",
    "Asian",
    "Adjektive & Adverbien"
  ],
  [
    "defekt",
    "defective",
    "Adjektive & Adverbien"
  ],
  [
    "schräg",
    "slanted",
    "Adjektive & Adverbien"
  ],
  [
    "unzufrieden",
    "dissatisfied",
    "Adjektive & Adverbien"
  ],
  [
    "einheitlich",
    "uniform",
    "Adjektive & Adverbien"
  ],
  [
    "gestrig",
    "yesterday's",
    "Adjektive & Adverbien"
  ],
  [
    "schmal",
    "narrow",
    "Adjektive & Adverbien"
  ],
  [
    "schweizerisch",
    "Swiss",
    "Adjektive & Adverbien"
  ],
  [
    "beschrieben",
    "described",
    "Adjektive & Adverbien"
  ],
  [
    "faszinierend",
    "fascinating",
    "Adjektive & Adverbien"
  ],
  [
    "lateinisch",
    "Latin",
    "Adjektive & Adverbien"
  ],
  [
    "muslimisch",
    "Muslim",
    "Adjektive & Adverbien"
  ],
  [
    "nervig",
    "annoying",
    "Adjektive & Adverbien"
  ],
  [
    "seitlich",
    "sideways",
    "Adjektive & Adverbien"
  ],
  [
    "biologisch",
    "biological",
    "Adjektive & Adverbien"
  ],
  [
    "gay",
    "gay",
    "Adjektive & Adverbien"
  ],
  [
    "unfair",
    "unfair",
    "Adjektive & Adverbien"
  ],
  [
    "vorig",
    "previous",
    "Adjektive & Adverbien"
  ],
  [
    "ärgerlich",
    "annoying",
    "Adjektive & Adverbien"
  ],
  [
    "erschienen",
    "appeared",
    "Adjektive & Adverbien"
  ],
  [
    "frech",
    "cheeky",
    "Adjektive & Adverbien"
  ],
  [
    "solar",
    "solar",
    "Adjektive & Adverbien"
  ],
  [
    "steil",
    "steep",
    "Adjektive & Adverbien"
  ],
  [
    "unverständlich",
    "incomprehensible",
    "Adjektive & Adverbien"
  ],
  [
    "verkürzt",
    "shortened",
    "Adjektive & Adverbien"
  ],
  [
    "versteckt",
    "hidden",
    "Adjektive & Adverbien"
  ],
  [
    "bescheiden",
    "modest",
    "Adjektive & Adverbien"
  ],
  [
    "gewünscht",
    "desired",
    "Adjektive & Adverbien"
  ],
  [
    "romantisch",
    "romantic",
    "Adjektive & Adverbien"
  ],
  [
    "verloren",
    "lost",
    "Adjektive & Adverbien"
  ],
  [
    "formal",
    "formal",
    "Adjektive & Adverbien"
  ],
  [
    "offline",
    "offline",
    "Adjektive & Adverbien"
  ],
  [
    "umliegend",
    "surrounding",
    "Adjektive & Adverbien"
  ],
  [
    "ausgezeichnet",
    "excellent",
    "Adjektive & Adverbien"
  ],
  [
    "ekelhaft",
    "disgusting",
    "Adjektive & Adverbien"
  ],
  [
    "outdoor",
    "outdoor",
    "Adjektive & Adverbien"
  ],
  [
    "selbständig",
    "independent",
    "Adjektive & Adverbien"
  ],
  [
    "ärztlich",
    "medical",
    "Adjektive & Adverbien"
  ],
  [
    "empfehlenswert",
    "recommendable",
    "Adjektive & Adverbien"
  ],
  [
    "munter",
    "cheerful",
    "Adjektive & Adverbien"
  ],
  [
    "schmerzhaft",
    "painful",
    "Adjektive & Adverbien"
  ],
  [
    "schüchtern",
    "shy",
    "Adjektive & Adverbien"
  ],
  [
    "geführt",
    "guided",
    "Adjektive & Adverbien"
  ],
  [
    "gegründet",
    "founded",
    "Adjektive & Adverbien"
  ],
  [
    "magisch",
    "magical",
    "Adjektive & Adverbien"
  ],
  [
    "minimal",
    "minimal",
    "Adjektive & Adverbien"
  ],
  [
    "nutzlos",
    "useless",
    "Adjektive & Adverbien"
  ],
  [
    "optimistisch",
    "optimistic",
    "Adjektive & Adverbien"
  ],
  [
    "verdient",
    "deserved",
    "Adjektive & Adverbien"
  ],
  [
    "verkleidet",
    "disguised",
    "Adjektive & Adverbien"
  ],
  [
    "bezahlt",
    "paid",
    "Adjektive & Adverbien"
  ],
  [
    "elegant",
    "elegant",
    "Adjektive & Adverbien"
  ],
  [
    "süddeutsch",
    "Southern German",
    "Adjektive & Adverbien"
  ],
  [
    "telefonisch",
    "by phone",
    "Adjektive & Adverbien"
  ],
  [
    "dänisch",
    "Danish",
    "Adjektive & Adverbien"
  ],
  [
    "gelungen",
    "successful",
    "Adjektive & Adverbien"
  ],
  [
    "neidisch",
    "envious",
    "Adjektive & Adverbien"
  ],
  [
    "begrenzt",
    "limited",
    "Adjektive & Adverbien"
  ],
  [
    "beschleunigt",
    "accelerated",
    "Adjektive & Adverbien"
  ],
  [
    "passiv",
    "passive",
    "Adjektive & Adverbien"
  ],
  [
    "unsichtbar",
    "invisible",
    "Adjektive & Adverbien"
  ],
  [
    "eiskalt",
    "ice-cold",
    "Adjektive & Adverbien"
  ],
  [
    "gruselig",
    "creepy",
    "Adjektive & Adverbien"
  ],
  [
    "hilflos",
    "helpless",
    "Adjektive & Adverbien"
  ],
  [
    "populär",
    "popular",
    "Adjektive & Adverbien"
  ],
  [
    "detailliert",
    "detailed",
    "Adjektive & Adverbien"
  ],
  [
    "ehrenamtlich",
    "voluntary",
    "Adjektive & Adverbien"
  ],
  [
    "feige",
    "cowardly",
    "Adjektive & Adverbien"
  ],
  [
    "simple",
    "simple",
    "Adjektive & Adverbien"
  ],
  [
    "ökologisch",
    "ecological",
    "Adjektive & Adverbien"
  ],
  [
    "albern",
    "silly",
    "Adjektive & Adverbien"
  ],
  [
    "wundervoll",
    "wonderful",
    "Adjektive & Adverbien"
  ],
  [
    "gewonnen",
    "won",
    "Adjektive & Adverbien"
  ],
  [
    "lachend",
    "laughing",
    "Adjektive & Adverbien"
  ],
  [
    "alltäglich",
    "everyday",
    "Adjektive & Adverbien"
  ],
  [
    "schädlich",
    "harmful",
    "Adjektive & Adverbien"
  ],
  [
    "ägyptisch",
    "Egyptian",
    "Adjektive & Adverbien"
  ],
  [
    "brutto",
    "gross",
    "Adjektive & Adverbien"
  ],
  [
    "glänzend",
    "brilliant",
    "Adjektive & Adverbien"
  ],
  [
    "kostenfrei",
    "free of charge",
    "Adjektive & Adverbien"
  ],
  [
    "nutzbar",
    "usable",
    "Adjektive & Adverbien"
  ],
  [
    "gemischt",
    "mixed",
    "Adjektive & Adverbien"
  ],
  [
    "geschützt",
    "protected",
    "Adjektive & Adverbien"
  ],
  [
    "kompetent",
    "competent",
    "Adjektive & Adverbien"
  ],
  [
    "sehenswert",
    "worth seeing",
    "Adjektive & Adverbien"
  ],
  [
    "sweet",
    "sweet",
    "Adjektive & Adverbien"
  ],
  [
    "tragisch",
    "tragic",
    "Adjektive & Adverbien"
  ],
  [
    "alljährlich",
    "annual",
    "Adjektive & Adverbien"
  ],
  [
    "australisch",
    "Australian",
    "Adjektive & Adverbien"
  ],
  [
    "durchgeführt",
    "carried out",
    "Adjektive & Adverbien"
  ],
  [
    "geordnet",
    "ordered",
    "Adjektive & Adverbien"
  ],
  [
    "Potsdamer",
    "Potsdam",
    "Adjektive & Adverbien"
  ],
  [
    "erkrankt",
    "ill",
    "Adjektive & Adverbien"
  ],
  [
    "kompakt",
    "compact",
    "Adjektive & Adverbien"
  ],
  [
    "norddeutsch",
    "North German",
    "Adjektive & Adverbien"
  ],
  [
    "silbern",
    "silver",
    "Adjektive & Adverbien"
  ],
  [
    "simpel",
    "simple",
    "Adjektive & Adverbien"
  ],
  [
    "ungleich",
    "unequal",
    "Adjektive & Adverbien"
  ],
  [
    "ungültig",
    "invalid",
    "Adjektive & Adverbien"
  ],
  [
    "wiederholt",
    "repeated",
    "Adjektive & Adverbien"
  ],
  [
    "zerstört",
    "destroyed",
    "Adjektive & Adverbien"
  ],
  [
    "westdeutsch",
    "West German",
    "Adjektive & Adverbien"
  ],
  [
    "zart",
    "tender",
    "Adjektive & Adverbien"
  ],
  [
    "zugehörig",
    "belonging",
    "Adjektive & Adverbien"
  ],
  [
    "arrogant",
    "arrogant",
    "Adjektive & Adverbien"
  ],
  [
    "blass",
    "pale",
    "Adjektive & Adverbien"
  ],
  [
    "doll",
    "great",
    "Adjektive & Adverbien"
  ],
  [
    "manuell",
    "manual",
    "Adjektive & Adverbien"
  ],
  [
    "rau",
    "rough",
    "Adjektive & Adverbien"
  ],
  [
    "aufgeführt",
    "listed",
    "Adjektive & Adverbien"
  ],
  [
    "belegt",
    "occupied",
    "Adjektive & Adverbien"
  ],
  [
    "gefordert",
    "demanded",
    "Adjektive & Adverbien"
  ],
  [
    "zuversichtlich",
    "confident",
    "Adjektive & Adverbien"
  ],
  [
    "abgeschlossen",
    "closed",
    "Adjektive & Adverbien"
  ],
  [
    "brennend",
    "burning",
    "Adjektive & Adverbien"
  ],
  [
    "enttäuschend",
    "disappointing",
    "Adjektive & Adverbien"
  ],
  [
    "fließend",
    "fluent",
    "Adjektive & Adverbien"
  ],
  [
    "steif",
    "stiff",
    "Adjektive & Adverbien"
  ],
  [
    "amüsant",
    "amusing",
    "Adjektive & Adverbien"
  ],
  [
    "blutig",
    "bloody",
    "Adjektive & Adverbien"
  ],
  [
    "charmant",
    "charming",
    "Adjektive & Adverbien"
  ],
  [
    "gedruckt",
    "printed",
    "Adjektive & Adverbien"
  ],
  [
    "rezeptfrei",
    "over-the-counter",
    "Adjektive & Adverbien"
  ],
  [
    "bergisch",
    "Bergisch",
    "Adjektive & Adverbien"
  ],
  [
    "gewohnt",
    "accustomed",
    "Adjektive & Adverbien"
  ],
  [
    "haltbar",
    "durable",
    "Adjektive & Adverbien"
  ],
  [
    "kanadisch",
    "Canadian",
    "Adjektive & Adverbien"
  ],
  [
    "vorletzt",
    "penultimate",
    "Adjektive & Adverbien"
  ],
  [
    "akut",
    "acute",
    "Adjektive & Adverbien"
  ],
  [
    "iranisch",
    "Iranian",
    "Adjektive & Adverbien"
  ],
  [
    "organisch",
    "organic",
    "Adjektive & Adverbien"
  ],
  [
    "ostdeutsch",
    "East German",
    "Adjektive & Adverbien"
  ],
  [
    "ungeeignet",
    "unsuitable",
    "Adjektive & Adverbien"
  ],
  [
    "winzig",
    "tiny",
    "Adjektive & Adverbien"
  ],
  [
    "alleinerziehend",
    "single-parent",
    "Adjektive & Adverbien"
  ],
  [
    "düster",
    "gloomy",
    "Adjektive & Adverbien"
  ],
  [
    "eifersüchtig",
    "jealous",
    "Adjektive & Adverbien"
  ],
  [
    "flott",
    "quick",
    "Adjektive & Adverbien"
  ],
  [
    "taub",
    "deaf",
    "Adjektive & Adverbien"
  ],
  [
    "nun",
    "now",
    "Adjektive & Adverbien"
  ],
  [
    "wohl",
    "probably",
    "Adjektive & Adverbien"
  ],
  [
    "dazu",
    "in addition",
    "Adjektive & Adverbien"
  ],
  [
    "dafür",
    "for it",
    "Adjektive & Adverbien"
  ],
  [
    "gar",
    "at all",
    "Adjektive & Adverbien"
  ],
  [
    "etwa",
    "about",
    "Adjektive & Adverbien"
  ],
  [
    "davon",
    "of it",
    "Adjektive & Adverbien"
  ],
  [
    "zwar",
    "indeed",
    "Adjektive & Adverbien"
  ],
  [
    "sonst",
    "otherwise",
    "Adjektive & Adverbien"
  ],
  [
    "je",
    "ever",
    "Adjektive & Adverbien"
  ],
  [
    "eben",
    "just",
    "Adjektive & Adverbien"
  ],
  [
    "daher",
    "therefore",
    "Adjektive & Adverbien"
  ],
  [
    "kaum",
    "hardly",
    "Adjektive & Adverbien"
  ],
  [
    "überhaupt",
    "at all",
    "Adjektive & Adverbien"
  ],
  [
    "eher",
    "rather",
    "Adjektive & Adverbien"
  ],
  [
    "damals",
    "at that time",
    "Adjektive & Adverbien"
  ],
  [
    "bisher",
    "so far",
    "Adjektive & Adverbien"
  ],
  [
    "her",
    "hither",
    "Adjektive & Adverbien"
  ],
  [
    "darum",
    "therefore",
    "Adjektive & Adverbien"
  ],
  [
    "insgesamt",
    "overall",
    "Adjektive & Adverbien"
  ],
  [
    "völlig",
    "completely",
    "Adjektive & Adverbien"
  ],
  [
    "irgendwie",
    "somehow",
    "Adjektive & Adverbien"
  ],
  [
    "dagegen",
    "against it",
    "Adjektive & Adverbien"
  ],
  [
    "ebenso",
    "likewise",
    "Adjektive & Adverbien"
  ],
  [
    "tatsächlich",
    "actually",
    "Adjektive & Adverbien"
  ],
  [
    "zumindest",
    "at least",
    "Adjektive & Adverbien"
  ],
  [
    "hinaus",
    "out",
    "Adjektive & Adverbien"
  ],
  [
    "drauf",
    "on it",
    "Adjektive & Adverbien"
  ],
  [
    "dennoch",
    "nevertheless",
    "Adjektive & Adverbien"
  ],
  [
    "darin",
    "therein",
    "Adjektive & Adverbien"
  ],
  [
    "beispielsweise",
    "for example",
    "Adjektive & Adverbien"
  ],
  [
    "mittlerweile",
    "meanwhile",
    "Adjektive & Adverbien"
  ],
  [
    "unbedingt",
    "absolutely",
    "Adjektive & Adverbien"
  ],
  [
    "soweit",
    "as far as",
    "Adjektive & Adverbien"
  ],
  [
    "niemals",
    "never",
    "Adjektive & Adverbien"
  ],
  [
    "vermutlich",
    "presumably",
    "Adjektive & Adverbien"
  ],
  [
    "jedenfalls",
    "in any case",
    "Adjektive & Adverbien"
  ],
  [
    "darunter",
    "among them",
    "Adjektive & Adverbien"
  ],
  [
    "irgendwann",
    "sometime",
    "Adjektive & Adverbien"
  ],
  [
    "erstmals",
    "for the first time",
    "Adjektive & Adverbien"
  ],
  [
    "außerhalb",
    "outside of",
    "Adjektive & Adverbien"
  ],
  [
    "dahin",
    "there",
    "Adjektive & Adverbien"
  ],
  [
    "fort",
    "away",
    "Adjektive & Adverbien"
  ],
  [
    "weltweit",
    "worldwide",
    "Adjektive & Adverbien"
  ],
  [
    "längst",
    "long ago",
    "Adjektive & Adverbien"
  ],
  [
    "möglicherweise",
    "possibly",
    "Adjektive & Adverbien"
  ],
  [
    "sicherlich",
    "certainly",
    "Adjektive & Adverbien"
  ],
  [
    "mitten",
    "in the middle of",
    "Adjektive & Adverbien"
  ],
  [
    "sowieso",
    "anyway",
    "Adjektive & Adverbien"
  ],
  [
    "ansonsten",
    "otherwise",
    "Adjektive & Adverbien"
  ],
  [
    "mehrfach",
    "multiple times",
    "Adjektive & Adverbien"
  ],
  [
    "weshalb",
    "why",
    "Adjektive & Adverbien"
  ],
  [
    "desto",
    "the",
    "Adjektive & Adverbien"
  ],
  [
    "stattdessen",
    "instead",
    "Adjektive & Adverbien"
  ],
  [
    "momentan",
    "currently",
    "Adjektive & Adverbien"
  ],
  [
    "spätestens",
    "at the latest",
    "Adjektive & Adverbien"
  ],
  [
    "voraus",
    "ahead",
    "Adjektive & Adverbien"
  ],
  [
    "womit",
    "with what",
    "Adjektive & Adverbien"
  ],
  [
    "worauf",
    "on what",
    "Adjektive & Adverbien"
  ],
  [
    "anfangs",
    "initially",
    "Adjektive & Adverbien"
  ],
  [
    "eventuell",
    "possibly",
    "Adjektive & Adverbien"
  ],
  [
    "generell",
    "generally",
    "Adjektive & Adverbien"
  ],
  [
    "dahinter",
    "behind it",
    "Adjektive & Adverbien"
  ],
  [
    "drüber",
    "over it",
    "Adjektive & Adverbien"
  ],
  [
    "nochmals",
    "once more",
    "Adjektive & Adverbien"
  ],
  [
    "beinahe",
    "almost",
    "Adjektive & Adverbien"
  ],
  [
    "jederzeit",
    "at any time",
    "Adjektive & Adverbien"
  ],
  [
    "hinterher",
    "afterwards",
    "Adjektive & Adverbien"
  ],
  [
    "rechtzeitig",
    "in time",
    "Adjektive & Adverbien"
  ],
  [
    "hierfür",
    "for this",
    "Adjektive & Adverbien"
  ],
  [
    "demnächst",
    "soon",
    "Adjektive & Adverbien"
  ],
  [
    "oftmals",
    "often",
    "Adjektive & Adverbien"
  ],
  [
    "umsonst",
    "for free",
    "Adjektive & Adverbien"
  ],
  [
    "kürzlich",
    "recently",
    "Adjektive & Adverbien"
  ],
  [
    "irgend",
    "any",
    "Adjektive & Adverbien"
  ],
  [
    "nebenbei",
    "by the way",
    "Adjektive & Adverbien"
  ],
  [
    "soeben",
    "just now",
    "Adjektive & Adverbien"
  ],
  [
    "jahrelang",
    "for years",
    "Adjektive & Adverbien"
  ],
  [
    "vorhin",
    "a moment ago",
    "Adjektive & Adverbien"
  ],
  [
    "just",
    "just",
    "Adjektive & Adverbien"
  ],
  [
    "seither",
    "since then",
    "Adjektive & Adverbien"
  ],
  [
    "aufeinander",
    "on each other",
    "Adjektive & Adverbien"
  ],
  [
    "dazwischen",
    "in between",
    "Adjektive & Adverbien"
  ],
  [
    "neulich",
    "recently",
    "Adjektive & Adverbien"
  ],
  [
    "dauernd",
    "constantly",
    "Adjektive & Adverbien"
  ],
  [
    "woanders",
    "somewhere else",
    "Adjektive & Adverbien"
  ],
  [
    "untereinander",
    "amongst each other",
    "Adjektive & Adverbien"
  ],
  [
    "heran",
    "closer",
    "Adjektive & Adverbien"
  ],
  [
    "nirgends",
    "nowhere",
    "Adjektive & Adverbien"
  ],
  [
    "nirgendwo",
    "nowhere",
    "Adjektive & Adverbien"
  ],
  [
    "herunter",
    "down",
    "Adjektive & Adverbien"
  ],
  [
    "circa",
    "approximately",
    "Adjektive & Adverbien"
  ],
  [
    "zwischendurch",
    "in between",
    "Adjektive & Adverbien"
  ],
  [
    "allmählich",
    "gradually",
    "Adjektive & Adverbien"
  ],
  [
    "durcheinander",
    "confused",
    "Adjektive & Adverbien"
  ],
  [
    "absichtlich",
    "intentionally",
    "Adjektive & Adverbien"
  ],
  [
    "üblicherweise",
    "usually",
    "Adjektive & Adverbien"
  ],
  [
    "hinauf",
    "upwards",
    "Adjektive & Adverbien"
  ],
  [
    "tagsüber",
    "during the day",
    "Adjektive & Adverbien"
  ],
  [
    "glücklicherweise",
    "fortunately",
    "Adjektive & Adverbien"
  ]
];

export const EXTENDED_B1_LEXICON: VocabularyWord[] = EXTENDED_B1_ROWS.map(
  ([german, english, category], index) => ({
    id: `lexicon-b1-${String(index + 1).padStart(4, "0")}`,
    german,
    english,
    category,
    level: "B1",
  }),
);
