#!/usr/bin/env python3
"""Render existing character dialogue locally, verify transcripts, and align every word.

Requires mlx-audio and FFmpeg; all model weights/checkpoints stay off the site.
Run with --models /tmp/leselaut-qwen-models --ffmpeg /absolute/path/to/ffmpeg.
"""
import argparse
from difflib import SequenceMatcher
import gc
import io
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
import time
import traceback

import mlx.core as mx
import numpy as np
from mlx_audio.audio_io import write, read
from mlx_audio.tts.utils import load_model
from mlx_audio.stt.utils import load as load_stt

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--models', type=Path, required=True)
parser.add_argument('--ffmpeg', required=True)
parser.add_argument('--only')
parser.add_argument('--level', choices=['A1', 'A2', 'B1', 'B2', 'C1'], help='Limit story narration to one level')
parser.add_argument('--bitrate-kbps', type=int, choices=[16, 24], default=24)
parser.add_argument('--batch-size', type=int, choices=[1, 2, 4], default=1, help='Generate uncached same-voice chunks together; every chunk still receives the same validation')
parser.add_argument('--collection', choices=['stories','book'], default='stories')
parser.add_argument('--book-id', help='Book slug for staged book sources; defaults to the existing A1 book')
parser.add_argument('--retry-asr-without-hotwords', action='store_true', help='Retry a failed full-recording transcript without recognition hints; acceptance thresholds stay unchanged')
parser.add_argument('--dialogue-plan', type=Path, required=True)
parser.add_argument('--source-json', type=Path, help='Standalone story sources for a staged narration run')
parser.add_argument('--output-dir', type=Path, help='Staging directory for audio and timing files')
parser.add_argument('--manifest-path', type=Path, help='Staging manifest path; use with --output-dir')
mode=parser.add_mutually_exclusive_group()
mode.add_argument('--prepared-only', action='store_true')
mode.add_argument('--follow-plans', action='store_true', help='Wait for speaker plans being prepared in parallel')
parser.add_argument('--checkpoint', type=Path, default=ROOT/'.local-piper/qwen-stories')
args=parser.parse_args()
if bool(args.output_dir) != bool(args.manifest_path):
    parser.error('--output-dir and --manifest-path must be used together')
if args.book_id and (args.collection!='book' or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.book_id)):
    parser.error('--book-id requires the book collection and a valid book slug')
if args.book_id and not args.source_json:
    parser.error('--book-id requires exact standalone sources through --source-json')
args.checkpoint.mkdir(parents=True,exist_ok=True)
source = args.source_json.read_bytes() if args.source_json else subprocess.check_output(['node','--input-type=module','-e',"""
import {narrationSources} from './scripts/lib/narration-sources.mjs';import {readingSentences} from './app/lib/reading-sentence-segmentation.mjs';
const stories=narrationSources(process.argv[1]);
console.log(JSON.stringify(stories.map(s=>({...s,paragraphSentences:s.text.split('\\n\\n').map(readingSentences)}))));
""",args.collection],cwd=ROOT)
stories=json.loads(source)
if args.level:
    if args.collection!='stories':raise ValueError('--level applies only to stories')
    stories=[s for s in stories if s['level']==args.level]
if args.only:stories=[s for s in stories if s['id']==args.only]
if not stories:raise ValueError('No matching stories')
book_mode=args.collection=='book'
book=json.loads((ROOT/'app/lib/book-data.json').read_text()) if book_mode and not args.book_id else None
public_prefix=f"/audio/books/{args.book_id or book['id']}" if book_mode else '/audio/reading'
output=args.output_dir if args.output_dir else ROOT/'public'/public_prefix.lstrip('/')
output.mkdir(parents=True,exist_ok=True)
metadata=json.loads((ROOT/'docs/audio-samples/qwen-samples.json').read_text())
reference_text=metadata['text']
references={v:ROOT/f'docs/audio-samples/qwen-german-{v}.wav' for v in ['male','female']}
plans=json.loads(args.dialogue_plan.read_text())
voices=['dialogue']
if plans is not None:
    if args.prepared_only:stories=[story for story in stories if story['id'] in plans]
    for story in stories:
        plan=plans.get(story['id'])
        if not plan and args.follow_plans:continue
        assert plan and plan['textHash']==hashlib.sha256(story['text'].encode()).hexdigest(), f"Missing or stale speaker plan: {story['id']}"
        assert ''.join(segment['text'] for segment in plan['segments'])==story['text'], 'Speaker plan changes story text'
        assert all(segment['voice'] in ['male','female'] for segment in plan['segments']), 'Unknown character voice'
tts=load_model(str(args.models/'tts'))
asr=load_stt(str(args.models/'asr'))
aligner=load_stt(str(args.models/'aligner'))
paths={'dialogue':args.manifest_path if args.manifest_path else ROOT/('app/lib/book-audio-manifest.json' if book_mode else 'app/lib/reading-audio-manifest.json')}
manifests={v:json.loads(p.read_text()) if p.exists() else {} for v,p in paths.items()}
def save_json(path,data):
    temporary=path.with_suffix('.tmp')
    indent=2 if path in paths.values() else None
    temporary.write_text(json.dumps(data,ensure_ascii=False,indent=indent,separators=None if indent else (',',':'))+'\n');temporary.replace(path)
def visible_words(text):return [w for w in text.split() if re.search('[A-Za-zÄÖÜäöüßÉé0-9]',w)]
NUMBER_WORDS = ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn']
TENS = ['', '', 'zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig']
NUMBER_WORDS += [TENS[n//10] if n%10 == 0 else ('ein' if n%10 == 1 else NUMBER_WORDS[n%10])+'und'+TENS[n//10] for n in range(20,100)]
NUMBER_NORMAL = {word.replace('ß','ss'):str(n) for n,word in enumerate(NUMBER_WORDS)}
def normal(text):
    # ASR writes spoken numbers as digits. Compare their meaning consistently.
    value=text.casefold().replace('ß','ss').replace('é','e')
    value=re.sub(r'\bgleis(?=[a-zäöü])','gleis ',value)
    return [NUMBER_NORMAL.get(word,word) for word in re.findall(r'[a-zäöü]+|[0-9]+',value)]
def chunks(story,voice):
    if plans is not None:
        result=[]
        for segment in plans[story['id']]['segments']:
            for text in re.split(r'(?<=[.!?])\s+',segment['text']):
                text=text.strip()
                if not visible_words(text):continue
                selected=segment['voice']
                if result and result[-1][0]==selected and len(result[-1][1])+len(text)<900:
                    result[-1]=(selected,result[-1][1]+' '+text)
                else:result.append((selected,text))
        return result
def validate_generated_chunk(text,audio,rate,wav,check,hotwords,attempt):
    assert rate==24000 and np.isfinite(audio).all() and np.max(np.abs(audio))>.01,'Invalid waveform'
    duration=len(audio)/rate;count=len(visible_words(text))
    assert count*.18<duration<count*1.3+4,'Unexpected duration'
    write(str(wav),audio,rate,format='wav')
    transcript=None;coverage=None;excess=None
    if count>=40 or plans is None:
        transcript=asr.generate(str(wav),language='German',hotwords=hotwords,max_tokens=max(256,count*4)).text
        expected,actual=normal(text),normal(transcript)
        matcher=SequenceMatcher(None,expected,actual,autojunk=False)
        matched=sum(b.size for b in matcher.get_matching_blocks())
        coverage=matched/max(1,len(expected))
        excess=(len(actual)-matched)/max(1,len(expected))
        assert coverage>=.9 and excess<=.12,f'Transcript differs: coverage={coverage:.2f}, excess={excess:.2f}: {transcript}'
    aligned=aligner.generate(str(wav),text=text,language='German').items
    assert len(aligned)==count,f'Alignment count {len(aligned)} != {count}'
    local=[];nudged=0
    for item in aligned:
        value=item.start_time
        assert np.isfinite(value) and -.05<=value<duration+.2,'Alignment outside recording'
        value=max(0,min(value,duration-.01))
        if local and value<=local[-1]:value=local[-1]+.005;nudged+=1
        assert value<duration,'Alignment ended outside recording'
        local.append(round(value,5))
    assert nudged<=max(2,count*.12),'Too many uncertain word boundaries'
    report={'source':text,'starts':local,'seconds':duration,'transcript':transcript,'coverage':coverage,'excess':excess,'attempt':attempt+1}
    save_json(check,report)
    return report

def prepare_batched_chunks(story,story_chunks,hotwords):
    if args.batch_size==1:return
    pending={'male':[],'female':[]}
    for index,(selected,text) in enumerate(story_chunks):
        fingerprint=hashlib.sha256((selected+text+hashlib.sha256(references[selected].read_bytes()).hexdigest()).encode()).hexdigest()[:20]
        wav=args.checkpoint/(fingerprint+'.wav');check=args.checkpoint/(fingerprint+'.json')
        report=json.loads(check.read_text()) if check.exists() else None
        if report and report['source']==text and wav.exists():continue
        pending[selected].append((index,text,fingerprint,wav,check))
    for selected,rows in pending.items():
        rows.sort(key=lambda row:len(visible_words(row[1])))
        for offset in range(0,len(rows),args.batch_size):
            group=rows[offset:offset+args.batch_size]
            if len(group)<2:continue
            counts=[len(visible_words(row[1])) for row in group]
            if max(counts)>min(counts)*2.5:continue
            cap=max(350,max(counts)*16)
            seed=int(hashlib.sha256(''.join(row[2] for row in group).encode()).hexdigest()[:8],16)%2147483647
            try:
                mx.random.seed(seed)
                results=list(tts.batch_generate([row[1] for row in group],ref_audio=str(references[selected]),ref_text=reference_text,
                    lang_code='German',temperature=.65,max_tokens=cap,verbose=False))
                assert len(results)==len(group) and sorted(result.sequence_idx for result in results)==list(range(len(group))),'Incomplete batch'
                for result in results:
                    index,text,fingerprint,wav,check=group[result.sequence_idx]
                    try:
                        assert result.token_count<max(350,len(visible_words(text))*16),'Batch reached token limit'
                        validate_generated_chunk(text,np.array(result.audio),result.sample_rate,wav,check,hotwords,0)
                    except Exception as error:
                        print(f'Batch fallback {story["id"]} chunk {index+1}: {error}',flush=True)
                mx.clear_cache();gc.collect()
            except Exception as error:
                print(f'Batch fallback {story["id"]}: {error}',flush=True)
    # The original sequential loop retries any chunk without a passing report.

failures=[];completed=0;started=time.monotonic()
for story in stories:
 for voice in voices:
    digest=hashlib.sha256(story['text'].encode()).hexdigest()
    if args.follow_plans:
        deadline=time.monotonic()+600
        while True:
            plans=json.loads(args.dialogue_plan.read_text())
            plan=plans.get(story['id'])
            if plan:
                assert plan['textHash']==digest and ''.join(s['text'] for s in plan['segments'])==story['text'], 'Stale speaker plan'
                assert all(s['voice'] in ['male','female'] for s in plan['segments']), 'Unknown character voice'
                break
            assert time.monotonic()<deadline, f"Speaker plan not ready: {story['id']}"
            print(f"Waiting for speaker plan: {story['id']}",flush=True)
            time.sleep(15)
    plan_hash=''
    if plans is not None:
        plan_hash='-'+hashlib.sha256(json.dumps([(segment['voice'],segment['text']) for segment in plans[story['id']]['segments']],ensure_ascii=False).encode()).hexdigest()[:8]
    prefix=f"p{int(story['id']):03d}-page" if book_mode else story['id']
    name=f"{prefix}-{digest[:12]}{plan_hash}-qwen-{voice}-opus{args.bitrate_kbps}"
    target=output/(name+'.webm');sidecar=output/(name+'.json')
    old=manifests[voice].get(story['id'])
    if old and old['src'].endswith(name+'.webm') and old['textHash']==digest and target.exists() and sidecar.exists() and (plans is None or (args.checkpoint/(name+'-transcript.json')).exists()):
        completed+=1;continue
    try:
        story_started=time.monotonic()
        frames=[];starts=[];offset=0;reports=[]
        story_chunks=chunks(story,voice)
        print(f"Rendering {story['id']}: {len(story_chunks)} chunks, batch size {args.batch_size}",flush=True)
        story_hotwords=sorted(set(story.get('hotwords',[])) | {assignment['speaker'] for assignment in plans[story['id']]['assignments'] if assignment['voice']!='narrator' and len(assignment['speaker'].split())==1}) if plans is not None else []
        prepare_batched_chunks(story,story_chunks,story_hotwords)
        for chunk_index,(selected_voice,text) in enumerate(story_chunks):
            fingerprint=hashlib.sha256((selected_voice+text+hashlib.sha256(references[selected_voice].read_bytes()).hexdigest()).encode()).hexdigest()[:20]
            wav=args.checkpoint/(fingerprint+'.wav');check=args.checkpoint/(fingerprint+'.json')
            report=json.loads(check.read_text()) if check.exists() else None
            if report and report['source']==text and wav.exists():
                audio,rate=read(io.BytesIO(wav.read_bytes()));audio=np.asarray(audio).reshape(-1)
            else:
                errors=[]
                for attempt in range(3):
                    try:
                        mx.random.seed(int(fingerprint[:8],16)%2147483647+attempt)
                        cap=max(350,len(visible_words(text))*16)
                        results=list(tts.generate(text,ref_audio=str(references[selected_voice]),ref_text=reference_text,lang_code='German',temperature=[.65,.8,.9][attempt],max_tokens=cap,verbose=False))
                        assert results and sum(r.token_count for r in results)<cap,'Generation reached token limit'
                        audio=np.concatenate([np.array(r.audio) for r in results]);rate=results[0].sample_rate
                        report=validate_generated_chunk(text,audio,rate,wav,check,story_hotwords,attempt)
                        break
                    except Exception as e:
                        errors.append(str(e));print(f"Retry {story['id']} {voice} chunk {chunk_index+1}: {e}",flush=True)
                else:raise RuntimeError('; '.join(errors))
            starts.extend(round(offset+t,5) for t in report['starts']);frames.append(audio)
            offset+=len(audio)/rate
            if chunk_index<len(story_chunks)-1:
                frames.append(np.zeros(7200,dtype=np.float32));offset+=.3
            reports.append(report)
            print(f"Validated {story['id']} chunk {chunk_index+1}/{len(story_chunks)}",flush=True)
        audio=np.concatenate(frames)
        duration=round(len(audio)/24000,5)
        assert len(starts)==len(visible_words(story['text']))
        mx.clear_cache();gc.collect()
        with tempfile.TemporaryDirectory(prefix='leselaut-qwen-encode-') as temp:
            combined=Path(temp)/'story.wav';write(str(combined),audio,24000,format='wav')
            if plans is not None:
                transcript=asr.generate(str(combined),language='German',hotwords=story_hotwords,chunk_duration=30.0,max_tokens=max(512,len(visible_words(story['text']))*4)).text
                expected,actual=normal(story['text']),normal(transcript)
                matcher=SequenceMatcher(None,expected,actual,autojunk=False)
                matched=sum(block.size for block in matcher.get_matching_blocks())
                coverage=matched/max(1,len(expected));excess=(len(actual)-matched)/max(1,len(expected))
                if coverage<.9 or excess>.12:
                    save_json(args.checkpoint/(name+'-transcript-failed.json'),{'transcript':transcript,'coverage':coverage,'excess':excess})
                    if args.retry_asr_without_hotwords and story_hotwords:
                        print(f'Rechecking {story["id"]} transcript without recognition hints',flush=True)
                        transcript=asr.generate(str(combined),language='German',hotwords=[],chunk_duration=30.0,max_tokens=max(512,len(visible_words(story['text']))*4)).text
                        actual=normal(transcript)
                        matched=sum(block.size for block in SequenceMatcher(None,expected,actual,autojunk=False).get_matching_blocks())
                        coverage=matched/max(1,len(expected));excess=(len(actual)-matched)/max(1,len(expected))
                assert coverage>=.9 and excess<=.12,f'Whole-story transcript differs: coverage={coverage:.2f}, excess={excess:.2f}'
                save_json(args.checkpoint/(name+'-transcript.json'),{'transcript':transcript,'coverage':coverage,'excess':excess})
                mx.clear_cache();gc.collect()
            temporary=target.with_suffix('.tmp.webm')
            command=[args.ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(combined),'-c:a','libopus','-b:a',f'{args.bitrate_kbps}k','-ar','24000','-ac','1',str(temporary)]
            for encoding_attempt in range(3):
                try:
                    subprocess.run(command,check=True);break
                except subprocess.CalledProcessError as error:
                    if error.returncode != -9 or encoding_attempt == 2:raise
                    mx.clear_cache();gc.collect();time.sleep(1)
            assert temporary.stat().st_size>10000
            temporary.replace(target)
        save_json(sidecar,{'textHash':digest,'starts':starts,'duration':duration})
        manifests[voice][story['id']]={'src':public_prefix+'/'+target.name,'timingSrc':public_prefix+'/'+sidecar.name,'textHash':digest,'wordCount':len(starts),'duration':duration}
        save_json(paths[voice],manifests[voice])
        completed+=1
        print(f"Completed {completed}/{len(stories)*len(voices)}: {story['id']} {voice} ({duration:.1f}s; generated in {time.monotonic()-story_started:.0f}s)",flush=True)
        mx.clear_cache()
    except Exception as e:
        traceback.print_exc()
        failures.append({'story':story['id'],'voice':voice,'error':str(e)})
        save_json(args.checkpoint/'failures.json',failures)
        print(f"FAILED {story['id']} {voice}: {e}",flush=True)
print(f'Rendered {completed} recordings in {time.monotonic()-started:.0f}s; failures={len(failures)}',flush=True)
save_json(args.checkpoint/'failures.json',failures)
if failures:raise SystemExit(1)
