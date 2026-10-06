import type { AdvancedDefinition } from './advanced-builder';
export const C1_STRUCTURES: AdvancedDefinition[] = [
{ id:'c1-1-1',title:'Rare case frames and mixed declension',outcome:'Handle genitive complements, double accusatives and nouns that differ from the regular weak pattern.',pattern:'einer Sache bedürfen · jemanden etwas lehren · des Namens / des Herzens',sources:['valency','nouns'],rules:[
'Formal verbs such as bedürfen, gedenken and sich erinnern in its formal genitive construction can select a genitive complement.',
'Other constructions of the same verb may use a preposition; memorise the meaning and register together with the frame.',
'fragen and some uses of lehren permit two accusatives. lehren also has established alternative constructions; do not generalise one frame to all contexts.',
'Mixed nouns such as Name have -n outside nominative singular and an additional genitive -s: den Namen, des Namens.',
'Herz is neuter with special inflection: des Herzens, dem Herzen, normally das Herz in nominative and accusative singular.',
'Identify lexical frame and noun inflection separately; a genitive article does not eliminate the noun’s required ending.'
],rows:[
['Der Vorschlag bedarf [einer~eine] Erklärung.','The proposal requires an explanation.'],
['Wir gedenken [der~die] Opfer.','We commemorate the victims.'],
['Sie beschuldigt ihn [des~den] Betrugs.','She accuses him of fraud.'],
['Der Lehrer lehrt [mich~ich] die Grundlagen.','The teacher teaches me the basics.'],
['Die Bedeutung des [Namens~Namen] ist unklar.','The meaning of the name is unclear.'],
['Er folgt seinem [Herzen~Herz].','He follows his heart.'],
['Die Untersuchung des [Herzens~Herzes] dauert lange.','The examination of the heart takes a long time.'],
['Ich frage [dich~dir] etwas Persönliches.','I ask you something personal.'],
['Wir erinnern uns [des~den] Verstorbenen.','We remember the deceased.'],
['Sie nennt den [Namen~Name] des Autors.','She names the author.']
]},
{ id:'c1-1-2',title:'Valency changes with meaning',outcome:'Choose a construction from the intended sense of a verb and preserve it when paraphrasing.',pattern:'bestehen aus / auf / in · halten für / halten von · sich handeln um',sources:['valency'],rules:[
'A verb can have several frames with different meanings: bestehen aus describes composition, bestehen auf insistence, bestehen in essence.',
'halten für assigns an evaluation to an accusative object; halten von asks for an opinion with a dative prepositional complement.',
'es handelt sich um identifies a topic or entity; handeln von describes what a text is about.',
'An argument can be necessary in one sense and optional in another. Similar spelling does not make frames interchangeable.',
'Transforming a clause into a noun phrase or passive can change surface structure while the semantic roles must remain recoverable.',
'Paraphrase the intended meaning in plain words before selecting the lexical construction.'
],rows:[
['Das Team besteht [aus~auf] fünf Personen.','The team consists of five people.'],
['Sie besteht [auf~aus] einer schriftlichen Antwort.','She insists on a written reply.'],
['Der Vorteil besteht [in~aus] der einfachen Bedienung.','The advantage lies in the simple operation.'],
['Ich halte den Vorschlag [für~von] sinnvoll.','I consider the proposal sensible.'],
['Was hältst du [von~für] diesem Plan?','What do you think of this plan?'],
['Es handelt sich [um~von] einen Irrtum.','It is a misunderstanding.'],
['Der Roman handelt [von~um] einer Familie.','The novel is about a family.'],
['Wir verfügen [über~für] genügend Mittel.','We have sufficient funds at our disposal.'],
['Sie verfügt eine Änderung [der~die] Regeln.','She orders a change to the rules.'],
['Er sorgt [für~über] die Sicherheit.','He ensures safety.']
]},
{ id:'c1-1-3',title:'Integrated and separate infinitive constructions',outcome:'Distinguish a unified predicate from a separate infinitive clause and interpret control carefully.',pattern:'sie scheint … zu … · sie hat … zu … versucht / sie hat versucht, … zu …',sources:['control','commas','fields'],rules:[
'An infinitive can belong to an integrated predicate or form a separate subordinate clause; surface zu alone does not decide.',
'scheinen, pflegen and modal-like brauchen often form integrated chains. A comma does not split such a predicate.',
'With verbs such as versuchen, integration can depend on arrangement: sie hat ihn zu überzeugen versucht differs structurally from sie hat versucht, ihn zu überzeugen.',
'Infinitive control is construction-sensitive. An object-controlled invitation or request is not equivalent to every subject-controlled verb.',
'A passive or embedded modal can affect how the understood actor is interpreted. Replace the infinitive with a finite clause if reference is unclear.',
'Identify the predicate boundaries and actor before judging comma placement or word order.'
],rows:[
['Sie scheint den Fehler bemerkt [zu haben~zu, haben].','She seems to have noticed the error.'],
['Er pflegt früh [aufzustehen~zu aufstehen].','He usually gets up early.'],
['Du brauchst das nicht [zu erklären~zu, erklären].','You do not need to explain that.'],
['Sie hat den Kunden [zu überzeugen~zu, überzeugen] versucht.','She has tried to convince the customer.'],
['Sie hat versucht[,~;] den Kunden zu überzeugen.','She has tried to convince the customer.'],
['Die Regel ist [zu befolgen~zu, befolgen].','The rule must be followed.'],
['Das Vorhaben droht [zu scheitern~scheitern zu].','The undertaking threatens to fail.'],
['Er bittet sie[,~;] den Bericht zu lesen.','He asks her to read the report.'],
['Wir haben den Wunsch[,~;] früher zu beginnen.','We have the wish to begin earlier.'],
['Das Projekt verspricht interessant [zu werden~werden zu].','The project promises to become interesting.']
]},
{ id:'c1-1-4',title:'Long modal, perfect and passive chains',outcome:'Assemble demanding verb groups by separating tense, voice and modal meaning.',pattern:'hätte geprüft werden müssen · weil es hat geprüft werden müssen',sources:['verbChains','passive','fields'],rules:[
'A long chain represents several choices: lexical action, passive perspective, modality, tense and mood.',
'Past counterfactual modal passive commonly uses hätte plus participle, werden and modal infinitive.',
'Perfect modal chains use haben even when the embedded lexical event alone forms its perfect with sein.',
'Finite haben stands before a modal Ersatzinfinitiv group in the taught subordinate perfect order; ordinary simple clauses follow ordinary final placement.',
'Several marked regional or historical orders exist. Produce the transparent neutral pattern rather than treating every corpus variant as a learner target.',
'Build from the inside out and consider replacing an overloaded chain with a simpler clause when the meaning remains intact.'
],rows:[
['Die Akte hätte geprüft werden [müssen~gemusst].','The file would have had to be checked.'],
['Er [hat~ist] früher gehen müssen.','He has had to leave earlier.'],
['Wir wissen, dass die Anlage [hat geprüft werden müssen~geprüft werden müssen hat].','We know that the system has had to be checked.'],
['Sie hätte informiert werden [sollen~gesollt].','She should have been informed.'],
['Der Termin hätte verschoben werden [können~gekonnt].','The appointment could have been postponed.'],
['Er sagt, dass sie [habe warten müssen~warten müssen habe].','He says that she has had to wait.'],
['Wir hätten früher beginnen [müssen~gemusst].','We should have begun earlier.'],
['Die Daten hätten gesichert werden [müssen~gemusst].','The data should have been backed up.'],
['Sie hat den Text übersetzen [lassen~gelassen].','She has had the text translated.'],
['Ich weiß, dass er die Datei [hat sichern lassen~sichern lassen hat].','I know that he has had the file backed up.']
]},
{ id:'c1-1-5',title:'Relative time in nested clauses',outcome:'Keep before, during and after relationships clear across several clause levels.',pattern:'bevor … · nachdem … · hatte …, als … · gleichzeitig / zuvor',sources:['time','connectors'],rules:[
'Tense is interpreted against a discourse reference point; nested clauses may introduce more than one reference point.',
'Plusquamperfekt often marks anteriority in past narrative, but temporal connectors can already make order clear.',
'Präsens and Perfekt can appear together when their time relationships warrant it. German has no general English-style backshift obligation.',
'In reports, distinguish the time of speaking from the time of the reported event. Dates and adverbs can prevent ambiguous reference.',
'Long temporal nesting is grammatically possible but costly to read. Divide a sentence when the sequence becomes difficult to reconstruct.',
'Write a timeline with every event and reference point; do not choose tense from the nearest verb alone.'
],rows:[
['Nachdem die Gäste gegangen [waren~hatten], begann sie aufzuräumen.','After the guests had left, she began to tidy up.'],
['Als er ankam, hatte ich bereits [gegessen~essen].','When he arrived, I had already eaten.'],
['Bevor wir den Vertrag unterschrieben, [hatten~hat] wir ihn geprüft.','Before we signed the contract, we had checked it.'],
['Sie sagte, der Zug sei bereits [abgefahren~abfahren].','She said that the train had already departed.'],
['Seit sie hier wohnt, [arbeitet~gearbeitet] sie im Museum.','Since she has lived here, she has worked in the museum.'],
['Während er schrieb, [las~lesen] sie die Unterlagen.','While he was writing, she read the documents.'],
['Nachdem wir angekommen [waren~hatten], riefen wir an.','After we had arrived, we called.'],
['Er berichtete, er [habe~haben] den Termin zuvor abgesagt.','He reported that he had cancelled the appointment beforehand.'],
['Sobald die Prüfung beendet ist, [werden~wird] wir informiert.','As soon as the examination is over, we will be informed.'],
['Bis dahin wird sie alles erledigt [haben~sein].','By then she will have done everything.']
]},
{ id:'c1-1-6',title:'Future in the past and reported perspective',outcome:'Express later events viewed from a past point without importing automatic English tense shifts.',pattern:'er sagte, er werde … · am nächsten Tag wollte … · sollte später …',sources:['time','reporting'],rules:[
'A past reporting verb does not require an automatic shift of every reported German tense.',
'Konjunktiv I werde plus infinitive can express an event later than the reported speaker’s reference point.',
'wollte can report a past intention; sollte can describe an anticipated or destined later event. These do not have identical meanings.',
'würde plus infinitive may be a reporting replacement or a hypothetical form. Make the intended reading clear from context.',
'Perspective-dependent adverbs such as morgen and damals need a recoverable date; am folgenden Tag can clarify a displaced report.',
'Distinguish future prediction, past intention, later factual development and counterfactual result.'
],rows:[
['Er sagte, er [werde~werden] am folgenden Tag anrufen.','He said that he would call the following day.'],
['Sie erklärte, die Arbeit werde bald [beginnen~begonnen].','She explained that the work would begin soon.'],
['Damals [wollte~wollen] er Arzt werden.','At that time he wanted to become a doctor.'],
['Dieser Entschluss [sollte~sollen] später wichtig werden.','This decision was to become important later.'],
['Sie sagte, sie [werde~werden] bis Freitag alles erledigt haben.','She said that she would have done everything by Friday.'],
['Er kündigte an, das Team [werde~werden] im Juni kommen.','He announced that the team would come in June.'],
['Wir [wollten~wollte] am nächsten Tag abreisen.','We wanted to leave the next day.'],
['Die Sprecherin erklärte, der Vertrag [werde~werden] verlängert werden.','The spokesperson explained that the contract would be extended.'],
['Niemand wusste, was später geschehen [würde~würden].','Nobody knew what would happen later.'],
['Sie versprach, am folgenden Morgen [zu antworten~antworten zu].','She promised to reply the following morning.']
]},
{ id:'c1-2-1',title:'Passive limits and case preservation',outcome:'Recognise where passive is possible and avoid mechanical subject–object swapping.',pattern:'ihm wird geholfen · es wird gearbeitet · besitzen / haben: keine mechanische Passivbildung',sources:['passive','valency'],rules:[
'A common transitive action permits accusative-to-nominative promotion, but passive availability also depends on lexical meaning.',
'Dative objects stay dative in the werden-passive; an impersonal passive can remain subjectless and singular.',
'Possession and many state predicates such as haben do not normally form a corresponding event passive.',
'Reflexive and lexicalised expressions require individual analysis; do not manufacture a passive from every accusative-looking phrase.',
'An agent may be introduced with von; durch often describes a means or cause. This is a useful distinction, not an absolute ban on variation.',
'Check whether the verb denotes a passivisable event and preserve every complement that is not promoted.'
],rows:[
['[Dem~Den] Patienten wird geholfen.','The patient is being helped.'],
['Die Daten [werden~wird] geprüft.','The data are being checked.'],
['Hier [wird~werden] gearbeitet.','Work is being done here.'],
['Der Bericht wurde [von~für] einer Expertin verfasst.','The report was written by an expert.'],
['Das Gebäude wurde [durch~an] den Sturm beschädigt.','The building was damaged by the storm.'],
['[Ihnen~Sie] wird widersprochen.','They are being contradicted.'],
['Den Gästen [wird~werden] gedankt.','The guests are being thanked.'],
['Die Antwort ist noch nicht geprüft [worden~geworden].','The answer has not yet been checked.'],
['Im Saal [wurde~wurden] gelacht.','There was laughter in the hall.'],
['Das Buch gehört [mir~mich].','The book belongs to me.']
]},
{ id:'c1-2-2',title:'Recipient perspective and register',outcome:'Use bekommen and erhalten constructions deliberately and contrast them with active and werden-passive.',pattern:'sie bekommt den Ablauf erklärt · man erklärt ihr … · ihr wird … erklärt',sources:['passive','valency'],rules:[
'Recipient passive promotes a recipient to nominative while retaining an accusative thing: sie bekommt den Ablauf erklärt.',
'bekommen-passive is established in standard German, though constructions and register preferences vary by verb and context.',
'kriegen is more conversational; erhalten may sound more formal but is not an automatic replacement in every construction.',
'A simple haben or bekommen plus noun can express ordinary possession or receipt rather than passive.',
'Changing perspective must not change the participant roles. Keep the original recipient and transferred or affected thing identifiable.',
'Compare three versions: active agent, werden-passive patient, and recipient passive; choose the perspective needed by the text.'
],rows:[
['Die Studentin bekommt die Aufgabe [erklärt~erklären].','The student has the task explained to her.'],
['Der Kunde bekommt den Betrag [erstattet~erstatten].','The customer has the amount refunded to him.'],
['Wir bekommen die Ergebnisse [mitgeteilt~mitteilen].','We are told the results.'],
['Die Kinder bekommen eine Geschichte [vorgelesen~vorlesen].','The children have a story read to them.'],
['Der Gast bekommt den Weg [gezeigt~zeigen].','The guest is shown the way.'],
['Man erklärt [ihr~sie] die Aufgabe.','They explain the task to her.'],
['Die Aufgabe wird [ihr~sie] erklärt.','The task is explained to her.'],
['Er bekommt die Haare [geschnitten~schneiden].','He has his hair cut.'],
['Sie bekommt ein neues Gerät [geliefert~liefern].','She has a new device delivered to her.'],
['Wir bekommen die Formulare [zugeschickt~zuschicken].','We are sent the forms.']
]},
{ id:'c1-2-3',title:'Precise passive alternatives and modality',outcome:'Preserve obligation, possibility and agency when transforming passive sentences.',pattern:'muss … werden ↔ ist … zu … · kann … werden ↔ lässt sich …',sources:['passive','modals','valency'],rules:[
'sein plus zu-infinitive can express an obligation or possibility depending on context; it is not always equivalent to müssen.',
'sich lassen plus infinitive often expresses feasibility, not a duty: das lässt sich lösen.',
'An adjective in -bar can express possibility, but lexical meaning and idiomatic restrictions must be checked.',
'man plus active verb supplies an indefinite human actor. It can lose useful information about a named agent.',
'haben plus zu-infinitive normally assigns a requirement to its subject; sein plus zu-infinitive foregrounds the patient.',
'Before rewriting, state the modal meaning and participant roles; compare the paraphrase against both.'
],rows:[
['Die Vorschriften sind [zu beachten~beachten zu].','The regulations must be observed.'],
['Das Problem lässt sich [lösen~zu lösen].','The problem can be solved.'],
['Der Text ist gut [lesbar~Lesbare].','The text is easy to read.'],
['Wir haben den Termin [einzuhalten~zu einhalten].','We must keep to the appointment.'],
['Der Fehler ist leicht [zu beheben~beheben zu].','The error is easy to correct.'],
['Die Datei kann wiederhergestellt [werden~haben].','The file can be restored.'],
['Man muss die Regeln [beachten~zu beachten].','One must observe the rules.'],
['Das Gerät lässt sich nicht [reparieren~zu reparieren].','The device cannot be repaired.'],
['Die Unterlagen sind fristgerecht [einzureichen~zu einreichen].','The documents must be submitted on time.'],
['Diese Behauptung ist [überprüfbar~Überprüfbarkeit].','This claim can be checked.']
]},
{ id:'c1-2-4',title:'Synthetic Konjunktiv II and würde choices',outcome:'Choose clear potential or counterfactual forms while avoiding unnecessary würde chains.',pattern:'wäre · hätte · könnte · käme · würde kommen',sources:['subjunctive','reporting'],rules:[
'Konjunktiv II can express an unreal situation, a cautious possibility, politeness or a reporting replacement; context determines its function.',
'Short forms wäre, hätte, könnte, müsste and sollte are common and usually clearer than long würde combinations.',
'Synthetic forms such as käme and gäbe remain useful; other forms may be literary or ambiguous with indicative preterite.',
'würde plus infinitive is an established alternative for many lexical verbs. It is not inherently incorrect or always less advanced.',
'Past counterfactuals use hätte or wäre plus participle; a present-looking form can still refer to a future hypothetical event.',
'Choose the shortest unambiguous form that matches meaning and register; do not replace every lexical verb mechanically.'
],rows:[
['Ich [wäre~wären] gern dabei.','I would like to be there.'],
['Wenn es eine Lösung [gäbe~geben], würden wir sie nutzen.','If there were a solution, we would use it.'],
['Er [käme~kommen] früher, wenn er könnte.','He would come earlier if he could.'],
['Sie [hätte~haben] gern mehr Zeit.','She would like to have more time.'],
['Wir [könnten~könnte] den Termin verschieben.','We could postpone the appointment.'],
['Du [müsstest~müssten] genauer erklären, was du meinst.','You would have to explain more precisely what you mean.'],
['Ich würde den Vorschlag [prüfen~geprüft].','I would check the proposal.'],
['Wenn er geblieben wäre, [hätten~hätte] wir gesprochen.','If he had stayed, we would have talked.'],
['Das [ließe~lassen] sich ändern.','That could be changed.'],
['Sie [sollte~sollen] die Quelle nennen.','She should name the source.']
]},
{ id:'c1-2-5',title:'Counterfactual concession and excluded consequence',outcome:'Use unreal concession, irrealis consequences and modal counterfactuals with distinct time reference.',pattern:'selbst wenn … hätte … · zu …, als dass … könnte · ohne … wäre …',sources:['subjunctive','connectors'],rules:[
'selbst wenn presents a condition that would not change the result. It can be factual, potential or counterfactual according to tense and context.',
'An unreal past concession uses past Konjunktiv II, while its result can be present or past.',
'zu plus degree expression and als dass often introduces an excluded possibility with Konjunktiv II.',
'Past modal counterfactuals use hätte plus lexical infinitive and modal Ersatzinfinitiv: hätte helfen können.',
'ohne plus noun phrase can state an unreal missing condition: ohne deine Hilfe wäre das nicht gelungen.',
'Distinguish a conceding condition from a causal explanation and label the time of each event separately.'
],rows:[
['Selbst wenn er Zeit hätte, [würde~werden] er nicht kommen.','Even if he had time, he would not come.'],
['Selbst wenn wir früher begonnen hätten, [wären~war] wir nicht fertig geworden.','Even if we had begun earlier, we would not have finished.'],
['Der Text ist zu kurz, als dass er alles erklären [könnte~könnten].','The text is too short to explain everything.'],
['Ohne deine Hilfe [wäre~hätte] das nicht gelungen.','Without your help, that would not have succeeded.'],
['Sie hätte uns helfen [können~gekonnt].','She could have helped us.'],
['Er hätte früher kommen [müssen~gemusst].','He should have come earlier.'],
['Selbst wenn das stimmen würde, [bliebe~bleiben] die Frage offen.','Even if that were true, the question would remain open.'],
['Die Daten sind zu ungenau, als dass wir sicher urteilen [könnten~könnte].','The data are too imprecise for us to judge confidently.'],
['Ohne den Hinweis hätten wir den Fehler nicht [bemerkt~bemerken].','Without the hint, we would not have noticed the error.'],
['Sie hätte informiert werden [sollen~gesollt].','She should have been informed.']
]},
{ id:'c1-2-6',title:'Evidence, certainty and hedging',outcome:'Distinguish strong inference, possibility, cautious probability and attributed evidence.',pattern:'dürfte · müsste · könnte · mag · offenbar / angeblich / vermutlich',sources:['modals','reporting'],rules:[
'Choose certainty from the evidence, not from a fixed numerical ranking of modal verbs.',
'müsste can express an inference conditional on assumptions; dürfte often presents cautious probability; könnte presents a possibility.',
'mag can concede a possible truth while leaving an objection open: das mag stimmen, aber …',
'offenbar presents apparent evidence, vermutlich an inference, and angeblich an attributed claim often with distance; they are not synonyms in every context.',
'A hedged sentence is still a claim. Identify the source, assumptions and limits rather than piling up uncertainty words.',
'Ask whether you know, infer, allow a possibility or repeat another source; select one clear formulation.'
],rows:[
['Nach diesen Zahlen [dürfte~dürften] die Nachfrage steigen.','Given these figures, demand will probably rise.'],
['Wenn die Uhr stimmt, [müsste~müssten] der Zug gleich kommen.','If the clock is correct, the train should arrive soon.'],
['Das [könnte~könnten] die Ursache sein.','That could be the cause.'],
['Das [mag~mögen] stimmen, erklärt aber nicht alles.','That may be true, but it does not explain everything.'],
['Die Ergebnisse [dürften~dürfte] vergleichbar sein.','The results are probably comparable.'],
['Er müsste die Nachricht erhalten [haben~sein].','He should have received the message.'],
['Sie könnte bereits gegangen [sein~haben].','She could already have left.'],
['Der Bericht soll unabhängig geprüft worden [sein~haben].','The report is said to have been checked independently.'],
['Die Daten [müssen~muss] fehlerhaft sein.','The data must be faulty.'],
['Diese Erklärung [kann~können] nicht ausgeschlossen werden.','This explanation cannot be ruled out.']
]},
];
