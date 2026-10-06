import type { AdvancedDefinition } from './advanced-builder';
export const B2_MEANING: AdvancedDefinition[] = [
{ id:'b2-3-1',title:'Konjunktiv I and replacement forms',outcome:'Attribute information using the full reported-speech system without implying automatic disbelief.',pattern:'er sei / habe / könne · sie seien · sie hätten als Ersatzform',sources:['reporting'],rules:[
'Konjunktiv I marks attributed speech in formal reporting. It does not by itself say whether the reporter believes the statement.',
'Present forms commonly use the stem plus -e, -est, -e, -en, -et, -en; sein has the special forms sei, seiest, sei, seien, seiet, seien.',
'If Konjunktiv I coincides with indicative, Konjunktiv II can make attribution visible: sie hätten instead of ambiguous sie haben.',
'A würde-form can provide another replacement where a synthetic form is ambiguous or unsuitable, but sei and habe are usually preferable.',
'Indicative with dass is normal in many everyday reports. Choose the reporting convention consistently rather than labelling all indicative reports incorrect.',
'Compare the reported form with indicative first; choose a clear form and keep speaker attribution visible.'
],rows:[
['Die Sprecherin sagt, der Termin [sei~seien] bestätigt.','The spokesperson says the appointment is confirmed.'],
['Er erklärt, er [habe~haben] keine Zeit.','He explains that he has no time.'],
['Sie behauptet, sie [könne~können] das beweisen.','She claims that she can prove that.'],
['Der Bericht meldet, die Gäste [seien~sei] angekommen.','The report states that the guests have arrived.'],
['Sie sagt, ihr Bruder [wohne~wohnen] in Bonn.','She says her brother lives in Bonn.'],
['Die Leitung erklärt, alle [hätten~hätte] zugestimmt.','The management explains that everyone agreed.'],
['Er betont, er [wisse~wissen] nichts davon.','He stresses that he knows nothing about it.'],
['Sie berichtet, die Firma [müsse~müssen] sparen.','She reports that the company must save money.'],
['Er sagt, seine Kollegin [komme~kommen] später.','He says his colleague is coming later.'],
['Die Zeugin erklärt, das Licht [sei~seien] rot gewesen.','The witness explains that the light had been red.']
]},
{ id:'b2-3-2',title:'Reported time, pronouns and place',outcome:'Report past and future statements while preserving who spoke, where and when.',pattern:'habe gemacht · sei gegangen · werde kommen · am folgenden Tag',sources:['reporting','time'],rules:[
'Past reported events normally use Konjunktiv I perfect: er habe gearbeitet, sie sei gegangen.',
'Reported future events may use werde plus infinitive. The report’s time adverbs must match the intended reference point.',
'Change pronouns according to the original speaker and addressee, not according to a mechanical ich-to-er rule.',
'Words such as hier, heute and morgen are perspective-dependent. Retain them if the perspective is shared; otherwise clarify place or date.',
'German indirect reporting does not require English-style automatic backshift. Preserve simultaneity, anteriority and futurity explicitly.',
'For every report, recover the original speaker, actor, date and location before choosing forms.'
],rows:[
['Sie berichtet, sie [habe~sei] den Text gelesen.','She reports that she has read the text.'],
['Er erklärt, er [sei~habe] früh gegangen.','He explains that he left early.'],
['Sie kündigt an, sie [werde~werden] am folgenden Tag kommen.','She announces that she will come the following day.'],
['Er sagt, [sein~ihr] Bruder sei krank.','He says his brother is ill.'],
['Die Gäste berichten, sie [seien~sei] gut angekommen.','The guests report that they have arrived safely.'],
['Sie sagt, sie habe gestern dort [gearbeitet~arbeiten].','She says that she worked there yesterday.'],
['Er erklärt, die Sitzung [habe~haben] bereits begonnen.','He explains that the meeting has already begun.'],
['Sie sagt, ihr Team [werde~werden] nächste Woche antworten.','She says her team will reply next week.'],
['Der Zeuge berichtet, er [sei~habe] zu Hause gewesen.','The witness reports that he was at home.'],
['Er erklärt, er [habe~sei] die Nachricht nicht gesehen.','He explains that he did not see the message.']
]},
{ id:'b2-3-3',title:'Reported questions and requests',outcome:'Embed yes/no questions, W-questions, instructions and requests in a report.',pattern:'fragt, ob … / wann … · bittet, … zu … · sagt, er solle …',sources:['reporting','valency','commas'],rules:[
'Report yes/no questions with ob and W-questions with their question word. Embedded questions have subordinate clause order.',
'An embedded question uses a full stop when the whole sentence is a statement; the outer sentence determines final punctuation.',
'Report instructions with sollen or an appropriate requesting verb, preserving who is expected to act.',
'bitten plus accusative object and zu-infinitive is a natural way to report a request; auffordern zu follows its lexical frame.',
'Konjunktiv forms suit formal indirect reporting, but indicative is also possible in ordinary embedded questions.',
'Remove direct-question inversion inside the embedded clause, then check actor, addressee and force of the request.'
],rows:[
['Sie fragt, [ob~wenn] der Kurs stattfindet.','She asks whether the course is taking place.'],
['Er fragt, wann der Zug [abfährt~fährt ab].','He asks when the train leaves.'],
['Sie bittet mich, das Fenster [zu schließen~schließen zu].','She asks me to close the window.'],
['Er sagt, ich [solle~sollen] später anrufen.','He says I should call later.'],
['Die Leitung fragt, wer den Bericht [schreibt~schreiben].','The management asks who is writing the report.'],
['Sie möchte wissen, warum er nicht [kommt~kommen].','She wants to know why he is not coming.'],
['Er fordert uns auf, pünktlich [zu erscheinen~erscheinen zu].','He asks us to arrive on time.'],
['Sie fragt, wo die Sitzung [stattfindet~findet statt].','She asks where the meeting takes place.'],
['Die Lehrerin sagt, wir [sollten~sollte] den Text lesen.','The teacher says we should read the text.'],
['Er bittet sie, ihm [zu helfen~helfen zu].','He asks her to help him.']
]},
{ id:'b2-3-4',title:'Epistemic modals: present probability',outcome:'Distinguish obligation and ability from inference about what is true.',pattern:'muss wohl … sein · dürfte … sein · könnte … sein',sources:['modals'],rules:[
'Modal verbs can describe duties or abilities, or express a judgement about the truth of a proposition.',
'Epistemic müssen expresses a strong inference, not an externally imposed duty: er muss zu Hause sein.',
'dürfte often signals a cautious probability; könnte signals a possibility. These readings depend on context, not fixed percentages.',
'Epistemic können is common in questions and negation; kann nicht can reject a possibility rather than prohibit an action.',
'wohl, vermutlich and wahrscheinlich can clarify an inferential reading. Do not claim that a modal form alone guarantees one interpretation.',
'Ask whether the speaker is regulating an action or evaluating evidence.'
],rows:[
['Das Licht brennt; sie [muss~müssen] noch im Büro sein.','The light is on; she must still be in the office.'],
['Der Zug [dürfte~dürften] bald ankommen.','The train will probably arrive soon.'],
['Das [könnte~könnten] ein Fehler sein.','That could be a mistake.'],
['Das [kann~können] nicht stimmen.','That cannot be right.'],
['Er [muss~müssen] die Antwort kennen.','He must know the answer.'],
['Die Gäste [dürften~dürfte] schon unterwegs sein.','The guests are probably on their way already.'],
['Sie [könnte~könnten] im Zug sitzen.','She could be on the train.'],
['Die Zahlen [müssen~muss] falsch sein.','The figures must be wrong.'],
['Das [mag~mögen] zutreffen.','That may be true.'],
['Er [kann~können] unmöglich der Täter sein.','He cannot possibly be the perpetrator.']
]},
{ id:'b2-3-5',title:'Epistemic modals about the past',outcome:'Infer what happened using a modal and a perfect infinitive.',pattern:'muss gegangen sein · könnte vergessen haben · muss geprüft worden sein',sources:['modals','time','passive'],rules:[
'For a present inference about a past event, use a present modal plus a perfect infinitive.',
'Choose haben or sein from the lexical event: vergessen haben, gegangen sein.',
'Contrast er muss gegangen sein, an inference, with er musste gehen, a past obligation.',
'A passive past inference uses participle plus worden sein: die Datei muss gelöscht worden sein.',
'könnte and dürfte preserve different degrees and styles of uncertainty; context may also give counterfactual readings.',
'Separate the time of the evidence judgement from the time of the inferred event.'
],rows:[
['Er muss früh gegangen [sein~haben].','He must have left early.'],
['Sie könnte den Termin vergessen [haben~sein].','She could have forgotten the appointment.'],
['Der Zug dürfte bereits abgefahren [sein~haben].','The train has probably already departed.'],
['Die Datei muss gelöscht [worden sein~geworden haben].','The file must have been deleted.'],
['Sie kann das nicht gewusst [haben~sein].','She cannot have known that.'],
['Die Gäste müssen angekommen [sein~haben].','The guests must have arrived.'],
['Er dürfte die Nachricht gelesen [haben~sein].','He has probably read the message.'],
['Das Gerät könnte beschädigt [worden sein~werden haben].','The device could have been damaged.'],
['Sie muss sich geirrt [haben~sein].','She must have been mistaken.'],
['Wir könnten den Ausgang übersehen [haben~sein].','We could have overlooked the exit.']
]},
{ id:'b2-3-6',title:'Hearsay and claims: sollen and wollen',outcome:'Attribute unverified information and distinguish a person’s claim from their intention.',pattern:'soll … sein / gewesen sein · will … gesehen haben',sources:['modals','reporting'],rules:[
'Evidential sollen can attribute information to another source: er soll in Berlin wohnen means this is reported.',
'sollen plus perfect infinitive attributes a claim about the past: sie soll gewonnen haben.',
'wollen plus perfect infinitive can present the subject’s own claim: er will nichts gesehen haben.',
'Contrast that construction with ordinary wollen expressing intention: er will den Bericht lesen.',
'Neither evidential form establishes truth. Identify the source when possible and avoid implying automatic disbelief.',
'Ask who supplies the claim, then distinguish reported information, self-claim and future intention.'
],rows:[
['Die Firma [soll~sollen] verkauft worden sein.','The company is said to have been sold.'],
['Er [will~wollen] nichts gesehen haben.','He claims to have seen nothing.'],
['Die Studie [soll~sollen] neue Daten enthalten.','The study is said to contain new data.'],
['Sie [will~wollen] den Fehler sofort bemerkt haben.','She claims to have noticed the mistake immediately.'],
['Der Autor soll in Bonn gewohnt [haben~sein].','The author is said to have lived in Bonn.'],
['Die Gäste sollen früh gegangen [sein~haben].','The guests are said to have left early.'],
['Er will alle informiert [haben~sein].','He claims to have informed everyone.'],
['Das Verfahren soll vereinfacht [worden sein~geworden haben].','The procedure is said to have been simplified.'],
['Sie will morgen den Antrag [stellen~gestellt haben werden].','She wants to submit the application tomorrow.'],
['Die Zeugin will den Mann erkannt [haben~sein].','The witness claims to have recognised the man.']
]},
{ id:'b2-4-1',title:'Mixed-time counterfactual conditions',outcome:'Connect an unreal past condition to a present result without confusing their time frames.',pattern:'wenn … gemacht hätte, wäre … heute …',sources:['subjunctive','time'],rules:[
'A counterfactual past condition uses hätte or wäre plus participle; a present result uses present Konjunktiv II.',
'An unreal present condition can also explain a past result. Choose each clause’s time independently.',
'Use time expressions such as damals, jetzt and heute to make mixed time relationships clear.',
'würde plus infinitive often suits lexical verbs, while wäre and hätte remain natural short forms.',
'A wenn-clause occupies the first field when initial; the finite verb of the main clause follows immediately after it.',
'Label condition time and result time before building either verb form.'
],rows:[
['Wenn ich früher gelernt hätte, [wäre~war] ich jetzt sicherer.','If I had studied earlier, I would be more confident now.'],
['Wenn sie den Zug genommen hätte, [würde~werden] sie jetzt hier sitzen.','If she had taken the train, she would be sitting here now.'],
['Wenn wir gestern gebucht [hätten~haben], hätten wir heute Plätze.','If we had booked yesterday, we would have seats today.'],
['Wenn er mutiger [wäre~gewesen], hätte er damals gefragt.','If he were braver, he would have asked back then.'],
['Wenn ich mehr Zeit hätte, [hätte~habe] ich gestern geholfen.','If I had more time, I would have helped yesterday.'],
['Wenn sie nicht umgezogen [wäre~hätte], würde sie noch hier wohnen.','If she had not moved, she would still live here.'],
['Wenn wir den Fehler bemerkt hätten, [wäre~ist] das Gerät jetzt intakt.','If we had noticed the error, the device would be intact now.'],
['Wenn er die Ausbildung abgeschlossen hätte, [hätte~hat] er jetzt bessere Chancen.','If he had completed the training, he would have better chances now.'],
['Wenn sie weniger schüchtern wäre, [hätte~hat] sie gestern gesprochen.','If she were less shy, she would have spoken yesterday.'],
['Wenn du früher gegangen wärst, [wärst~bist] du jetzt zu Hause.','If you had left earlier, you would be at home now.']
]},
{ id:'b2-4-2',title:'Conditions without wenn and unreal wishes',outcome:'Form verb-first conditions and independent wishes with clear counterfactual meaning.',pattern:'hätte ich …, würde … · wenn ich doch … hätte! · wäre ich nur …!',sources:['subjunctive','fields','commas'],rules:[
'A conditional clause can omit wenn and begin with the finite verb: hätte ich Zeit, käme ich mit.',
'The following main clause begins with its finite verb because the conditional clause already occupies the first field.',
'Independent unreal wishes often use wenn with doch or nur, or verb-first order with a wish particle.',
'Past wishes use hätte or wäre plus participle; present wishes use present Konjunktiv II.',
'An exclamation mark suits an emphatic independent wish. Do not interpret every verb-first clause as a question.',
'Reconstruct the implied wenn and identify whether the clause gives a condition or an unfulfilled wish.'
],rows:[
['[Hätte~Haben] ich Zeit, käme ich mit.','If I had time, I would come along.'],
['[Wäre~Sein] er hier, könnten wir beginnen.','If he were here, we could begin.'],
['Wenn ich doch mehr Zeit [hätte~haben]!','If only I had more time!'],
['[Hätte~Haben] ich nur früher gefragt!','If only I had asked earlier!'],
['[Wäre~Sein] sie bloß geblieben!','If only she had stayed!'],
['Käme der Bus pünktlich, [wären~sein] wir rechtzeitig dort.','If the bus came on time, we would be there in time.'],
['[Hätten~Haben] wir gebucht, hätten wir Plätze.','If we had booked, we would have seats.'],
['Wenn er nur genauer zugehört [hätte~habe]!','If only he had listened more carefully!'],
['[Wärst~Bist gewesen] du früher gegangen, hättest du den Zug erreicht.','If you had left earlier, you would have caught the train.'],
['Wenn ich doch schon fertig [wäre~sein]!','If only I were already finished!']
]},
{ id:'b2-4-3',title:'Unreal comparison: als ob and als',outcome:'Describe an appearance or comparison without asserting that it is factual.',pattern:'als ob er … wäre · als wäre er … · als ob er … getan hätte',sources:['subjunctive','connectors'],rules:[
'als ob introduces a comparison that can distance the speaker from its literal truth.',
'Konjunktiv II is common for an unreal comparison; an indicative or Konjunktiv I can occur with different perspective or register.',
'After als ob, the finite verb normally stands at the end. With als alone, it follows als immediately.',
'A prior imagined action uses Konjunktiv II perfect: als ob sie alles verstanden hätte.',
'Do not infer deception merely from the grammatical construction; appearance can be sincere or uncertain.',
'Choose the comparison’s time, then check the different verb orders of als ob and als.'
],rows:[
['Er tut so, als ob er alles [wüsste~wissen].','He acts as if he knew everything.'],
['Sie sieht aus, als [wäre~sein] sie müde.','She looks as if she were tired.'],
['Er spricht, als ob er dort gewohnt [hätte~haben].','He speaks as if he had lived there.'],
['Sie verhält sich, als [hätte~haben] sie nichts gehört.','She behaves as if she had heard nothing.'],
['Es klingt, als ob die Leitung kaputt [wäre~sein].','It sounds as if the line were broken.'],
['Er lächelt, als [kennte~kennen] er die Lösung.','He smiles as if he knew the solution.'],
['Sie tut so, als ob sie beschäftigt [wäre~sein].','She acts as if she were busy.'],
['Er antwortet, als [hätte~haben] er alles verstanden.','He answers as if he had understood everything.'],
['Die Kinder schauen, als ob sie überrascht [wären~sein].','The children look as if they were surprised.'],
['Es wirkt, als [gäbe~geben] es keine Alternative.','It seems as if there were no alternative.']
]},
{ id:'b2-4-4',title:'Means, absence and replacement',outcome:'Connect actions with indem, dadurch dass, ohne dass/zu and statt dass/zu.',pattern:'indem … · dadurch, dass … · ohne … zu … · statt … zu …',sources:['connectors','commas'],rules:[
'indem introduces a method or means, not simply a simultaneous action: man spart, indem man weniger verbraucht.',
'dadurch, dass makes the means or cause explicit through a correlate and finite clause.',
'ohne dass allows its own subject; ohne zu uses an understood actor recoverable from the construction.',
'statt or anstatt contrasts a chosen action with an alternative. Match the infinitive actor to the intended subject.',
'Use commas around clause-like infinitive groups and before finite subordinate clauses.',
'Name the logical relation first: method, missing action or replaced action. Then choose a finite or infinitive clause.'
],rows:[
['Wir sparen Energie, [indem~indem dass] wir weniger heizen.','We save energy by heating less.'],
['Sie verbessert sich dadurch, [dass~ob] sie täglich übt.','She improves by practising daily.'],
['Er ging, ohne sich [zu verabschieden~verabschieden zu].','He left without saying goodbye.'],
['Sie half, ohne dass wir sie [baten~bitten].','She helped without us asking her.'],
['Er liest, statt fern[zusehen~sehen].','He reads instead of watching television.'],
['Wir lösen das Problem, indem wir die Daten [vergleichen~vergleicht].','We solve the problem by comparing the data.'],
['Sie arbeitet weiter, ohne eine Pause [zu machen~machen zu].','She continues working without taking a break.'],
['Er ruft an, statt eine Nachricht [zu schreiben~schreiben zu].','He calls instead of writing a message.'],
['Dadurch, dass sie früher beginnt, [gewinnt~gewinnen] sie Zeit.','By starting earlier, she gains time.'],
['Die Sitzung endete, ohne dass jemand [widersprach~widersprechen].','The meeting ended without anyone objecting.']
]},
{ id:'b2-4-5',title:'Consequences and degree clauses',outcome:'Distinguish a result from purpose and connect degree with a possible or impossible outcome.',pattern:'sodass … · so …, dass … · zu …, als dass … könnte',sources:['connectors','subjunctive'],rules:[
'sodass introduces a consequence; damit introduces an intended purpose. A result can be unintended.',
'so plus adjective or adverb with dass connects the degree to an actual consequence.',
'zu plus adjective with als dass commonly uses Konjunktiv II to present a blocked consequence: zu schwer, als dass ich es tragen könnte.',
'zu plus adjective with an um-zu group can express the same obstacle when the understood actor is recoverable.',
'Both sodass and so dass are accepted spellings. Distinguish a connector from a separate degree word so in the main clause.',
'Ask whether the second action is a goal, an actual result or an excluded possibility.'
],rows:[
['Es schneite stark, [sodass~sodass dass] die Straße gesperrt wurde.','It snowed heavily, so that the road was closed.'],
['Der Text ist so klar, [dass~ob] alle ihn verstehen.','The text is so clear that everyone understands it.'],
['Die Kiste ist zu schwer, als dass ich sie tragen [könnte~könnten].','The box is too heavy for me to carry it.'],
['Er ist zu müde, um weiter[zuarbeiten~arbeiten].','He is too tired to continue working.'],
['Sie sprach so leise, dass ich sie kaum [hörte~hören].','She spoke so quietly that I could barely hear her.'],
['Die Frist war kurz, sodass wir uns beeilen [mussten~muss].','The deadline was short, so we had to hurry.'],
['Das Problem ist zu komplex, als dass wir es sofort lösen [könnten~könnte].','The problem is too complex for us to solve it immediately.'],
['Die Musik war so laut, dass niemand schlafen [konnte~können].','The music was so loud that nobody could sleep.'],
['Sie spart, damit sie später studieren [kann~können].','She saves so that she can study later.'],
['Die Strecke ist zu lang, um sie zu Fuß [zurückzulegen~zu zurücklegen].','The route is too long to cover on foot.']
]},
{ id:'b2-4-6',title:'Proportional comparison: je … desto',outcome:'Connect changing quantities and preserve the different clause orders.',pattern:'je + Komparativ … Verb, desto/umso + Komparativ + Verb …',sources:['connectors','fields'],rules:[
'je introduces a dependent comparison with a comparative expression and final finite verb.',
'desto or umso introduces the correlated comparative in the main clause; its comparative phrase occupies the first field.',
'The main-clause finite verb follows that comparative phrase: desto leichter wird die Aufgabe.',
'Use mehr and weniger for quantities and irregular comparatives such as besser, höher and näher where required.',
'A proportional relation need not imply a proven causal law. Grammar connects the stated changes; evidence establishes causation.',
'Check both comparatives, then subordinate final position and main-clause verb-second position.'
],rows:[
['Je mehr du übst, [desto~desto dass] sicherer wirst du.','The more you practise, the more confident you become.'],
['Je früher wir beginnen, umso mehr Zeit [haben~hat] wir.','The earlier we begin, the more time we have.'],
['Je länger er wartet, desto ungeduldiger [wird~werden] er.','The longer he waits, the more impatient he becomes.'],
['Je [besser~guter] die Planung ist, desto leichter wird die Arbeit.','The better the planning is, the easier the work becomes.'],
['Je weniger du schläfst, desto müder [bist~sein] du.','The less you sleep, the more tired you are.'],
['Je höher die Kosten sind, desto schwieriger [wird~werden] die Entscheidung.','The higher the costs are, the harder the decision becomes.'],
['Je genauer sie liest, desto mehr Fehler [findet~finden] sie.','The more carefully she reads, the more errors she finds.'],
['Je näher der Termin kommt, desto nervöser [werden~wird] wir.','The closer the date gets, the more nervous we become.'],
['Je schneller du antwortest, umso eher [können~kann] wir planen.','The faster you reply, the sooner we can plan.'],
['Je mehr Erfahrung er hat, desto ruhiger [bleibt~bleiben] er.','The more experience he has, the calmer he remains.']
]},
];
