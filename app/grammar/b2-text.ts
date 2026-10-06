import type { AdvancedDefinition } from './advanced-builder';
export const B2_TEXT: AdvancedDefinition[] = [
{ id:'b2-5-1',title:'Extended participial attributes',outcome:'Compress a relative clause into an attributive phrase while retaining case and agreement.',pattern:'die gestern veröffentlichte Studie · die seit Jahren steigenden Kosten',sources:['attributes'],rules:[
'Partizip I often describes an ongoing activity; Partizip II often describes completion or a passive result, depending on the verb.',
'An attributive participle takes adjective endings determined by article, gender, number and case.',
'Complements and adverbs of the participle precede it inside the noun phrase: die gestern von ihr veröffentlichte Studie.',
'Intransitive change-of-state participles can be active in meaning: die angekommenen Gäste. Do not equate every Partizip II with passive.',
'Long attributes suit careful writing but can be harder to process than relative clauses. Preserve meaning when expanding or reducing.',
'Find the head noun and its case first, then bracket the attribute and check the participial ending.'
],rows:[
['Die gestern [veröffentlichte~veröffentlicht] Studie ist wichtig.','The study published yesterday is important.'],
['Wir prüfen die stetig [steigenden~steigende] Kosten.','We examine the steadily rising costs.'],
['Der im Ausland [lebende~lebend] Autor kommt morgen.','The author living abroad is coming tomorrow.'],
['Die von uns [gesammelten~gesammelte] Daten sind anonym.','The data collected by us are anonymous.'],
['Ich spreche mit dem neu [eingestellten~eingestellte] Kollegen.','I speak with the newly hired colleague.'],
['Die bereits [angekommenen~angekommene] Gäste warten.','The guests who have already arrived are waiting.'],
['Das gestern [reparierte~repariert] Gerät funktioniert.','The device repaired yesterday works.'],
['Eine ständig [wachsende~wachsend] Stadt braucht Wohnungen.','A constantly growing city needs housing.'],
['Wir danken den an der Studie [beteiligten~beteiligte] Personen.','We thank the people involved in the study.'],
['Sie liest einen von Experten [verfassten~verfasste] Bericht.','She reads a report written by experts.']
]},
{ id:'b2-5-2',title:'Gerundive attributes: zu + Partizip I',outcome:'Describe a required or possible action on a noun using a formal participial attribute.',pattern:'die zu prüfenden Daten · eine zu lösende Aufgabe',sources:['attributes','passive'],rules:[
'zu plus an attributive Partizip I can describe something that must or can be acted on.',
'The head noun is understood as the patient: die zu prüfenden Daten means data to be checked, not data doing the checking.',
'Form the participle from the infinitive plus -d and adjective ending: prüfen → prüfend → zu prüfenden.',
'Separable verbs preserve their prefix before zu: die einzureichenden Unterlagen. The construction is a participial attribute, not a zu-infinitive.',
'Context distinguishes necessity from possibility; schwer zu lösende Probleme emphasises difficulty or feasibility.',
'Expand the attribute into a relative clause with müssen or können to verify its meaning.'
],rows:[
['Die zu [prüfenden~prüfen] Daten liegen vor.','The data to be checked are available.'],
['Das ist eine zu [lösende~lösen] Aufgabe.','That is a task to be solved.'],
['Die [einzureichenden~zu einreichenden] Unterlagen fehlen.','The documents to be submitted are missing.'],
['Wir besprechen den zu [ändernden~ändern] Abschnitt.','We discuss the section to be changed.'],
['Die zu [beachtenden~beachten] Regeln sind klar.','The rules to be observed are clear.'],
['Sie nennt einen schwer zu [behebenden~beheben] Fehler.','She mentions an error that is difficult to correct.'],
['Das zu [ersetzende~ersetzen] Gerät ist alt.','The device to be replaced is old.'],
['Wir lesen die zu [unterschreibenden~unterschreiben] Verträge.','We read the contracts to be signed.'],
['Die [abzugebenden~zu abgebenden] Formulare sind vollständig.','The forms to be handed in are complete.'],
['Er erklärt das zu [untersuchende~untersuchen] Problem.','He explains the problem to be investigated.']
]},
{ id:'b2-5-3',title:'Nominal and verbal style',outcome:'Convert clauses to noun phrases while preserving actor, object and logical relation.',pattern:'weil … → wegen + Genitiv · nachdem … → nach + Dativ',sources:['nominal','connectors','valency'],rules:[
'Nominal style compresses actions into nouns; verbal style makes actors, tense and modality easier to see.',
'A connector often changes into a preposition, so case changes too: weil → wegen, nachdem → nach, obwohl → trotz.',
'Action nouns may introduce genitive or prepositional complements. Make the agent explicit with durch where ambiguity matters.',
'A noun phrase alone usually loses tense. Add temporal wording if it is needed to preserve the original chronology.',
'Careful written production normally uses genitive after wegen and trotz, while dative variants occur in standard regional and conversational usage.',
'After a transformation, check who does what, when, and whether the original logical relation still holds.'
],rows:[
['Wegen [des~der] starken Regens fällt das Spiel aus.','Because of the heavy rain, the match is cancelled.'],
['Nach [der~die] Prüfung gehen wir essen.','After the exam, we go for a meal.'],
['Trotz [des~den] hohen Preises kaufen sie das Gerät.','Despite the high price, they buy the device.'],
['Die Prüfung der Daten [durch~auf] das Team dauert lange.','The checking of the data by the team takes a long time.'],
['Zur Verbesserung [der~die] Qualität üben wir täglich.','To improve quality, we practise daily.'],
['Vor [dem~den] Beginn der Sitzung lesen wir den Bericht.','Before the start of the meeting, we read the report.'],
['Bei [der~die] Bearbeitung des Antrags hilft sie.','She helps with the processing of the application.'],
['Ohne [die~der] Zustimmung der Leitung beginnen wir nicht.','Without the approval of the management, we do not begin.'],
['Die Einführung [des~den] Systems ist geplant.','The introduction of the system is planned.'],
['Durch [die~der] Reparatur sparen wir Geld.','Through the repair, we save money.']
]},
{ id:'b2-5-4',title:'Free relatives and sentence reference',outcome:'Refer to unspecified people, things and whole propositions with appropriate relative structures.',pattern:'wer …, der … · was … · alles, was … · …, worüber …',sources:['relatives','connectors'],rules:[
'A free relative has no ordinary preceding head noun: wer hier arbeitet, kennt die Regeln.',
'wer, wen and wem reflect the relative clause’s internal role; a following correlate takes its own case independently.',
'Use was after indefinite neuter expressions such as alles and etwas, and to refer to an entire previous proposition.',
'wo-compounds can refer to prepositional relations involving things or propositions, not indiscriminately to people.',
'An ordinary neuter noun normally takes das rather than was in the relative clause: das Buch, das ich lese.',
'Identify the antecedent type and separately determine the case required inside each clause.'
],rows:[
['[Wer~Wen] hier arbeitet, kennt die Regeln.','Whoever works here knows the rules.'],
['[Wem~Wer] wir helfen, der bedankt sich.','Whoever we help thanks us.'],
['Alles, [was~wer] du brauchst, liegt hier.','Everything you need is here.'],
['Sie hat bestanden, [was~wer] uns freut.','She has passed, which makes us happy.'],
['Das ist etwas, [was~wer] mich überrascht.','That is something that surprises me.'],
['[Wen~Wer] er einlädt, den begrüßt er persönlich.','Whoever he invites, he welcomes personally.'],
['Sie kam zu spät, [worüber~über wer] er sich ärgerte.','She came late, which annoyed him.'],
['Das Buch, [das~wer] ich lese, ist spannend.','The book that I am reading is exciting.'],
['[Wer~Wem] viel übt, wird sicherer.','Whoever practises a lot becomes more confident.'],
['Er half uns, [wofür~für wer] wir ihm danken.','He helped us, for which we thank him.']
]},
{ id:'b2-5-5',title:'The different jobs of es',outcome:'Distinguish referential es, impersonal subjects, correlates and first-field placeholders.',pattern:'es regnet · es freut mich, dass … · es kamen Gäste / heute kamen Gäste',sources:['es','fields'],rules:[
'Referential es can stand for a neuter noun. Its reference must remain identifiable in context.',
'In weather expressions such as es regnet, es is an obligatory impersonal subject even after an initial adverb.',
'A first-field placeholder es is different: es kamen Gäste becomes heute kamen Gäste, with agreement controlled by Gäste.',
'Correlate es can point forward to a clause: es freut mich, dass du kommst. Its optionality depends on the governing construction.',
'Impersonal passive can use first-field es but has no subject controlling plural agreement: es wird gearbeitet.',
'Test whether es refers to a noun, remains necessary after fronting, or only fills the first field.'
],rows:[
['Heute regnet [es~ihn].','It is raining today.'],
['Es [kamen~kam] viele Gäste.','Many guests arrived.'],
['Heute [kamen~kam] viele Gäste.','Many guests arrived today.'],
['[Es~Er] freut mich, dass du kommst.','I am glad that you are coming.'],
['Das Gerät ist neu; [es~er] funktioniert gut.','The device is new; it works well.'],
['Morgen schneit [es~sie].','It will snow tomorrow.'],
['Es [wird~werden] im Saal getanzt.','There is dancing in the hall.'],
['Mir geht [es~ihn] gut.','I am doing well.'],
['Es [fehlen~fehlt] zwei Seiten.','Two pages are missing.'],
['Heute wird hier [gearbeitet~arbeiten].','Work is being done here today.']
]},
{ id:'b2-5-6',title:'Word formation and grammatical categories',outcome:'Interpret compound heads, derived nouns and separable or inseparable prefixes.',pattern:'die Arbeit + das Zimmer → das Arbeitszimmer · lesbar · unlesbar',sources:['wordFormation'],rules:[
'The final component usually determines a compound noun’s gender and grammatical category: das Arbeitszimmer.',
'Linking elements such as -s- are lexical patterns, not a universal genitive rule; learn established compounds.',
'Suffixes can guide gender and category: -ung and -heit produce feminine nouns; -bar often forms adjectives of possibility.',
'Nominalised infinitives are neuter and capitalised. Adjectives used as nouns retain their declension patterns.',
'Prefix stress and meaning affect separability; be-, ent-, er-, ver- and zer- are normally inseparable and omit ge- in participles.',
'Analyse the head and category, then verify the actual word; productive rules do not make every invented compound idiomatic.'
],rows:[
['[Das~Der] Arbeitszimmer ist ruhig.','The study is quiet.'],
['[Die~Das] Entscheidung fällt morgen.','The decision is made tomorrow.'],
['[Die~Der] Freiheit ist wichtig.','Freedom is important.'],
['[Das~Die] Lesen hilft beim Lernen.','Reading helps with learning.'],
['Der Text ist gut [lesbar~Lesbar].','The text is easy to read.'],
['Sie hat den Text [verstanden~geverstanden].','She has understood the text.'],
['Er hat sich [entschieden~geentschieden].','He has made a decision.'],
['[Die~Das] Sicherheit steht im Vordergrund.','Safety is the priority.'],
['[Das~Die] Forschungsergebnis ist neu.','The research result is new.'],
['Wir sprechen über etwas [Neues~neuer].','We talk about something new.']
]},
{ id:'b2-6-1',title:'Sentence fields and the Nachfeld',outcome:'Place clauses and long phrases around the verb bracket without losing the finite verb.',pattern:'Vorfeld | linke Klammer | Mittelfeld | rechte Klammer | Nachfeld',sources:['fields','commas'],rules:[
'In a main statement, one constituent normally occupies the first field, followed by the finite verb.',
'The right bracket contains a participle, infinitive or separable prefix; the middle field lies between the brackets.',
'Long clauses and some comparative or prepositional phrases can stand in the post-field after the right bracket.',
'In subordinate clauses, the connector and final verb group create a different bracket; double-infinitive exceptions still apply.',
'Not every extraposition is equally natural. Use the Nachfeld to improve readability, not to scatter tightly bound words.',
'Mark the two brackets, then decide which information belongs inside them and which clause can follow.'
],rows:[
['Gestern [haben~wir] wir den Bericht gelesen.','Yesterday we read the report.'],
['Wir haben beschlossen, früher [zu beginnen~beginnen zu].','We have decided to begin earlier.'],
['Sie hat erklärt, warum der Zug [ausfällt~fällt aus].','She has explained why the train is cancelled.'],
['Wir rufen dich morgen [an~anzu].','We call you tomorrow.'],
['Ich weiß, dass er heute kommen [kann~können].','I know that he can come today.'],
['Den Vertrag [hat~haben] sie gestern unterschrieben.','She signed the contract yesterday.'],
['Er ist schneller gelaufen, als ich erwartet [hatte~habe gehabt].','He ran faster than I had expected.'],
['Sie möchte wissen, ob wir Zeit [haben~hat].','She wants to know whether we have time.'],
['Nach der Sitzung [gehen~geht] wir nach Hause.','After the meeting, we go home.'],
['Wir haben gehört, dass das Büro geschlossen [ist~sein].','We have heard that the office is closed.']
]},
{ id:'b2-6-2',title:'Neutral order and focused order',outcome:'Use pronouns and information structure without mistaking flexible word order for a universal error.',pattern:'ich gebe es ihm · die Unterlagen gebe ich ihm · IHM gebe ich sie',sources:['fields','valency'],rules:[
'Neutral order usually places short unstressed pronouns before full noun objects; with two object pronouns, accusative commonly precedes dative.',
'With two full noun objects, dative before accusative is a useful neutral starting point, not an absolute law.',
'Known information often comes earlier than new or focused information. Stress and contrast can license different orders.',
'Time–cause–manner–place is a planning aid, not a rule that overrides verb complements and communicative focus.',
'Fronting one phrase does not change its case. The finite verb remains second even when the object comes first.',
'Check case independently of order and distinguish a neutral model from another grammatical focused version.'
],rows:[
['Ich gebe [es~ihm] ihm.','I give it to him.'],
['Die Unterlagen [gebe~geben] ich ihr morgen.','I give her the documents tomorrow.'],
['Ihm [habe~haben] ich die Nachricht geschickt.','I sent him the message.'],
['Sie erklärt [mir~mich] das Problem.','She explains the problem to me.'],
['Den Kollegen [kenne~kennen] ich gut.','I know the colleague well.'],
['Ich zeige [sie~ihnen] ihm.','I show them to him.'],
['Heute [schickt~schicken] sie uns den Vertrag.','Today she sends us the contract.'],
['Den Bericht [hat~haben] er mir gegeben.','He gave me the report.'],
['Wir bringen [ihnen~sie] die Unterlagen.','We bring them the documents.'],
['Diesen Vorschlag [unterstütze~unterstützen] ich.','I support this proposal.']
]},
{ id:'b2-6-3',title:'Negation and scope',outcome:'Choose nicht or kein and identify which claim or constituent is being rejected.',pattern:'nicht heute, sondern morgen · kein Geld · nicht alle / alle nicht',sources:['negation','fields'],rules:[
'kein negates indefinite noun phrases; nicht can negate a predicate, clause or focused constituent.',
'A focused nicht normally precedes the rejected phrase: nicht heute, sondern morgen.',
'Negation scope matters: nicht alle means not everyone, while none is clearer as niemand or kein einziger.',
'In neutral predicate negation, nicht often precedes the right bracket or closely bound predicate complement.',
'Double negation in dialect or colloquial speech is not the default pattern for careful standard writing.',
'State the positive claim and exactly what you deny before deciding the negative expression.'
],rows:[
['Wir kommen nicht heute, [sondern~aber dass] morgen.','We are coming tomorrow rather than today.'],
['Er hat [kein~nicht] Geld.','He has no money.'],
['Sie hat den Bericht nicht [gelesen~lesen].','She has not read the report.'],
['[Nicht~Kein] alle Gäste sind angekommen.','Not all the guests have arrived.'],
['Ich warte nicht auf dich, [sondern~und dass] auf ihn.','I am waiting for him rather than you.'],
['Sie ist [nicht~kein] zufrieden.','She is not satisfied.'],
['Wir brauchen [keine~nicht] weiteren Kopien.','We need no further copies.'],
['Er arbeitet nicht langsam, [sondern~weil dass] sorgfältig.','He works carefully rather than slowly.'],
['[Niemand~Niemande] hat geantwortet.','Nobody has replied.'],
['Der Vertrag ist [nicht~kein] gültig.','The contract is not valid.']
]},
{ id:'b2-6-4',title:'Focus particles and modal particles',outcome:'Interpret only, even, expectation and conversational attitude without treating particles as filler.',pattern:'nur / sogar / auch · doch / ja / denn / mal',sources:['particles','negation'],rules:[
'Focus particles such as nur, sogar and auch associate with a focused expression; position and stress influence their scope.',
'Only the subject and only the object are different claims. Place the particle next to the intended focus when clarity matters.',
'Modal particles such as ja, doch, denn and mal express interactional attitude rather than adding ordinary sentence constituents.',
'The same written word can have another function: denn can be a causal conjunction or a question particle.',
'Particles depend strongly on context and intonation; their tone can sound friendly, surprised or impatient. Avoid fixed one-word translations.',
'Read the whole interaction: identify focus, shared knowledge and the speaker’s intended tone.'
],rows:[
['Nur Anna [hat~haben] den Bericht gelesen.','Only Anna has read the report.'],
['Anna hat nur den Bericht [gelesen~lesen].','Anna has read only the report.'],
['Sogar der Chef [war~waren] überrascht.','Even the boss was surprised.'],
['Was machst du [denn~denn dass] hier?','What are you doing here, then?'],
['Komm doch [mal~zu mal] vorbei!','Do come by sometime!'],
['Du bist ja schon [fertig~fertige].','You are already finished, I see.'],
['Auch die Gäste [haben~hat] geholfen.','The guests have helped too.'],
['Er hat sogar [mir~mich] geantwortet.','He has even replied to me.'],
['Mach bitte die Tür [zu~zu zu]!','Please close the door!'],
['Sie hat nur [einen~einem] Fehler gemacht.','She has made only one mistake.']
]},
{ id:'b2-6-5',title:'Current punctuation and spelling essentials',outcome:'Apply current comma rules, recognise integrated infinitives and avoid common spelling traps.',pattern:'ich hoffe, … zu … · du brauchst nicht … zu … · nominalisierte Verben groß',sources:['commas','orthography'],rules:[
'The official 2024 rules separate finite and clause-like infinitive subordinate clauses with commas, including expanded dependent zu-groups.',
'A bare unexpanded zu-infinitive can be treated as a word group or clause; this can make the comma optional.',
'An integrated multi-part predicate takes no internal separating comma: du brauchst nicht zu kommen, die Regel ist zu beachten.',
'Commas frame relative clauses and mark clause boundaries; German does not require a comma simply because a speaker pauses.',
'Nominalised verbs and adjectives are capitalised. Formal Sie, Ihnen and possessive Ihr are capitalised; dass and das have different grammatical functions.',
'Check the grammatical structure first, then punctuation, capitals and conventional word spelling.'
],rows:[
['Ich hoffe[,~;] den Kurs bald abzuschließen.','I hope to finish the course soon.'],
['Er versucht[,~;] den Text zu verstehen.','He tries to understand the text.'],
['Die Regel ist [zu beachten~zu, beachten].','The rule must be observed.'],
['Beim [Lesen~lesen] mache ich Notizen.','I take notes while reading.'],
['Ich weiß, [dass~das] sie kommt.','I know that she is coming.'],
['Das Buch, [das~dass] ich lese, ist neu.','The book that I am reading is new.'],
['Könnten [Sie~sie] mir helfen?','Could you help me?'],
['Du brauchst nicht [zu warten~zu, warten].','You do not need to wait.'],
['Sie ging, ohne sich [zu verabschieden~verabschieden zu].','She left without saying goodbye.'],
['Wir haben den Wunsch[,~;] gemeinsam zu arbeiten.','We have the wish to work together.']
]},
{ id:'b2-6-6',title:'B2 synthesis: revise a project update',outcome:'Combine grammar choices in a practical update and justify revisions instead of memorising isolated forms.',pattern:'time · reason · attribution · passive · condition · precise reference',sources:['cefr','goetheB2','commas','reporting'],rules:[
'A coherent project update identifies completed work, remaining tasks, responsibility and next steps with consistent time reference.',
'Use passive when the process matters and active voice when responsibility must be explicit. Preserve lexical case frames.',
'Distinguish evidence, reported claims and your own inference; do not silently turn one into another.',
'Use causal, conditional and concessive connectors according to their actual relationship, rather than for variety alone.',
'The controlled tasks practise model sentences. For production, write a five-sentence update and check agreement, cases, verb chains and commas.',
'B2 progress here records practice completion; a high fixed-answer score does not independently certify communicative proficiency.'
],rows:[
['Nachdem wir die Daten geprüft [hatten~hätte], begannen wir mit dem Bericht.','After we had checked the data, we began the report.'],
['Die Ergebnisse müssen veröffentlicht [werden~haben].','The results must be published.'],
['Die Leitung erklärt, die Planung [sei~seien] abgeschlossen.','The management explains that the planning is complete.'],
['Wir warten [auf~von] die Rückmeldung.','We are waiting for the feedback.'],
['Je genauer wir prüfen, desto weniger Fehler [bleiben~bleibt].','The more carefully we check, the fewer errors remain.'],
['Der Termin hängt [von~auf] der Finanzierung ab.','The date depends on the funding.'],
['Die zu [klärenden~klären] Fragen sind notiert.','The questions to be clarified are noted.'],
['Wir haben beschlossen, die Sitzung [zu verschieben~verschieben zu].','We have decided to postpone the meeting.'],
['Wenn wir mehr Zeit hätten, [könnten~konnte] wir weitere Tests machen.','If we had more time, we could run further tests.'],
['Die Datei muss bereits gesichert worden [sein~haben].','The file must already have been backed up.']
]},
];
