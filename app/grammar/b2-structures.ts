import type { AdvancedDefinition } from './advanced-builder';
export const B2_STRUCTURES: AdvancedDefinition[] = [
{ id:'b2-1-1',title:'Verb valency and case frames',outcome:'Choose objects from the verb’s lexical frame, rather than translating English word order.',pattern:'jemandem helfen · jemanden unterstützen · jemanden etwas fragen',sources:['valency'],rules:[
'A verb determines which complements it permits or requires; case is part of the lexical pattern.',
'helfen, danken, vertrauen and widersprechen take dative objects even when English uses a direct object.',
'unterstützen, beeinflussen and überzeugen take accusative objects; an English preposition is not a German case rule.',
'fragen can take two accusatives: jemanden etwas fragen. Do not apply the usual dative-plus-accusative pattern here.',
'Distinguish required complements from freely added time or place information. A complement can sometimes be omitted when context supplies it.',
'Learn a verb with its complete frame and one sentence; check every object independently.'
],rows:[
['Die Beraterin hilft [dem~den] Bewerber.','The adviser helps the applicant.'],
['Wir unterstützen [den~dem] Verein.','We support the association.'],
['Die Zahlen widersprechen [der~die] Prognose.','The figures contradict the forecast.'],
['Ich frage [dich~dir] etwas.','I ask you something.'],
['Die Entscheidung beeinflusst [den~dem] Markt.','The decision influences the market.'],
['Die Leitung dankt [den~die] Mitarbeitenden.','The management thanks the employees.'],
['Sie vertraut [ihrem~ihre] Kollegen.','She trusts her colleague.'],
['Der Bericht überzeugt [mich~mir].','The report convinces me.'],
['Die Änderung schadet [dem~den] Betrieb.','The change harms the business.'],
['Die Antwort genügt [mir~mich].','The answer is sufficient for me.']
]},
{ id:'b2-1-2',title:'Prepositional verbs and correlates',outcome:'Use fixed prepositions, case and da-compounds before clauses.',pattern:'warten auf + Akk. · abhängen von + Dat. · darauf, dass …',sources:['valency','connectors'],rules:[
'Learn the preposition and case together with the verb: sich beziehen auf plus accusative, abhängen von plus dative.',
'A lexical preposition is not interchangeable with a literal spatial equivalent; teilnehmen an differs from warten auf.',
'Use a preposition plus a personal pronoun for people. For things or whole propositions, da-compounds often avoid repetition.',
'Before a dass-clause or infinitive clause, a correlate such as darauf may connect the clause to the prepositional frame.',
'Not every verb requires an overt correlate in every construction. Learn attested patterns instead of mechanically adding da-.',
'Check verb, preposition, case, then whether the complement is a person, thing or clause.'
],rows:[
['Wir warten [auf~für] die Genehmigung.','We are waiting for the approval.'],
['Der Erfolg hängt [von~auf] der Planung ab.','Success depends on the planning.'],
['Sie nimmt [an~auf] der Sitzung teil.','She takes part in the meeting.'],
['Ich beziehe mich [auf~von] Ihren Vorschlag.','I refer to your proposal.'],
['Wir rechnen [damit~daran], dass der Zug ausfällt.','We expect the train to be cancelled.'],
['Er besteht [darauf~damit], dass wir antworten.','He insists that we reply.'],
['Sie interessiert sich [für~mit] die Forschung.','She is interested in the research.'],
['Wir sprechen [mit~auf] ihr über den Vertrag.','We speak with her about the contract.'],
['Die Gruppe zweifelt [an~auf] der Methode.','The group doubts the method.'],
['Ich erinnere mich [an~von] den Termin.','I remember the appointment.']
]},
{ id:'b2-1-3',title:'Adjective and noun complements',outcome:'Complete adjective and noun phrases with the correct case or preposition.',pattern:'an etwas interessiert · für etwas verantwortlich · Interesse an etwas',sources:['valency','attributes'],rules:[
'Adjectives and nouns also select complements; learn interessiert an and Interesse an as separate lexical frames.',
'Dative complements occur with adjectives such as bekannt and ähnlich: etwas ist jemandem bekannt.',
'Prepositional complements include verantwortlich für, abhängig von and stolz auf; their cases remain part of the frame.',
'Nominalisation may change the complement pattern: auf etwas hoffen becomes die Hoffnung auf etwas, but lexical exceptions exist.',
'An adjective’s complement is different from its attributive ending: der an Forschung interessierte Student needs both.',
'Keep a small frame dictionary of noun, adjective, preposition and example; do not infer all frames from English.'
],rows:[
['Sie ist [an~auf] dem Ergebnis interessiert.','She is interested in the result.'],
['Er ist [für~von] die Sicherheit verantwortlich.','He is responsible for safety.'],
['Die Regel ist [mir~mich] bekannt.','The rule is known to me.'],
['Wir sind stolz [auf~mit] unsere Arbeit.','We are proud of our work.'],
['Der Bedarf [an~auf] Fachkräften steigt.','The demand for skilled workers is rising.'],
['Ihr Interesse [an~auf] Sprachen ist groß.','Her interest in languages is great.'],
['Die Entscheidung ist [von~für] der Finanzierung abhängig.','The decision depends on the funding.'],
['Seine Antwort ist [meiner~meine] ähnlich.','His answer is similar to mine.'],
['Die Hoffnung [auf~an] eine Einigung bleibt.','The hope of an agreement remains.'],
['Sie ist [mit~auf] dem Ergebnis zufrieden.','She is satisfied with the result.']
]},
{ id:'b2-1-4',title:'Who performs the infinitive?',outcome:'Identify subject control, object control and when a dass-clause is needed.',pattern:'ich verspreche, zu … · ich bitte dich, zu … · ich hoffe, dass du …',sources:['valency','commas'],rules:[
'An infinitive clause normally has no expressed nominative subject. Its understood actor comes from the governing construction.',
'With versprechen and versuchen, the matrix subject normally performs the infinitive action.',
'With bitten, auffordern and erlauben, an object can be the understood actor; the two actions need not share a subject.',
'Use a finite dass-clause when the intended subject cannot be recovered from the infinitive construction.',
'Place zu before an inseparable infinitive but inside a separable one: zu verstehen, anzurufen. Separate clause-like groups with commas.',
'Ask who makes the promise or request and who carries it out before choosing an infinitive.'
],rows:[
['Ich verspreche, dich morgen [anzurufen~zu anrufen].','I promise to call you tomorrow.'],
['Wir bitten dich, den Text [zu prüfen~prüfen zu].','We ask you to check the text.'],
['Sie erlaubt ihm, früher [zu gehen~gehen zu].','She allows him to leave earlier.'],
['Er versucht, das Problem [zu lösen~lösen zu].','He tries to solve the problem.'],
['Ich hoffe, [dass du kommst~du zu kommen].','I hope that you will come.'],
['Die Chefin fordert uns auf, die Datei [abzuspeichern~zu abspeichern].','The manager asks us to save the file.'],
['Sie verspricht, pünktlich [zu erscheinen~erscheinen zu].','She promises to arrive on time.'],
['Er bittet mich, die Tür [zu schließen~schließen zu].','He asks me to close the door.'],
['Wir versuchen, die Kosten [zu senken~senken zu].','We try to reduce the costs.'],
['Ich erlaube dir, das Gerät [auszuprobieren~zu ausprobieren].','I allow you to try the device.']
]},
{ id:'b2-1-5',title:'Bare infinitives: lassen, perception and brauchen',outcome:'Distinguish bare infinitives from zu-infinitives in frequent verb combinations.',pattern:'lassen / sehen / hören + Infinitiv · nicht brauchen + zu-Infinitiv',sources:['verbChains','commas'],rules:[
'lassen combines with a bare infinitive to express permission, causation or having something done.',
'Perception verbs sehen and hören can take an accusative object and a bare infinitive: jemanden kommen sehen.',
'In standard teaching, negative or restricted brauchen takes zu: du brauchst nicht zu warten. Bare brauchen is common in speech.',
'Do not insert zu after a modal verb, lassen or the perception construction; these form a verb chain.',
'Distinguish causative lassen from reflexive sich lassen, which can describe feasibility. Integrated predicates do not take a separating comma.',
'First identify the governing verb; only then decide whether the following infinitive has zu.'
],rows:[
['Wir lassen die Anlage [prüfen~zu prüfen].','We have the system inspected.'],
['Ich sehe den Bus [kommen~zu kommen].','I see the bus coming.'],
['Sie hört die Kinder [lachen~zu lachen].','She hears the children laughing.'],
['Du brauchst heute nicht [zu kommen~kommen zu].','You do not need to come today.'],
['Die Lehrerin lässt uns [diskutieren~zu diskutieren].','The teacher lets us discuss.'],
['Er sieht die Gäste [ankommen~zu ankommen].','He sees the guests arriving.'],
['Wir hören jemanden [singen~zu singen].','We hear someone singing.'],
['Sie braucht nur den Antrag [auszufüllen~zu ausfüllen].','She only needs to fill in the application.'],
['Die Tür lässt sich leicht [öffnen~zu öffnen].','The door can easily be opened.'],
['Ich lasse mein Fahrrad [reparieren~zu reparieren].','I have my bicycle repaired.']
]},
{ id:'b2-1-6',title:'Ersatzinfinitiv and auxiliary position',outcome:'Build perfect modal chains and place haben before a double infinitive in subordinate clauses.',pattern:'hat arbeiten müssen · weil sie hat arbeiten müssen',sources:['verbChains','fields'],rules:[
'When a modal governs another infinitive in the perfect, its infinitive usually replaces the participle: hat arbeiten müssen.',
'With no dependent infinitive, a modal can use its participle: das habe ich nicht gewollt.',
'In subordinate perfect clauses with a modal double infinitive, finite haben precedes the infinitive pair.',
'Keep the lexical infinitive before the governing modal: hat bleiben müssen, not hat müssen bleiben in the neutral taught pattern.',
'lassen also commonly uses an Ersatzinfinitiv with a dependent infinitive; perception verbs have construction-dependent variation.',
'Find three jobs: finite auxiliary, lexical infinitive, modal infinitive. Do not apply simple verb-final order blindly.'
],rows:[
['Sie hat länger arbeiten [müssen~gemusst].','She has had to work longer.'],
['Wir haben früher gehen [können~gekonnt].','We have been able to leave earlier.'],
['Er hat den Bericht lesen [wollen~gewollt].','He has wanted to read the report.'],
['Ich weiß, dass sie [hat bleiben müssen~bleiben müssen hat].','I know that she has had to stay.'],
['Sie sagt, dass wir [haben warten müssen~warten müssen haben].','She says that we have had to wait.'],
['Ich habe das Auto reparieren [lassen~gelassen].','I have had the car repaired.'],
['Er hat nicht kommen [dürfen~gedurft].','He has not been allowed to come.'],
['Wir wissen, dass er [hat gehen können~gehen können hat].','We know that he has been able to leave.'],
['Das habe ich nicht [gewollt~wollen].','I did not want that.'],
['Ihr habt die Aufgabe lösen [sollen~gesollt].','You were supposed to solve the task.']
]},
{ id:'b2-2-1',title:'Tense, reference time and narrative sequence',outcome:'Select tense from the intended time relationship rather than an English tense label.',pattern:'Präsens / Perfekt / Präteritum · Plusquamperfekt vor vergangenem Bezugspunkt',sources:['time'],rules:[
'German tense choice depends on reference time, discourse and register. It does not duplicate the English progressive or present perfect system.',
'Präteritum is frequent in written narrative; Perfekt is frequent in conversation. They can describe the same past event.',
'Plusquamperfekt locates an event before a past reference point. nachdem often makes this sequence explicit.',
'With seit and an ongoing state, German commonly uses the present even where English uses a perfect construction.',
'Present tense with a future adverb can express an arranged future event. Futur I is not obligatory for every future statement.',
'Draw the timeline before choosing tense, then maintain a coherent narrative viewpoint.'
],rows:[
['Als wir ankamen, [hatte~hatten] der Vortrag bereits begonnen.','When we arrived, the lecture had already begun.'],
['Seit zwei Jahren [arbeitet~hat gearbeitet] sie hier.','She has been working here for two years.'],
['Nachdem er gegessen [hatte~hätte], ging er hinaus.','After he had eaten, he went outside.'],
['Morgen [treffen~getroffen] wir uns um neun.','Tomorrow we meet at nine.'],
['Im Jahr 2010 [zog~ziehen] die Familie nach Köln.','In 2010 the family moved to Cologne.'],
['Bevor die Sitzung begann, [hatten~hat] wir die Unterlagen verteilt.','Before the meeting began, we had distributed the documents.'],
['Seit Montag [ist~gewesen] die Straße gesperrt.','The road has been closed since Monday.'],
['Nachdem sie den Vertrag gelesen [hatte~habe], unterschrieb sie ihn.','After she had read the contract, she signed it.'],
['Gestern [habe~bin] ich den Bericht gelesen.','Yesterday I read the report.'],
['Er [war~ist gewesen worden] müde und ging nach Hause.','He was tired and went home.']
]},
{ id:'b2-2-2',title:'Futur II: completion and assumptions',outcome:'Express completion by a future deadline and an inference about a past event.',pattern:'wird gemacht haben · wird angekommen sein',sources:['time','modals'],rules:[
'Futur II combines finite werden with a past participle and haben or sein in the infinitive.',
'Choose haben or sein as in the corresponding perfect: gearbeitet haben, angekommen sein.',
'A future deadline gives a completion reading: bis Freitag wird sie den Text geschrieben haben.',
'Without a future deadline, Futur II often expresses an assumption about the past: er wird den Zug verpasst haben.',
'Context and probability adverbs distinguish prediction from inference. Futur II alone does not prove the event occurred.',
'Check werden agreement, participle, perfect auxiliary and the temporal interpretation.'
],rows:[
['Bis morgen wird sie den Bericht geschrieben [haben~sein].','By tomorrow she will have written the report.'],
['Er wird schon angekommen [sein~haben].','He will probably have arrived already.'],
['Sie [werden~wird] das Ergebnis vergessen haben.','They will probably have forgotten the result.'],
['Bis Freitag werden wir die Prüfung bestanden [haben~sein].','By Friday we will have passed the exam.'],
['Der Zug wird bereits abgefahren [sein~haben].','The train will probably have departed already.'],
['Du wirst die Nachricht übersehen [haben~sein].','You will probably have overlooked the message.'],
['Bis dahin [werde~wird] ich alles erledigt haben.','By then I will have done everything.'],
['Die Gäste werden früh gegangen [sein~haben].','The guests will probably have left early.'],
['Ihr [werdet~wird] den Fehler bemerkt haben.','You will probably have noticed the mistake.'],
['Bis Ende Juni wird er umgezogen [sein~haben].','By the end of June he will have moved.']
]},
{ id:'b2-2-3',title:'Perfect and passive infinitives',outcome:'Relate an infinitive action to an earlier time and distinguish active from passive.',pattern:'gelesen zu haben · angekommen zu sein · geprüft worden zu sein',sources:['time','passive','commas'],rules:[
'A perfect infinitive expresses completion before a reference point, usually the governing situation; a future deadline can instead supply a later reference point.',
'Use the participle with zu haben or zu sein according to the lexical verb’s perfect auxiliary.',
'A passive perfect infinitive uses participle plus worden zu sein; gewesen expresses a state or a different construction.',
'The present passive infinitive is geprüft zu werden. It does not itself locate the event before the main clause.',
'Infinitive subjects must be recoverable from the construction; use a finite clause when reference would be unclear.',
'Build the meaning in this order: actor or patient, relative time, then auxiliary chain.'
],rows:[
['Sie behauptet, den Text gelesen [zu haben~zu sein].','She claims to have read the text.'],
['Er bedauert, zu spät angekommen [zu sein~zu haben].','He regrets having arrived too late.'],
['Die Akte scheint geprüft [worden zu sein~geworden zu sein].','The file seems to have been checked.'],
['Der Antrag wartet darauf, bearbeitet [zu werden~zu haben].','The application is waiting to be processed.'],
['Ich freue mich, dich getroffen [zu haben~zu sein].','I am glad to have met you.'],
['Sie erinnert sich daran, eingeladen [worden zu sein~worden zu haben].','She remembers having been invited.'],
['Er gibt zu, den Fehler gemacht [zu haben~zu werden].','He admits having made the mistake.'],
['Die Gäste hoffen, abgeholt [zu werden~zu sein worden].','The guests hope to be picked up.'],
['Wir bedauern, so früh gegangen [zu sein~zu haben].','We regret having left so early.'],
['Er behauptet, informiert [worden zu sein~geworden haben].','He claims to have been informed.']
]},
{ id:'b2-2-4',title:'Process passive and state passive',outcome:'Distinguish an action being carried out from the resulting state.',pattern:'wird geöffnet · ist geöffnet · ist geöffnet worden',sources:['passive'],rules:[
'werden plus participle foregrounds a process; sein plus participle can describe the state resulting from an action.',
'Contrast die Tür wird geöffnet with die Tür ist geöffnet. State passive is not simply another tense of process passive.',
'The perfect process passive uses ist geöffnet worden; worden replaces geworden in this construction.',
'A state in the past can use war geöffnet or ist geöffnet gewesen. Context determines the appropriate tense.',
'Not every participial adjective is usefully analysed as state passive, and not every verb produces a natural result-state construction.',
'Ask whether the sentence reports an event, its completion, or the current state.'
],rows:[
['Die Tür [wird~werden] gerade geöffnet.','The door is being opened now.'],
['Die Tür [ist~werden] bereits geöffnet.','The door is already open.'],
['Die Datei ist gelöscht [worden~geworden].','The file has been deleted.'],
['Der Laden [war~waren] gestern geschlossen.','The shop was closed yesterday.'],
['Die Fenster [sind~ist] geöffnet.','The windows are open.'],
['Der Vertrag wurde gestern [unterschrieben~unterschreiben].','The contract was signed yesterday.'],
['Die Rechnung ist schon bezahlt [worden~werden].','The bill has already been paid.'],
['Das Gerät [ist~sein] ausgeschaltet.','The device is switched off.'],
['Die Straße wird morgen [gesperrt~sperren].','The road will be closed tomorrow.'],
['Die Aufgaben waren bereits [erledigt~erledigen].','The tasks were already done.']
]},
{ id:'b2-2-5',title:'Modal passive across tenses',outcome:'Express duties, possibilities and past requirements with a passive verb chain.',pattern:'muss geprüft werden · musste geprüft werden · hat geprüft werden müssen',sources:['passive','verbChains'],rules:[
'A present modal passive uses a finite modal, participle and werden: muss geprüft werden.',
'In a simple subordinate clause, the finite modal follows the passive infinitive: weil es geprüft werden muss.',
'For a past obligation, musste geprüft werden is often clearer than a long perfect chain.',
'Perfect modal passive uses haben and an Ersatzinfinitiv: hat geprüft werden müssen, not ist geprüft werden gemusst.',
'The auxiliary precedes the three-part infinitive group in the taught subordinate perfect order.',
'Keep the passive patient as subject and identify the modal meaning before assembling the chain.'
],rows:[
['Der Antrag muss geprüft [werden~sein worden].','The application must be checked.'],
['Die Daten dürfen nicht gelöscht [werden~haben].','The data must not be deleted.'],
['Wir wissen, dass die Datei gesichert werden [muss~müssen].','We know that the file must be backed up.'],
['Die Anlage musste repariert [werden~worden].','The system had to be repaired.'],
['Der Fehler [hat~ist] behoben werden müssen.','The error has had to be corrected.'],
['Die Gäste sollen informiert [werden~geworden].','The guests are to be informed.'],
['Die Aufgabe kann gemeinsam gelöst [werden~haben].','The task can be solved together.'],
['Die Regeln mussten erklärt [werden~geworden].','The rules had to be explained.'],
['Sie sagt, dass der Text [hat geändert werden müssen~geändert werden müssen hat].','She says that the text has had to be changed.'],
['Das Gerät hätte geprüft werden [müssen~gemusst].','The device would have had to be checked.']
]},
{ id:'b2-2-6',title:'Impersonal and recipient passive',outcome:'Describe activities without an accusative patient and foreground a recipient.',pattern:'hier wird gearbeitet · ihm wird geholfen · sie bekommt etwas erklärt',sources:['passive','fields'],rules:[
'An impersonal passive can have no nominative subject: hier wird gearbeitet. The finite verb is singular.',
'A dative complement remains dative in the werden-passive: dem Gast wird geholfen, not der Gast wird geholfen.',
'Initial es may fill the first field in es wird getanzt; it disappears when another phrase occupies that field.',
'bekommen plus participle can foreground a recipient: sie bekommt den Ablauf erklärt. A former accusative object remains accusative.',
'Recipient passive has lexical and register restrictions; not every dative verb permits it equally naturally.',
'Identify which object is promoted and which case stays unchanged; do not treat every passive as one transformation.'
],rows:[
['Hier [wird~werden] gearbeitet.','Work is being done here.'],
['[Ihm~Er] wird geholfen.','He is being helped.'],
['Heute wird im Saal [getanzt~tanzen].','There is dancing in the hall today.'],
['Sie bekommt den Ablauf [erklärt~erklären].','She has the procedure explained to her.'],
['Es [wird~werden] viel diskutiert.','There is much discussion.'],
['Den Gästen [wird~werden] gedankt.','The guests are being thanked.'],
['Er bekommt ein Paket [geschickt~schicken].','He is sent a parcel.'],
['Im Büro [wird~werden] telefoniert.','Phone calls are being made in the office.'],
['Wir bekommen die Unterlagen [ausgehändigt~aushändigen].','We are handed the documents.'],
['Der Patient bekommt die Wunde [verbunden~verbinden].','The patient has his wound dressed.']
]},
];
