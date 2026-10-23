import {S3Client,HeadObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const config=JSON.parse(readFileSync('deploy/aws/deployment.json','utf8'));
const client=new S3Client({region:config.region});
const groups=['content/reading/b2/media-registry.json',
  'content/books/zwischen-hoersaal-und-arbeitswelt/media-registry.json',
  'content/illustrations/story-art-registry.json'];
let verified=0,uploaded=0;
for(const registryPath of groups){
  const registry=JSON.parse(readFileSync(registryPath,'utf8'));
  const entries=Object.entries(registry);let next=0;
  await Promise.all(Array.from({length:4},async()=>{
    while(next<entries.length){
      const [key,entry]=entries[next++];
      let object;
      try{object=await client.send(new HeadObjectCommand({Bucket:config.MediaBucket,Key:key,ChecksumMode:'ENABLED'}));}
      catch(error){if(error.$metadata?.httpStatusCode!==404)throw error;}
      if(object){
        if(object.ContentLength!==entry.bytes||object.Metadata?.sha256!==entry.sha256||object.ChecksumSHA256!==Buffer.from(entry.sha256,'hex').toString('base64'))throw new Error('Existing media differs; refusing to overwrite it.');
        verified++;continue;
      }
      // Copy the already published R2 object. Do not rely on iCloud-cached
      // originals or regenerate artwork/audio during a hosting migration.
      let response;
      for(let attempt=0;attempt<5;attempt++){
        response=await fetch(`https://leselaut-german.professor-ut7.chatgpt.site/media/${key}`,{signal:AbortSignal.timeout(60000)});
        if(response.ok||![429,500,502,503,504].includes(response.status))break;
        await response.body?.cancel();await new Promise(r=>setTimeout(r,1000*2**attempt));
      }
      if(!response.ok)throw new Error(`Published media unavailable (${response.status}): ${key}`);
      const bytes=Buffer.from(await response.arrayBuffer());
      const digest=createHash('sha256').update(bytes).digest();
      if(bytes.length!==entry.bytes||digest.toString('hex')!==entry.sha256)throw new Error(`Media source checksum mismatch: ${key}`);
      await client.send(new PutObjectCommand({Bucket:config.MediaBucket,Key:key,Body:bytes,IfNoneMatch:'*',
        ContentType:entry.contentType,CacheControl:'public, max-age=31536000, immutable',Metadata:{sha256:entry.sha256},ChecksumSHA256:digest.toString('base64')}));
      const stored=await client.send(new HeadObjectCommand({Bucket:config.MediaBucket,Key:key,ChecksumMode:'ENABLED'}));
      if(stored.ContentLength!==entry.bytes||stored.Metadata?.sha256!==entry.sha256||stored.ChecksumSHA256!==digest.toString('base64'))throw new Error('S3 checksum verification failed.');
      uploaded++;verified++;
    }
  }));
  console.log(`${registryPath}: ${entries.length} objects verified.`);
}
console.log(JSON.stringify({verified,uploaded}));
