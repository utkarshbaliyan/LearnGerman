import type { VocabularyCategory, VocabularyWord } from "@/app/vocabulary/data";

type Section = {
  category: VocabularyCategory;
  rows: string;
};

const SECTIONS: Section[] = [
  {
    category: "Grundlagen & Kommunikation",
    rows: `although|obwohl
however|allerdings
apart from that|abgesehen davon
whether|ob
whereas|hingegen
prior to that|davor
after (conjunction)|nachdem
as soon as|sobald
since then|seitdem
at least|wenigstens
by the way|übrigens
actually|eigentlich
probably|wahrscheinlich
definitely|bestimmt
in any case|auf jeden Fall
on the one hand|einerseits
on the other hand|andererseits
for this reason|aus diesem Grund
in my opinion|meiner Meinung nach
I agree|ich bin einverstanden
I disagree|ich bin nicht einverstanden
it depends|es kommt darauf an
no idea|keine Ahnung
never mind|macht nichts
of course|selbstverständlich`,
  },
  {
    category: "Familie & Menschen",
    rows: `partnership|die Partnerschaft
relative|der/die Verwandte
couple|das Paar
marriage|die Ehe
wedding|die Hochzeit
bride|die Braut
groom|der Bräutigam
childhood|die Kindheit
youth|die Jugend
adult|der/die Erwachsene
generation|die Generation
twins|die Zwillinge
grandson|der Enkel
granddaughter|die Enkelin
stepfather|der Stiefvater
stepmother|die Stiefmutter
single parent|der/die Alleinerziehende
male flatmate|der Mitbewohner
female flatmate|die Mitbewohnerin
acquaintance|der/die Bekannte
contact|der Kontakt
argument|der Streit
trust|das Vertrauen
support|die Unterstützung
separation|die Trennung`,
  },
  {
    category: "Zuhause & Wohnen",
    rows: `rent|die Miete
landlord|der Vermieter
landlady|die Vermieterin
tenant|der Mieter
rental contract|der Mietvertrag
deposit|die Kaution
utility costs|die Nebenkosten
move|der Umzug
shared apartment|die Wohngemeinschaft
floor / storey|das Stockwerk
elevator|der Aufzug
basement|der Keller
attic|der Dachboden
courtyard|der Hof
garage|die Garage
locksmith|der Schlüsseldienst
heating|die Heizung
electricity|der Strom
tap|der Wasserhahn
sink|das Waschbecken
bathtub|die Badewanne
shower|die Dusche
washing machine|die Waschmaschine
dishwasher|die Spülmaschine
vacuum cleaner|der Staubsauger
curtain|der Vorhang
carpet|der Teppich
socket|die Steckdose
repair|die Reparatur
house rules|die Hausordnung`,
  },
  {
    category: "Essen & Trinken",
    rows: `recipe|das Rezept
ingredient|die Zutat
quantity|die Menge
portion|die Portion
dish / meal|das Gericht
starter|die Vorspeise
main course|das Hauptgericht
dessert|die Nachspeise
tip|das Trinkgeld
reservation|die Reservierung
buffet|das Büfett
food allergy|die Lebensmittelallergie
vegetarian|vegetarisch
vegan|vegan
spicy|scharf
bitter|bitter
sour|sauer
ripe|reif
raw|roh
cooked|gekocht
flour|das Mehl
dough|der Teig
cooking oil|das Öl
vinegar|der Essig
spice|das Gewürz
herbs|die Kräuter
beans|die Bohnen
peas|die Erbsen
mushrooms|die Pilze
lettuce|der Kopfsalat`,
  },
  {
    category: "Einkaufen & Kleidung",
    rows: `price tag|das Preisschild
exchange|der Umtausch
return|die Rückgabe
discount|der Rabatt
special offer|das Sonderangebot
shop window|das Schaufenster
shopping centre|das Einkaufszentrum
fitting room|die Umkleidekabine
clothing size|die Größe
brand|die Marke
cotton|die Baumwolle
wool|die Wolle
leather|das Leder
sleeve|der Ärmel
button|der Knopf
zipper|der Reißverschluss
handbag|die Handtasche
wallet|die Geldbörse
change (money)|das Wechselgeld
customer base|die Kundschaft
order|die Bestellung
delivery|die Lieferung
warranty|die Garantie
complaint|die Reklamation
online shop|der Onlineshop`,
  },
  {
    category: "Schule & Lernen",
    rows: `school subject|das Schulfach
grade|die Note
certificate|das Zeugnis
exam|die Prüfung
exam task|die Prüfungsaufgabe
solution|die Lösung
answer sheet|der Antwortbogen
vocabulary list|die Wortliste
worksheet|das Arbeitsblatt
presentation|die Präsentation
lesson|die Unterrichtsstunde
class trip|die Klassenfahrt
timetable|der Stundenplan
school office|das Sekretariat
head teacher|der/die Direktor/in
vocational training|die Ausbildung
apprenticeship position|der Ausbildungsplatz
trainee|der/die Auszubildende
semester|das Semester
course registration|die Kursanmeldung
attendance|die Anwesenheit
correction|die Korrektur
instruction|die Anleitung
learning goal|das Lernziel
certificate of participation|die Teilnahmebescheinigung`,
  },
  {
    category: "Arbeit & Beruf",
    rows: `job advertisement|die Stellenanzeige
application|die Bewerbung
CV / résumé|der Lebenslauf
cover letter|das Anschreiben
job interview|das Vorstellungsgespräch
home office|das Homeoffice
working hours|die Arbeitszeit
shift|die Schicht
salary|das Gehalt
wage|der Lohn
work colleague|der/die Arbeitskollege/in
supervisor|der/die Vorgesetzte
client|der/die Auftraggeber/in
meeting|die Besprechung
responsibility|die Verantwortung
work experience|die Berufserfahrung
qualification|die Qualifikation
professional field|das Berufsfeld
department|die Abteilung
company|das Unternehmen
business trip|die Dienstreise
holiday request|der Urlaubsantrag
sick note|die Krankmeldung
part-time|die Teilzeit
full-time|die Vollzeit
self-employment|die Selbstständigkeit
unemployment|die Arbeitslosigkeit
retirement|die Rente
work contract|der Arbeitsvertrag
probation period|die Probezeit`,
  },
  {
    category: "Stadt & Verkehr",
    rows: `traffic|der Verkehr
intersection|die Kreuzung
traffic light|die Ampel
sidewalk|der Gehweg
cycle path|der Fahrradweg
one-way street|die Einbahnstraße
roundabout|der Kreisverkehr
speed limit|die Geschwindigkeitsbegrenzung
traffic jam|der Stau
traffic accident|der Verkehrsunfall
driving licence|der Führerschein
vehicle|das Fahrzeug
bicycle pump|die Fahrradpumpe
petrol station|die Tankstelle
car park|der Parkplatz
parking ticket|der Parkschein
transport timetable|der Fahrplan
connection|die Verbindung
train cancellation|der Zugausfall
departure board|die Abfahrtstafel
arrival time|die Ankunftszeit
platform|der Bahnsteig
rail network|das Schienennetz
ticket machine|der Fahrkartenautomat
ticket inspector|der Kontrolleur
lost property office|das Fundbüro
town hall|das Rathaus
tourist information|die Touristeninformation
pedestrian zone|die Fußgängerzone
suburb|der Vorort`,
  },
  {
    category: "Reisen & Unterkunft",
    rows: `round trip|die Rundreise
destination|das Reiseziel
accommodation|die Unterkunft
youth hostel|die Jugendherberge
guesthouse|die Pension
single room|das Einzelzimmer
double room|das Doppelzimmer
reception|die Rezeption
key card|die Schlüsselkarte
breakfast buffet|das Frühstücksbüfett
booking|die Buchung
confirmation|die Bestätigung
cancellation|die Stornierung
luggage|das Gepäck
travel suitcase|der Reisekoffer
travel backpack|der Reiserucksack
passport|der Reisepass
border|die Grenze
foreign country|das Ausland
guidebook|der Reiseführer
sightseeing tour|die Stadtbesichtigung
landmark|die Sehenswürdigkeit
excursion|der Ausflug
beach|der Strand
coast|die Küste
island|die Insel
mountain range|das Gebirge
valley|das Tal
campsite|der Campingplatz
tent|das Zelt
sleeping bag|der Schlafsack
rental car|der Mietwagen
travel insurance|die Reiseversicherung
emergency number|die Notrufnummer
souvenir|das Souvenir`,
  },
  {
    category: "Gesundheit & Körper",
    rows: `health insurance|die Krankenversicherung
insurance card|die Versichertenkarte
doctor's surgery|die Arztpraxis
consultation hours|die Sprechstunde
medical appointment|der Arzttermin
examination|die Untersuchung
treatment|die Behandlung
prescription|das Rezept vom Arzt
medication|das Medikament
tablet|die Tablette
drops|die Tropfen
ointment|die Salbe
bandage|der Verband
ambulance|der Krankenwagen
emergency room|die Notaufnahme
operation|die Operation
injury|die Verletzung
wound|die Wunde
blood|das Blut
allergy|die Allergie
cold (illness)|die Erkältung
cough|der Husten
sore throat|die Halsschmerzen
stomachache|die Bauchschmerzen
back pain|die Rückenschmerzen
dizziness|der Schwindel
nausea|die Übelkeit
body temperature|die Körpertemperatur
infection|die Infektion
blood pressure|der Blutdruck
healthy diet|die gesunde Ernährung
exercise session|die Sporteinheit
rest|die Ruhe
recovery|die Genesung
pharmacy emergency service|der Apothekennotdienst`,
  },
  {
    category: "Freizeit, Kultur & Sport",
    rows: `event|die Veranstaltung
performance|die Aufführung
exhibition|die Ausstellung
admission|der Eintritt
entrance fee|der Eintrittspreis
admission ticket|die Eintrittskarte
stage|die Bühne
audience|das Publikum
orchestra|das Orchester
musical instrument|das Musikinstrument
violin|die Geige
flute|die Flöte
painting|das Gemälde
artist|der/die Künstler/in
novel|der Roman
chapter|das Kapitel
membership|die Mitgliedschaft
association / club|der Verein
sports training|das Training
competition|der Wettbewerb
sports team|die Mannschaft
coach|der/die Trainer/in
spectator|der/die Zuschauer/in
draw (sport)|das Unentschieden
victory|der Sieg
defeat|die Niederlage
hobby group|die Freizeitgruppe
board game|das Brettspiel
dance class|der Tanzkurs
choir|der Chor`,
  },
  {
    category: "Natur, Wetter & Umwelt",
    rows: `environment|die Umwelt
climate|das Klima
pollution|die Umweltverschmutzung
waste|der Abfall
recycling|das Recycling
waste separation|die Mülltrennung
rubbish bin|die Mülltonne
packaging|die Verpackung
glass recycling container|der Glascontainer
energy|die Energie
solar energy|die Sonnenenergie
storm|der Sturm
thunderstorm|das Gewitter
lightning|der Blitz
thunder|der Donner
weather forecast|die Wettervorhersage
cloud|die Wolke
fog|der Nebel
frost|der Frost
forest|der Wald
meadow|die Wiese
lake|der See
river|der Fluss
hiking trail|der Wanderweg
protected area|das Naturschutzgebiet`,
  },
  {
    category: "Zeit, Zahlen & Mengen",
    rows: `period|der Zeitraum
moment|der Augenblick
the past|die Vergangenheit
future|die Zukunft
century|das Jahrhundert
decade|das Jahrzehnt
half an hour|die halbe Stunde
quarter of an hour|die Viertelstunde
deadline|die Frist
duration|die Dauer
starting point|der Ausgangspunkt
ending|das Ende
sequence|die Reihenfolge
firstly|erstens
secondly|zweitens
finally|schließlich
at present|zurzeit
recently|vor Kurzem
weekly|wöchentlich
monthly|monatlich`,
  },
  {
    category: "Medien & Digitales",
    rows: `internet connection|die Internetverbindung
website|die Webseite
web link|der Link
web browser|der Browser
password|das Passwort
username|der Benutzername
user account|das Benutzerkonto
mobile app|die App
download|der Download
file format|das Dateiformat
computer folder|der Ordner
email attachment|der Anhang
email address|die E-Mail-Adresse
email inbox|das Postfach
text message|die Textnachricht
voice message|die Sprachnachricht
video call|der Videoanruf
social network|das soziale Netzwerk
online post|der Beitrag
online comment|der Kommentar
photo gallery|die Fotogalerie
printout|der Ausdruck
screen|der Bildschirm
keyboard|die Tastatur
charger|das Ladegerät`,
  },
  {
    category: "Dienstleistungen & Behörden",
    rows: `public authority|die Behörde
citizens' office|das Bürgeramt
registration office|das Meldeamt
residence registration|die Wohnsitzanmeldung
deregistration|die Abmeldung
registration certificate|die Meldebescheinigung
application form|das Formular
signature|die Unterschrift
official certificate|die Bescheinigung
identity card|der Personalausweis
residence permit|der Aufenthaltstitel
bank account|das Bankkonto
bank statement|der Kontoauszug
bank transfer|die Überweisung
standing order|der Dauerauftrag
parcel|das Paket
shipment|die Sendung
post office branch|die Postfiliale
police station|die Polizeiwache
customs|der Zoll
emergency services|der Rettungsdienst
fire brigade|die Feuerwehr
insurance|die Versicherung
customer service|der Kundendienst
service counter|der Schalter`,
  },
  {
    category: "Verben",
    rows: `to cancel|absagen
to register|sich anmelden
to deregister|sich abmelden
to apply for|beantragen
to fill in|ausfüllen
to submit|einreichen
to confirm|bestätigen
to arrange|vereinbaren
to postpone|verschieben
to complain|sich beschweren
to make a complaint|reklamieren
to return an item|zurückgeben
to exchange|umtauschen
to reserve|reservieren
to deliver|liefern
to transfer money|überweisen
to deposit money|einzahlen
to withdraw money|abheben
to save money|sparen
to earn|verdienen
to terminate a contract|kündigen
to apply for a job|sich bewerben
to hire|einstellen
to dismiss|entlassen
to participate|teilnehmen
to take place|stattfinden
to get ready|vorbereiten
to organize|organisieren
to summarize|zusammenfassen
to report|berichten
to give a reason|begründen
to compare|vergleichen
to decide|entscheiden
to suggest|vorschlagen
to agree|zustimmen
to reject|ablehnen
to allow|erlauben
to forbid|verbieten
to remember|sich erinnern
to be interested|sich interessieren
to look forward to|sich freuen auf
to be annoyed|sich ärgern
to take care of|sich kümmern um
to recover / relax|sich erholen
to examine|untersuchen
to treat|behandeln
to injure oneself|sich verletzen
to hurry|sich beeilen
to pick up|abholen
to depart|abfahren`,
  },
  {
    category: "Adjektive & Adverbien",
    rows: `similar|ähnlich
pleasant|angenehm
exciting|aufregend
comfortable|bequem
popular|beliebt
dangerous|gefährlich
healthy|gesund
polite|höflich
practical|praktisch
private|privat
public|öffentlich
possible|möglich
impossible|unmöglich
necessary|nötig
occupied|besetzt
available|verfügbar
responsible|verantwortlich
together / joint|gemeinsam
separated|getrennt
single / unmarried|ledig
married|verheiratet
unemployed|arbeitslos
self-employed|selbstständig
in writing|schriftlich
orally|mündlich
personal|persönlich
urgent|dringend
regular|regelmäßig
sudden|plötzlich
surprising|überraschend
at least (amount)|mindestens
at most|höchstens
especially|besonders
approximately|ungefähr
responsibly|verantwortungsvoll`,
  },
];

function parseSection(section: Section): Omit<VocabularyWord, "id" | "level">[] {
  return section.rows.trim().split("\n").map((row) => {
    const [english, german] = row.split("|");
    if (!english || !german) throw new Error(`Ungültiger A2-Wortschatzeintrag: ${row}`);
    return { english, german, category: section.category };
  });
}

const words = SECTIONS.flatMap(parseSection);

if (words.length !== 500) {
  throw new Error(`A2-Wortschatz: ${words.length} statt 500 Einträge.`);
}

export const A2_VOCABULARY: VocabularyWord[] = words.map((word, index) => ({
  ...word,
  id: `a2-${String(index + 1).padStart(3, "0")}`,
  level: "A2",
}));
