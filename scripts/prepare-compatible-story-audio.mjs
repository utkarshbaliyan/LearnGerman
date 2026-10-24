// Transcode the existing recordings locally; never regenerate speech or call AI.
import {readFileSync, writeFileSync, mkdirSync, existsSync, renameSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync, execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const run = promisify(execFile);
const option = (name, fallback) => {const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1];};
const ffmpeg=option('--ffmpeg'), stage=option('--output'), origin=option('--origin','https://d19k6l47v6hw3.cloudfront.net');
if(!ffmpeg||!stage)throw new Error('Supply --ffmpeg PATH --output DIRECTORY.');
if(new URL(origin).origin!==origin||new URL(origin).protocol!=='https:')throw new Error('Supply an HTTPS source origin.');
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const sources={...read('app/lib/reading-audio-manifest.json'),...read('content/reading/b2/audio-manifest.json')};
const sourceRegistry=read('content/reading/b2/media-registry.json');
const sha=data=>createHash('sha256').update(data).digest('hex');
mkdirSync(stage,{recursive:true});mkdirSync('content/reading/compatible',{recursive:true});
const manifest={},registry={};let next=0,completed=0;
const entries=Object.entries(sources);
await Promise.all(Array.from({length:4},async()=>{
  while(next<entries.length){
    const [id,asset]=entries[next++], checkpoint=join(stage,id+'.json');
    if(existsSync(checkpoint)){
      const saved=read(checkpoint), file=join(stage,saved.filename);
      if(saved.manifest.sourceSrc===asset.src&&saved.manifest.textHash===asset.textHash&&existsSync(file)){
        const bytes=readFileSync(file);
        if(bytes.length===saved.entry.bytes&&sha(bytes)===saved.entry.sha256){
          manifest[id]=saved.manifest;registry[saved.key]=saved.entry;completed++;continue;
        }
      }
    }
    const input=join(stage,id+'.webm'), temporary=join(stage,id+'.m4a');
    let bytes;
    if(asset.src.startsWith('/audio/reading/')){
      bytes=execFileSync('git',['show',`HEAD:public${asset.src}`],{maxBuffer:8*1024**2});
    }else{
      const expected=sourceRegistry[asset.src.replace(/^\/media\//,'')];
      if(!expected)throw new Error('Unregistered source: '+id);
      let response;
      for(let attempt=0;attempt<4;attempt++){
        response=await fetch(origin+asset.src,{signal:AbortSignal.timeout(60000)});
        if(response.ok)break;
        await response.body?.cancel();
      }
      if(!response?.ok)throw new Error('Source unavailable: '+id);
      bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length!==expected.bytes||sha(bytes)!==expected.sha256)throw new Error('Source integrity failure: '+id);
    }
    const sourceSha256=sha(bytes);writeFileSync(input,bytes);
    await run(ffmpeg,['-hide_banner','-loglevel','error','-xerror','-y','-i',input,'-vn','-map_metadata','-1','-c:a','aac','-b:a','48k','-ar','24000','-ac','1','-movflags','+faststart',temporary],{timeout:120000});
    const probe=await run(ffmpeg,['-hide_banner','-i',temporary,'-f','null','-'],{timeout:120000,maxBuffer:1024**2});
    const match=probe.stderr.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if(!match)throw new Error('Missing encoded duration: '+id);
    const duration=Number(match[1])*3600+Number(match[2])*60+Number(match[3]);
    if(Math.abs(duration-asset.duration)>.15)throw new Error(`Truncated or shifted recording: ${id} (${duration} / ${asset.duration})`);
    const encoded=readFileSync(temporary), digest=sha(encoded);
    if(encoded.subarray(4,8).toString()!=='ftyp'||encoded.indexOf(Buffer.from('moov'))<0||encoded.indexOf(Buffer.from('moov'))>encoded.indexOf(Buffer.from('mdat')))throw new Error('Not a fast-start MP4: '+id);
    const filename=`${id}-${asset.textHash.slice(0,12)}-aac48-${digest.slice(0,12)}.m4a`,key='stories/compatible/'+filename;
    renameSync(temporary,join(stage,filename));
    registry[key]={bytes:encoded.length,sha256:digest,contentType:'audio/mp4'};
    manifest[id]={src:'/media/'+key,sourceSrc:asset.src,sourceSha256,textHash:asset.textHash,duration};
    writeFileSync(checkpoint,JSON.stringify({filename,key,entry:registry[key],manifest:manifest[id]}));
    completed++;if(completed%25===0||completed===entries.length)console.log(`${completed}/${entries.length} recordings encoded and decoded successfully`);
  }
}));
const sorted=value=>Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)));
writeFileSync('content/reading/compatible/audio-manifest.json',JSON.stringify(sorted(manifest),null,2)+'\n');
writeFileSync('content/reading/compatible/media-registry.json',JSON.stringify(sorted(registry),null,2)+'\n');
const encoder=execFileSync(ffmpeg,['-version'],{encoding:'utf8'}).split('\n')[0];
writeFileSync('content/reading/compatible/validation.json',JSON.stringify({format:'AAC-LC in fast-start MP4',bitrate:48000,sampleRate:24000,channels:1,encoder,recordings:completed,source:'Existing release recordings; source SHA-256 pinned per manifest entry',checks:['Source integrity','Full AAC decode','Duration within 150 ms of original','moov precedes mdat']},null,2)+'\n');
console.log('Compatible story recordings prepared. Upload and verify before deployment.');
