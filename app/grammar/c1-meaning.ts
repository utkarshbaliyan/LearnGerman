import type { AdvancedDefinition } from './advanced-builder';
export const C1_MEANING: AdvancedDefinition[] = [
{ id:'c1-3-1',title:'Sustained indirect reporting',outcome:'Maintain attribution, person and tense across a paragraph rather than one isolated reported sentence.',pattern:'sie erklärt, … sei …; außerdem habe …; später werde …',sources:['reporting','time'],rules:[
'Introduce the source clearly before a sequence of indirect statements; readers should know whose perspective each proposition represents.',
'Konjunktiv I can sustain indirect reporting without repeating dass in every sentence. Replacement forms resolve ambiguous forms.',
'Maintain anteriority with reported perfect and future reference with werde where required; avoid mechanical English backshift.',
'A completed reported passive event uses sei plus participle and worden; a present process uses werde plus participle, and a reported state can use sei plus a participial adjective.',
'If you switch from reporting to your own evaluation, mark the boundary explicitly with a source or evaluative phrase.',
'Reread the paragraph as a source map: who claims each point, at what time, and with what evidential status?'
],rows:[
['Die Leiterin erklärt, die Studie [sei~seien] abgeschlossen.','The director explains that the study is complete.'],
['Außerdem [habe~haben] das Team alle Daten geprüft.','Furthermore, the team has checked all the data, according to the report.'],
['Die Ergebnisse [seien~sei] unabhängig bestätigt worden.','The results have been confirmed independently, according to the report.'],
['Eine zweite Untersuchung [werde~werden] im Juni beginnen.','A second investigation will begin in June, according to the report.'],
['Die Sprecherin betont, niemand [habe~haben] Druck ausgeübt.','The spokesperson stresses that nobody has exerted pressure.'],
['Sie fügt hinzu, die Kosten [seien~sei] begrenzt.','She adds that the costs are limited.'],
['Der Bericht erklärt, die Methode [könne~können] verbessert werden.','The report explains that the method can be improved.'],
['Die Verantwortlichen [hätten~hätte] früh reagiert, erklärt sie.','Those responsible responded early, she explains.'],
['Er berichtet, die Sitzung [sei~habe] verschoben worden.','He reports that the meeting has been postponed.'],
['Die Zeugin sagt, sie [habe~haben] den Mann zuvor nicht gesehen.','The witness says that she had not seen the man before.']
]},
{ id:'c1-3-2',title:'Attribution versus assertion',outcome:'Make the boundary between source claims, observed facts and your own conclusions explicit.',pattern:'laut / zufolge · die Autorin behauptet … · daraus folgt nicht, dass …',sources:['reporting','valency','modals'],rules:[
'Konjunktiv marks attribution, while reporting verbs such as behaupten, erklären and nachweisen contribute their own evaluative meaning.',
'laut and zufolge identify a source; zufolge commonly follows a dative noun phrase, while laut permits established case variation.',
'Repeating a claim does not establish it. Distinguish the source’s conclusion from your own assessment with explicit phrasing.',
'An indicative sentence can assert information or remain inside contextually clear reporting. Mood alone does not encode every evidential distinction.',
'When comparing sources, keep reference chains explicit and avoid a pronoun that could name either author.',
'For each sentence label source, evidence and inference; then choose the reporting form and verb deliberately.'
],rows:[
['Dem Bericht [zufolge~zufolgen] steigen die Kosten.','According to the report, costs are rising.'],
['Die Autorin behauptet, die Methode [sei~seien] zuverlässig.','The author claims that the method is reliable.'],
['Daraus folgt nicht, [dass~das] alle Fälle vergleichbar sind.','It does not follow from that that all cases are comparable.'],
['Die Daten deuten [darauf~damit] hin, dass sich etwas verändert hat.','The data suggest that something has changed.'],
['Nach Ansicht [der~die] Forscherin fehlt ein Vergleich.','In the researcher’s view, a comparison is missing.'],
['Er bestreitet, den Bericht gelesen [zu haben~zu sein].','He denies having read the report.'],
['Die Studie weist [nach~anzu], dass der Effekt besteht.','The study demonstrates that the effect exists.'],
['Wir beziehen uns [auf~von] die erste Untersuchung.','We refer to the first investigation.'],
['Der Autor räumt ein, er [habe~haben] einen Fehler gemacht.','The author admits that he has made a mistake.'],
['Die Behauptung bedarf [einer~eine] Prüfung.','The claim requires examination.']
]},
{ id:'c1-3-3',title:'Restricted and exceptional conditions',outcome:'Express conditions, limits and exceptions with sofern, soweit, vorausgesetzt and es sei denn.',pattern:'sofern … · soweit … · vorausgesetzt, dass … · es sei denn, …',sources:['connectors','subjunctive'],rules:[
'sofern gives a condition or qualification; soweit can limit the extent of a claim or refer to the speaker’s available knowledge.',
'vorausgesetzt, dass makes a prerequisite explicit. A clause without dass can have a different, often verb-second, structure.',
'es sei denn introduces an exception. Without a further connector, the following clause commonly has main-clause order.',
'With es sei denn, dass the embedded clause has final finite verb. Do not mix the two structural patterns.',
'Only if and unless reverse different logical relationships; state the underlying condition in plain words before translating.',
'Check whether the connector adds a prerequisite, a knowledge limit or an exception, then select its clause order.'
],rows:[
['Wir beginnen, sofern alle [zustimmen~stimmen zu].','We begin provided everyone agrees.'],
['Soweit ich weiß, [ist~sein] der Termin bestätigt.','As far as I know, the appointment is confirmed.'],
['Wir kommen, vorausgesetzt, [dass~ob] der Zug fährt.','We come provided that the train runs.'],
['Ich bleibe, es sei denn, ich [werde~werden] gebraucht.','I stay unless I am needed.'],
['Wir fahren, es sei denn, dass es [schneit~schneien].','We travel unless it snows.'],
['Sofern die Daten vollständig sind, [können~kann] wir beginnen.','Provided the data are complete, we can begin.'],
['Soweit die Mittel reichen, [unterstützen~unterstützt] wir das Projekt.','We support the project as far as the funds allow.'],
['Wir stimmen zu, vorausgesetzt, dass die Regeln [gelten~gilt].','We agree provided that the rules apply.'],
['Der Kurs findet statt, es sei denn, die Lehrerin [ist~sein] krank.','The course takes place unless the teacher is ill.'],
['Nur wenn du zustimmst, [beginnen~beginnt] wir.','Only if you agree do we begin.']
]},
{ id:'c1-3-4',title:'Concession and contrast in formal prose',outcome:'Distinguish conceded facts, hypothetical concessions and direct contrasts.',pattern:'wenngleich … · auch wenn … · selbst wenn … · zwar …, aber …',sources:['connectors'],rules:[
'obwohl and wenngleich typically concede a proposition while the main clause presents a contrasting outcome.',
'auch wenn can concede an actual circumstance or a hypothetical one; selbst wenn emphasises that even this condition would not change the result.',
'wohingegen and adversative während contrast two propositions rather than necessarily expressing an unexpected outcome.',
'zwar … aber marks a concession across coordinated structures. Keep the corresponding phrases or clauses parallel.',
'Concessive connectors do not license arbitrary contradiction; make the expected relationship understandable from context.',
'Ask whether you concede a fact, imagine a limiting condition or compare two contrasting situations.'
],rows:[
['Wenngleich die Daten unvollständig sind, [erkennen~erkennt] wir einen Trend.','Although the data are incomplete, we recognise a trend.'],
['Auch wenn es regnet, [gehen~geht] wir hinaus.','Even if it rains, we go outside.'],
['Selbst wenn er zustimmte, [bliebe~bleiben] das Problem bestehen.','Even if he agreed, the problem would remain.'],
['Sie ist zwar müde, [aber~aber dass] sie arbeitet weiter.','She is tired, but she continues working.'],
['Er bevorzugt Zahlen, wohingegen sie Beispiele [verwendet~verwenden].','He prefers figures, whereas she uses examples.'],
['Obwohl wir früh begannen, [wurden~wurde] wir nicht fertig.','Although we began early, we did not finish.'],
['Während die Kosten steigen, [sinkt~sinken] die Nachfrage.','Whereas costs rise, demand falls.'],
['Wenngleich der Text kurz ist, [enthält~enthalten] er viele Details.','Although the text is short, it contains many details.'],
['Das Gerät ist zwar teuer, [aber~weil dass] zuverlässig.','The device is expensive, but reliable.'],
['Selbst wenn wir mehr Zeit hätten, [könnten~könnte] wir nicht alles prüfen.','Even if we had more time, we could not check everything.']
]},
{ id:'c1-3-5',title:'Formal cause, grounds and consequences',outcome:'Use causal and consequential connectors with their correct syntactic class.',pattern:'zumal … · da … · folglich / demnach + Verbzweit · aufgrund + Genitiv',sources:['connectors','valency'],rules:[
'weil and da introduce subordinate reasons; zumal often supplies an additional especially relevant reason.',
'Adverbial connectors such as folglich, demnach and infolgedessen occupy a main-clause position and do not cause subordinate verb-final order.',
'Prepositions such as aufgrund and infolge introduce noun phrases, normally genitive in careful formal production.',
'denn coordinates clauses with their usual main-clause order; conversational weil with verb-second has interactional uses but is not the neutral formal model.',
'A logical conclusion is stronger than a temporal sequence. Do not use folglich merely because one event follows another.',
'Classify the connector as conjunction, subordinator, adverb or preposition before choosing sentence structure.'
],rows:[
['Wir verschieben die Sitzung, zumal zwei Mitglieder [fehlen~fehlt].','We postpone the meeting, especially since two members are absent.'],
['Die Daten sind unvollständig; folglich [können~kann] wir nicht urteilen.','The data are incomplete; consequently, we cannot judge.'],
['Aufgrund [des~den] Defekts fällt die Anlage aus.','Because of the defect, the system fails.'],
['Da die Frist endet, [müssen~muss] wir antworten.','Since the deadline is ending, we must reply.'],
['Er fehlt, denn er [ist~sein] krank.','He is absent because he is ill.'],
['Infolge [der~die] Störung wurde der Betrieb eingestellt.','As a result of the disruption, operations were stopped.'],
['Die Kosten steigen; demnach [brauchen~braucht] wir mehr Mittel.','Costs are rising; accordingly, we need more funds.'],
['Wir helfen, zumal die Aufgabe schwierig [ist~sein].','We help, especially since the task is difficult.'],
['Weil die Leitung beschädigt ist, [bleibt~bleiben] das Büro geschlossen.','Because the line is damaged, the office remains closed.'],
['Die Prüfung ist beendet; infolgedessen [werden~wird] die Daten freigegeben.','The examination is complete; as a result, the data are released.']
]},
{ id:'c1-3-6',title:'Restriction, explanation and alternatives',outcome:'Limit a statement, explain a term and formulate alternative relationships without connector confusion.',pattern:'insofern, als … · außer dass … · beziehungsweise · das heißt',sources:['connectors','commas'],rules:[
'insofern, als introduces a respect in which a claim is valid; it does not necessarily give a straightforward cause.',
'außer dass can mark an exception to a statement. The exception clause keeps subordinate word order.',
'das heißt introduces clarification; punctuation and clause order follow the actual explanatory structure.',
'beziehungsweise can coordinate corresponding alternatives, but overuse obscures whether you mean or, and, or a paired mapping.',
'entweder … oder and nicht nur … sondern auch need parallel elements of comparable grammatical function.',
'Replace an ambiguous connector with the explicit intended relationship before compressing the sentence.'
],rows:[
['Der Vergleich ist insofern sinnvoll, [als~weil dass] beide Gruppen ähnlich sind.','The comparison is useful insofar as both groups are similar.'],
['Alles ist geklärt, außer dass der Termin noch [fehlt~fehlen].','Everything is settled except that the date is still missing.'],
['Die Frist endet heute, das [heißt~heißen], wir müssen sofort antworten.','The deadline ends today; that means we must reply immediately.'],
['Wir brauchen nicht nur Daten, [sondern~aber dass] auch Beispiele.','We need not only data but also examples.'],
['Entweder du antwortest, [oder~oder dass] ich frage jemand anderen.','Either you reply or I ask someone else.'],
['Der Vorschlag ist insofern hilfreich, als er die Kosten [senkt~senken].','The proposal is helpful insofar as it reduces the costs.'],
['Sie erklärt alles, außer dass sie die Quelle nicht [nennt~nennen].','She explains everything except that she does not name the source.'],
['Die Sitzung wird verschoben, das heißt, sie findet später [statt~zu statt].','The meeting is postponed; that means it takes place later.'],
['Sowohl die Methode als auch das Ergebnis [werden~wird] geprüft.','Both the method and the result are checked.'],
['Er schreibt nicht nur klar, sondern auch [präzise~präziserweise].','He writes not only clearly but also precisely.']
]},
{ id:'c1-4-1',title:'Layered attributes and ambiguity',outcome:'Read and compose complex noun phrases while controlling attachment and scope.',pattern:'die von der Kommission gestern beschlossene Änderung des Gesetzes',sources:['attributes','valency'],rules:[
'Find the noun phrase’s head before processing stacked adjectives, participles, genitives and prepositional attributes.',
'Attributive endings attach to the head noun; internal complements retain the case assigned by their own preposition or verb.',
'A prepositional phrase may attach to a noun or a verb. Word order alone may not remove every ambiguity.',
'Genitive chains can obscure agent and patient relations. Expand an attribute into a relative clause when needed.',
'Multiple attributes need not be separated by commas if one modifies the whole following combination rather than coordinating equal descriptions.',
'Bracket each modifier and ask exactly which word it describes; revise until the intended reading is easy to recover.'
],rows:[
['Die gestern [beschlossene~beschlossen] Änderung tritt morgen in Kraft.','The change decided yesterday takes effect tomorrow.'],
['Wir prüfen den von der Kommission [verfassten~verfasste] Bericht.','We examine the report written by the commission.'],
['Die Einführung [des~den] neuen Systems dauert lange.','The introduction of the new system takes a long time.'],
['Die an der Studie [beteiligten~beteiligte] Fachleute treffen sich.','The specialists involved in the study meet.'],
['Eine für alle [verständliche~verständlich] Erklärung fehlt.','An explanation understandable to everyone is missing.'],
['Sie liest die gestern von uns [gesammelten~gesammelte] Notizen.','She reads the notes collected by us yesterday.'],
['Der Leiter [der~die] neu gegründeten Abteilung spricht.','The head of the newly established department speaks.'],
['Wir arbeiten mit einem international [anerkannten~anerkannte] Institut.','We work with an internationally recognised institute.'],
['Die im Vertrag [festgelegten~festgelegte] Regeln gelten.','The rules laid down in the contract apply.'],
['Er erläutert einen schwer zu [begründenden~begründen] Unterschied.','He explains a distinction that is difficult to justify.']
]},
{ id:'c1-4-2',title:'Apposition and case agreement',outcome:'Use close titles, explanatory appositions and comparison phrases without losing case.',pattern:'Frau Keller · mit Frau Keller, unserer Leiterin, … · als erfahrenem Berater',sources:['attributes','nouns'],rules:[
'A loose explanatory apposition is normally comma-framed and, in the taught standard pattern, agrees in case with its reference noun.',
'Close titles and names such as Frau Keller form a different structure and are not automatically comma-framed.',
'Case agreement in complex appositions has documented variation. Prefer an unambiguous agreed model in careful production.',
'An als-phrase closely linked to a case-marked noun or pronoun often follows its case: mit ihm als erfahrenem Berater.',
'An als-predicative referring to the subject is commonly nominative: er arbeitet als erfahrener Berater.',
'Decide whether the added phrase renames a noun, identifies a role or refers predicatively to the subject.'
],rows:[
['Wir sprechen mit Frau Keller, [unserer~unsere] Leiterin.','We speak with Ms Keller, our director.'],
['Herr Klein, [unser~unseren] neuer Kollege, kommt morgen.','Mr Klein, our new colleague, is coming tomorrow.'],
['Sie begrüßt Herrn Wolf, [den~dem] neuen Sprecher.','She welcomes Mr Wolf, the new spokesperson.'],
['Mit ihm als [erfahrenem~erfahrenen] Berater planen wir besser.','With him as an experienced adviser, we plan better.'],
['Er arbeitet als [erfahrener~erfahrenem] Berater.','He works as an experienced adviser.'],
['Wir danken Anna, [unserer~unsere] Assistentin.','We thank Anna, our assistant.'],
['Die Stadt Bonn, [ein~einen] wichtiger Standort, wächst.','The city of Bonn, an important location, is growing.'],
['Ich frage Dr. Meyer, [unseren~unserem] Experten.','I ask Dr Meyer, our expert.'],
['Die Arbeit mit ihr als [zuständiger~zuständige] Ärztin ist hilfreich.','Working with her as the responsible doctor is helpful.'],
['Sie ist als [kompetente~kompetenter] Leiterin bekannt.','She is known as a competent director.']
]},
{ id:'c1-4-3',title:'Agreement with quantities and coordinated subjects',outcome:'Identify the grammatical head and recognise genuine agreement variation with quantities.',pattern:'eine Reihe von … · zwei Drittel … · sowohl … als auch …',sources:['agreement','attributes'],rules:[
'Subject–verb agreement normally follows the nominative subject’s grammatical number, not the nearest noun.',
'A singular head in a quantity expression often takes singular agreement, but semantic plural agreement is possible in some constructions.',
'Coordinated independent subjects with und or sowohl … als auch normally lead to plural agreement.',
'Percentages and fractions depend on the expression and what is quantified; established singular/plural variation prevents one universal rule.',
'An embedded relative clause agrees with its own relative subject, whose antecedent may differ from the matrix clause head.',
'Find the actual subject in each clause and do not mark documented quantity variation as a universal grammatical error.'
],rows:[
['Die Zahl der Bewerbungen [ist~hat] gestiegen.','The number of applications has risen.'],
['Sowohl die Leiterin als auch der Sprecher [kommen~kommt].','Both the director and the spokesperson are coming.'],
['Die Ergebnisse der Prüfung [liegen~liegt] vor.','The results of the examination are available.'],
['Jeder der Gäste [hat~haben] geantwortet.','Each of the guests has replied.'],
['Die Hälfte des Geldes [fehlt~fehlen].','Half of the money is missing.'],
['Zwei Drittel der Stimmen [entfallen~entfällt] auf sie.','Two thirds of the votes go to her.'],
['Die Gruppe der Forschenden [arbeitet~gearbeitet] weiter.','The group of researchers continues working.'],
['Anna und Tim [sind~ist] angekommen.','Anna and Tim have arrived.'],
['Die Unterlagen, die auf dem Tisch [liegen~liegt], sind wichtig.','The documents that are on the table are important.'],
['Keiner der Vorschläge [überzeugt~überzeugen] mich.','None of the proposals convinces me.']
]},
{ id:'c1-4-4',title:'Nominalisation with explicit participants',outcome:'Avoid ambiguous genitives and preserve roles, time and modality in formal noun phrases.',pattern:'die Prüfung der Daten durch das Team · die Pflicht zur … · die Möglichkeit, …',sources:['nominal','valency','attributes'],rules:[
'An action noun’s genitive can identify an actor or a patient; die Untersuchung des Arztes can be ambiguous without context.',
'Use durch for an explicit agent, a lexical preposition for a required complement, or a full clause to remove uncertainty.',
'Nominal style often hides tense and modality. Preserve them through dates, adjectives, modal nouns or a verbal paraphrase.',
'Derived nouns may select different complements from their source verbs. Do not assume every object becomes genitive.',
'A sequence of several nominalisations can sound precise while withholding responsibility. Prefer active clauses when the actor matters.',
'Expand every action noun into who does what to whom; add missing participants before compressing again.'
],rows:[
['Die Prüfung der Daten [durch~auf] das Team beginnt heute.','The checking of the data by the team begins today.'],
['Sein Interesse [an~auf] der Forschung ist groß.','His interest in the research is great.'],
['Die Entscheidung [für~von] den Vorschlag fiel gestern.','The decision in favour of the proposal was made yesterday.'],
['Die Pflicht [zur~für die zur] Anmeldung bleibt bestehen.','The obligation to register remains.'],
['Die Möglichkeit, früher [zu beginnen~beginnen zu], hilft uns.','The possibility of beginning earlier helps us.'],
['Die Erinnerung [an~für] das Ereignis bleibt.','The memory of the event remains.'],
['Die Zustimmung [zu~auf] dem Vertrag fehlt.','Approval of the contract is missing.'],
['Die Beteiligung [an~auf] der Studie ist freiwillig.','Participation in the study is voluntary.'],
['Die Ablehnung [des~den] Antrags wird begründet.','The rejection of the application is explained.'],
['Die gestern erfolgte Einführung [des~den] Systems war erfolgreich.','The introduction of the system that took place yesterday was successful.']
]},
{ id:'c1-4-5',title:'Derivation, prefix stress and lexical limits',outcome:'Connect word formation with separability, participles and changes of meaning.',pattern:'übersetzen / über|setzen · umfahren / um|fahren · -bar / -lich / -ung',sources:['wordFormation','verbChains'],rules:[
'Some prefixes have separable and inseparable uses with different stress and meaning; spelling alone may not distinguish the infinitive.',
'Inseparable übersetzen meaning translate forms übersetzt; separable über|setzen meaning ferry across forms übergesetzt.',
'Inseparable umfahren can mean drive around; separable um|fahren can mean knock over with a vehicle.',
'Derivational suffixes contribute tendencies, not mechanically guaranteed meanings. Learn conventional words alongside productive patterns.',
'A category change affects inflection and capitalisation: prüfen, prüfbar, die Prüfung, das Prüfen.',
'Link sound, meaning, finite clause and participle; verify a doubtful derived word rather than inventing it by rule alone.'
],rows:[
['Sie hat den Text [übersetzt~übergesetzt].','She has translated the text.'],
['Der Fährmann hat uns [übergesetzt~übersetzt].','The ferryman has taken us across.'],
['Er hat die Baustelle [umfahren~umgefahren].','He has driven around the construction site.'],
['Das Auto hat den Pfosten [umgefahren~umfahren].','The car has knocked over the post.'],
['[Die~Das] Prüfung beginnt morgen.','The examination begins tomorrow.'],
['Die Angaben sind [prüfbar~Prüfbarkeit].','The information can be checked.'],
['Er [übersetzt~setzt über] den Roman ins Deutsche.','He translates the novel into German.'],
['Der Fährmann setzt die Gäste [über~übersetzen].','The ferryman takes the guests across.'],
['Beim [Prüfen~prüfend] entdeckt sie einen Fehler.','While checking, she discovers an error.'],
['Der Text ist [unverständlich~Unverständlichkeit].','The text is incomprehensible.']
]},
{ id:'c1-4-6',title:'Reference chains and recoverable ellipsis',outcome:'Keep people and propositions identifiable and omit only material that readers can reconstruct.',pattern:'dies / das / dieser · die Studie / deren Ergebnis · parallele Auslassung',sources:['relatives','fields','connectors'],rules:[
'Personal pronouns agree with their antecedent’s gender and number; grammatical agreement alone does not resolve two plausible antecedents.',
'dies or das can refer to a whole proposition. A demonstrative noun phrase can make the intended reference more explicit.',
'dessen and deren encode genitive reference, but the possessor’s identity must still be clear from context.',
'Ellipsis omits recoverable material in parallel constructions. Keep omitted grammatical roles and verb forms compatible.',
'If a pronoun or omission permits a materially different interpretation, repeat the noun or divide the sentence.',
'Trace each pronoun to exactly one intended referent, then reconstruct each omitted phrase to test the structure.'
],rows:[
['Die Studie ist neu; [ihr~sein] Ergebnis überrascht uns.','The study is new; its result surprises us.'],
['Der Bericht fehlt; [er~sie] wird morgen geschickt.','The report is missing; it will be sent tomorrow.'],
['Die Daten sind unvollständig; [sie~es] müssen ergänzt werden.','The data are incomplete; they must be supplemented.'],
['Das Verfahren dauert lange; [dies~dieser] erhöht die Kosten.','The procedure takes a long time; this increases the costs.'],
['Die Autorin, [deren~dessen] Buch wir lesen, kommt heute.','The author whose book we are reading is coming today.'],
['Der Forscher, [dessen~deren] Studie wir prüfen, antwortet.','The researcher whose study we examine replies.'],
['Anna liest den Bericht und Tim [die~der] Zusammenfassung.','Anna reads the report and Tim the summary.'],
['Sie hat den Text geprüft und die Fehler [korrigiert~korrigieren].','She has checked the text and corrected the errors.'],
['Das Team hat gewonnen, [was~wer] uns freut.','The team has won, which makes us happy.'],
['Die Vorschläge sind ähnlich; beide [werden~wird] geprüft.','The proposals are similar; both are checked.']
]},
];
