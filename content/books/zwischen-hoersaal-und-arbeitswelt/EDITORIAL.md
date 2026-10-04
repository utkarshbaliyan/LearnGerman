# Zwischen Hörsaal und Arbeitswelt

Original 200-page B1-oriented German novella, ten chapters of twenty short pages, four German paragraphs per page, source-matched English translations, contextual hover meanings and a continuous narrated recording per page. Editorial page range 137–175 words in this edition; page length is not a CEFR certification. Council of Europe B1 reading scales support straightforward familiar texts and simple chronological novels with everyday vocabulary and dictionary support. Independent teacher review and learner testing remain necessary.

Amir, 24, comes from Morocco and studies for a master's degree in computer science at the fictional university in Lindenstadt, Germany. He begins during his second semester. The story spans student-job applications, café work, a software working-student role, exams, a thesis, graduation, a prolonged graduate job search and professional onboarding. Dates are relative, with explicit seasonal transitions. His eventual offer is an individual fictional outcome, not a promise that a degree or a particular application technique guarantees employment.

Cast voices: Amir, Nico, Beck (Herr Beck), Felix, Paul and Weber (Professor Weber) male; Mara, Nele, Klein (Frau Klein), Tanja, Daria, Leni and Sommer (Frau Sommer) female. The narrator uses the established synthetic female reference. Clearly attributed character quotations use the character's consistent voice. Narration, notices and unattributed document text remain narrator text. No arbitrary gender alternation. English is never narrated.

Use present narration, Perfekt for earlier experiences, common Präteritum forms, short subordinate and relative clauses, infinitives with zu, polite Konjunktiv II and common passive structures. Keep the plot chronological, emotions explicit and most sentences short. Introduce employment vocabulary through concrete situations and revisit it later. No repeated filler paragraphs; no comprehension questions or preparation panels.

The university, employers StadtDaten and WegeWerk, and all characters are fictional. Applications can differ by employer; a photo and cover letter are not universally compulsory. Work conditions, immigration permission and student social-insurance status are distinct questions. The international protagonist checks his own documents with the university's International Office and the relevant authority. Do not make a universal twenty-hour immigration claim, reproduce changing pay thresholds, promise automatic residence extensions, or imply that cash payment alone is illegal. Graduate residence applications require individual eligibility and supporting documents; no numerical legal limits are taught in the fiction. Gross and net salary differ, but this book provides no individual tax calculation or financial advice.

Primary sources reviewed for this release:
- Council of Europe B1 reading scales, Companion Volume, printed pp. 60 and 65: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989.pdf
- Bundesagentur für Arbeit, applications: https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/bewerbungstraining/bewerbung-schreiben
- Bundesagentur für Arbeit, interviews: https://web.arbeitsagentur.de/bildung/bewerbung/bewerbungsgespraech
- University of Bonn, student and graduate job portals: https://www.uni-bonn.de/en/studying/during-your-studies/graduation-and-transition-to-a-professional-career/career-service/jobs-and-internships
- Heidelberg Career Service: https://www.heiskills.uni-heidelberg.de/de/ueber-uns/career-service
- Official Make it in Germany, work while studying: https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/work
- Official Make it in Germany, graduate prospects: https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/prospects-after
- Official Make it in Germany, contracts: https://www.make-it-in-germany.com/en/working-in-germany/working-environment/work-contract

The canonical manuscript.psv is directly authored German and English, not template-generated fiction. Compile it with scripts/prepare-b1-book.mjs. Publish only once all 200 sources, translations, meanings, voice plans, recordings and timings pass validation. Preserve the existing A1/A2 books, Stories and all bookmarks. Models and generation checkpoints stay outside deployment.

The completed manuscript contains 33,906 German whitespace words and 3,435 unique normalised word forms, not 3,435 distinct vocabulary items. All sentences stay within 30 whitespace words. These are editorial checks, not evidence of CEFR certification or learning effectiveness. The inherited tooltip candidates were reviewed and corrected in gloss-overrides.psv; every word form in this edition has a meaning.

New B1 recordings and timing files are stored separately through the Sites R2 BUCKET binding and served at /media/books/zwischen-hoersaal-und-arbeitswelt/. The site package contains the manifest and immutable exact-hash allowlist. Uploads require a short-lived HMAC tied to the canonical key, byte length and SHA-256; the temporary upload secret is removed after stored-byte validation. Existing narration remains in its original locations.

The delivery manifest is object-manifest.json. Delivery filenames include twelve characters of the exact file SHA-256 in addition to the source-text and voice-plan hashes. The registry pins the complete checksum, length, MIME type and original local filename. Audio and timing bytes are independently addressed; regeneration cannot silently overwrite an existing cached recording. The original generation manifest remains unchanged for source and ASR checkpoint validation.
