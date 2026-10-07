const TOPICS = [
  ["Familie & Menschen", /\b(family|parent|child|marriage|divorce|relationship|relative|refugee|society|social|friend|human|person|people|emotion|feeling|trust|grief|solidarity|tolerance)\b/i],
  ["Zuhause & Wohnen", /\b(home|house|housing|apartment|room|building|furniture|rent|tenant|garden|construction|household|property|estate|roof|wall|door)\b/i],
  ["Essen & Trinken", /\b(food|drink|meal|bread|meat|fruit|vegetable|restaurant|taste|dish|ingredient|diet|nutrition|cooking|kitchen|wine|beer)\b/i],
  ["Einkaufen & Kleidung", /\b(shop|store|price|sale|customer|product|clothing|shirt|shoe|dress|payment|delivery|purchase|retail|fashion|consumer|refund)\b/i],
  ["Schule & Lernen", /\b(school|student|teacher|lesson|exam|education|study|knowledge|university|book|language|research|science|theory|learning|academic|definition|scholar|thesis|analysis|method)\b/i],
  ["Arbeit & Beruf", /\b(work|job|company|employee|employer|office|career|salary|business|profession|industry|economy|economic|investment|finance|revenue|profit|management|production|corporation|employment|wage)\b/i],
  ["Stadt & Verkehr", /\b(city|street|road|traffic|train|bus|station|vehicle|transport|bicycle|car|railway|district|municipal|infrastructure)\b/i],
  ["Reisen & Unterkunft", /\b(travel|trip|journey|hotel|tourist|holiday|flight|airport|luggage|accommodation|tourism|tour|passport|destination)\b/i],
  ["Gesundheit & Körper", /\b(health|body|doctor|hospital|disease|pain|medicine|patient|treatment|blood|medical|illness|infection|therapy|surgery|muscle|nerve|organ|heart|lung|diagnosis)\b/i],
  ["Freizeit, Kultur & Sport", /\b(sport|game|music|film|art|theater|theatre|museum|hobby|festival|concert|cultural|culture|poem|novel|literature|painting|match|team|championship|orchestra|artist|entertainment)\b/i],
  ["Natur, Wetter & Umwelt", /\b(nature|weather|environment|animal|plant|tree|forest|water|climate|earth|river|energy|pollution|emission|species|ecology|agriculture|landscape|mineral|carbon|wind|soil|rain|sustainability)\b/i],
  ["Zeit, Zahlen & Mengen", /\b(time|day|week|month|year|hour|date|amount|number|quantity|period|century|duration|percentage|proportion|frequency|volume|ratio)\b/i],
  ["Medien & Digitales", /\b(media|computer|internet|website|phone|software|data|message|television|radio|network|digital|broadcast|press|journalism|editor|publication|technology|file|screen|program|communication)\b/i],
  ["Dienstleistungen & Behörden", /\b(government|authority|court|law|police|insurance|service|tax|administration|parliament|politic|political|election|vote|justice|crime|legal|regulation|democracy|citizen|constitution|rights|minister|chancellor|public|federal|union|war|peace|military)\b/i],
];

// German topic stems keep specialised nouns searchable even with short glosses.
const GERMAN_TOPICS = [
  ["Dienstleistungen & Behörden", /bundes|parlament|gericht|gesetz|behörd|wahl|polit|demokrat|minister|kanzler|verfassung|justiz|staats|strafe|straf|kriminal|polizei|militär|armee|herrsch|krieg|mord|täter|richter|anwalt|kommiss|präsiden|beamte|regierung|gefang|partei|diktat|republik|federation|föderation|bürgerrecht|mensch(en)?recht/i],
  ["Arbeit & Beruf", /arbeit|beruf|wirtschaft|finanz|unternehm|industrie|geschäft|kapital|invest|konkurs|insolvenz|handel|lohn|gehalt|umsatz|bilanz|aktionär|aktie|konzern|vertrieb|produkti|management|gewerbe|buchhalt|betrieb|wettbewerb/i],
  ["Gesundheit & Körper", /arzt|ärzt|medizin|krank|gesund|patient|therap|chirurg|knochen|muskel|lunge|herz|blut|nerv|schädel|droge|depress|infekt|hormon|symptom|diagnos|psychiatr|antibio|körper|autismus|demenz/i],
  ["Medien & Digitales", /internet|daten|digital|computer|software|hardware|grafik|elektron|bildschirm|netzwerk|funk|fernseh|radio|presse|journalis|redaktion|medien|medium|telekom|programmi|browser|portal|domain|server|speicher|stream|publishing|monitoring/i],
  ["Schule & Lernen", /schule|lehrer|bildung|forsch|wissenschaft|univers|studium|student|doktor|diplom|akadem|fakultät|seminar|prüfung|pädagog|lehr|sprach|grammat|vokabul|mathemat|physik|chemie|philosoph|formel/i],
  ["Natur, Wetter & Umwelt", /umwelt|natur|ökolog|klima|energie|landwirtschaft|wald|wald|wasser|boden|landschaft|gestein|mineral|kohlen|atom|galax|astronom|geolog|tier|vogel|pflanze|blüte|wetter|regen|windkraft|sonnen|schwefel|magnesium|lithium|gewässer/i],
  ["Freizeit, Kultur & Sport", /kultur|literatur|theater|schausp|musik|kunst|künstler|orchester|philharm|sport|spiel|lig(a|ist)|meisterschaft|olymp|fußball|turnier|film|roman|drehbuch|verlag|satire|gedicht|dichter|kompon|konzert|denkmal|tradition/i],
  ["Familie & Menschen", /famil|kind|eltern|mutter|vater|ehe|scheidung|verwandt|freund|mensch|migrant|migration|flüchtling|mitbürger|lieb|gefühl|mitgefühl|hass|trauer|psycholog|toleranz|solidar|gesellig|gemeinschaft/i],
  ["Zuhause & Wohnen", /wohn|haus|gebäude|möbel|bauvorhaben|baustelle|bauherr|miete|immobilie|dach|fassade|heizung|fenster|eigentum|siedlung/i],
  ["Stadt & Verkehr", /stadt|verkehr|fahrzeug|fahrbahn|autobahn|straße|bahnhof|eisenbahn|bahnlinie|straßen|stadtteil|landkreis|ortsteil|parkplatz|automobil|infrastruktur/i],
  ["Reisen & Unterkunft", /reise|touris|hotel|unterkunft|herberge|flug|luftfahrt|gepäck|urlaubs|camping/i],
  ["Einkaufen & Kleidung", /einkauf|verkauf|kleid|mode|textil|bekleidung|kleidung|umtausch|gutschein|rabatt|verbraucher|kunden/i],
  ["Essen & Trinken", /lebensmittel|nahrung|ernährung|koch|küche|gastronom|getränk|restaurant|speise|wein|brauerei|backerei/i],
  ["Zeit, Zahlen & Mengen", /zeit|jahr|monat|stunde|quantität|menge|anzahl|prozent|durchschnitt/i],
];


export function vocabularyTopic(german, english, kind) {
  if (kind === "verb") return "Verben";
  if (kind !== "noun") return "Adjektive & Adverbien";
  return GERMAN_TOPICS.find(([, pattern]) => pattern.test(german))?.[0]
    ?? TOPICS.find(([, pattern]) => pattern.test(english))?.[0] ?? "Grundlagen & Kommunikation";
}
