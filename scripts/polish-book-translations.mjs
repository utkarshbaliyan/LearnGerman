import fs from 'node:fs';
import {chooseSentenceTranslations} from './lib/select-sentence-translations.mjs';
const result=JSON.parse(fs.readFileSync(process.argv[2]));
const edits=JSON.parse(fs.readFileSync('content/books/paragraph-translation-edits.json'));
function repairDialogue(text, source) {
  // The local model sometimes drops a closing quote; retain the source dialogue boundaries.
  const expected=(source.match(/[„“]/g)??[]).length;
  let quotes=(text.match(/"/g)??[]).length;
  if (quotes % 2 && expected % 2 === 0) {
    const attribution=/(,?\s+(?:(?:she|he)\s+(?:says|asks|replies)|(?:says|asks|replies)\s+(?:Mila|Jonas|Sara|she|he)))/;
    if(attribution.test(text)) text=text.replace(attribution,'"$1');
    else text+='"';
  }
  return text;
}
const output={};
for(const [page,entry] of Object.entries(result)) output[page]=entry.paragraphs.map((p,i)=>{
 const edit=edits[`${page}:${i+1}`];
 const references=p.sentences.map(s=>repairDialogue(s.en,s.de));
 const context=(p.contextEnglish.match(/"/g)??[]).length%2 ? '' : p.contextEnglish;
 let en=chooseSentenceTranslations(context,references).join(' ');
 if(p.source.includes('Regentonne')) en=en.replace(/\bregent\b/gi,'rain barrel');
 en=en.replace(/Mr\. King/g,'Mr König').replace(/Mrs\. Albers/g,'Mrs Albers');
 return {source:p.source,en:edit?.source===p.source?edit.en:en};
});
fs.writeFileSync('app/lib/book-translations.json',JSON.stringify(output,null,2)+'\n');
