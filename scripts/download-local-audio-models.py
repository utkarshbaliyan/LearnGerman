#!/usr/bin/env python3
"""Download local narration/validation models with resumable checked chunks.

Requires huggingface_hub. Large files are SHA-256 checked; never shipped to Sites.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
from huggingface_hub import model_info, snapshot_download

MODELS = {
    'tts': 'mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit',
    'aligner': 'mlx-community/Qwen3-ForcedAligner-0.6B-4bit',
    'asr': 'mlx-community/Qwen3-ASR-0.6B-4bit',
}
root = Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/leselaut-qwen-models')
root.mkdir(parents=True,exist_ok=True)
jobs=[]
for name, repo in MODELS.items():
    target=root/name;target.mkdir(exist_ok=True)
    info=model_info(repo,files_metadata=True)
    small=[s.rfilename for s in info.siblings if not s.size or s.size<20_000_000]
    snapshot_download(repo,local_dir=target,allow_patterns=small)
    for s in info.siblings:
        if not s.size or s.size<20_000_000:continue
        path=target/s.rfilename;path.parent.mkdir(parents=True,exist_ok=True)
        expected=s.lfs.sha256
        reusable=Path('/tmp/leselaut-qwen-voice-design')/s.rfilename
        if reusable.exists() and reusable.stat().st_size==s.size and hashlib.file_digest(reusable.open('rb'),'sha256').hexdigest()==expected:
            shutil.copyfile(reusable,path)
        if path.exists() and path.stat().st_size==s.size and hashlib.file_digest(path.open('rb'),'sha256').hexdigest()==expected:continue
        jobs.append((repo,path,s.size,expected))
parts=[]
chunk=32*1024*1024
for repo,path,size,digest in jobs:
    folder=path.parent/(path.name+'.parts');folder.mkdir(exist_ok=True)
    parts.extend((repo,path,size,digest,folder,start,min(start+chunk,size)-1) for start in range(0,size,chunk))
def fetch(job):
    repo,path,size,digest,folder,start,end=job
    part=folder/str(start);count=end-start+1
    for attempt in range(10):
        have=part.stat().st_size if part.exists() else 0
        if have==count:return
        assert have<count
        tail=folder/(str(start)+'.download');headers=folder/(str(start)+'.headers')
        remote=str(path.relative_to(root / next(name for name,model in MODELS.items() if model==repo)))
        url=f'https://huggingface.co/{repo}/resolve/main/{remote}?download=true&part={start+have}'
        result=subprocess.run(['curl','-sSL','--fail','--speed-time','30','--speed-limit','1000','--max-time','180','--range',f'{start+have}-{end}','-D',str(headers),'-o',str(tail),url])
        if tail.exists() and tail.stat().st_size:
            matches=re.findall(r'content-range:\s*bytes (\d+)-(\d+)/(\d+)',headers.read_text(),re.I)
            if not matches or int(matches[-1][0])!=start+have or tail.stat().st_size>count-have:
                raise ValueError(f'Invalid range response: {path}, {start+have}')
            with part.open('ab') as out,tail.open('rb') as inp:shutil.copyfileobj(inp,out)
        tail.unlink(missing_ok=True)
        if part.exists() and part.stat().st_size==count:return
        time.sleep(min(attempt+1,5))
    raise RuntimeError(f'Incomplete model chunk {path}:{start}')
with ThreadPoolExecutor(max_workers=8) as pool:
    futures=[pool.submit(fetch,job) for job in parts]
    for count,f in enumerate(as_completed(futures),1):
        f.result()
        if count%8==0 or count==len(parts):print(f'Checked chunks {count}/{len(parts)}',flush=True)
for repo,path,size,digest in jobs:
    folder=path.parent/(path.name+'.parts')
    with path.open('wb') as out:
        for start in range(0,size,chunk):
            with (folder/str(start)).open('rb') as inp:shutil.copyfileobj(inp,out)
    assert path.stat().st_size==size and hashlib.file_digest(path.open('rb'),'sha256').hexdigest()==digest,path
    print(f'Verified {path}',flush=True)
print('All narration and validation models ready.',flush=True)
