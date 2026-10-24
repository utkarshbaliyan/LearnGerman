import {S3Client,HeadObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3';
import {readFileSync} from 'node:fs';
import {join,basename} from 'node:path';
import {createHash} from 'node:crypto';
const directory=process.argv[2];if(!directory)throw new Error('Supply the prepared recording directory.');
const config=JSON.parse(readFileSync('deploy/aws/deployment.json','utf8'));
const registry=JSON.parse(readFileSync('content/reading/compatible/media-registry.json','utf8'));
const client=new S3Client({region:config.region});
let next=0,verified=0;const entries=Object.entries(registry);
await Promise.all(Array.from({length:4},async()=>{
  while(next<entries.length){
    const [key,entry]=entries[next++];
    const bytes=readFileSync(join(directory,basename(key))),hash=createHash('sha256').update(bytes).digest();
    if(bytes.length!==entry.bytes||hash.toString('hex')!==entry.sha256)throw new Error('Prepared recording differs: '+key);
    let object;
    try{object=await client.send(new HeadObjectCommand({Bucket:config.MediaBucket,Key:key,ChecksumMode:'ENABLED'}));}
    catch(error){if(error.$metadata?.httpStatusCode!==404)throw error;}
    if(!object){
      await client.send(new PutObjectCommand({Bucket:config.MediaBucket,Key:key,Body:bytes,IfNoneMatch:'*',ContentType:entry.contentType,CacheControl:'public, max-age=31536000, immutable',Metadata:{sha256:entry.sha256},ChecksumSHA256:hash.toString('base64')}));
      object=await client.send(new HeadObjectCommand({Bucket:config.MediaBucket,Key:key,ChecksumMode:'ENABLED'}));
    }
    if(object.ContentLength!==entry.bytes||object.Metadata?.sha256!==entry.sha256||object.ChecksumSHA256!==hash.toString('base64')||object.ContentType!==entry.contentType)throw new Error('Stored recording integrity failure: '+key);
    verified++;if(verified%50===0||verified===entries.length)console.log(`${verified}/${entries.length} private S3 recordings verified`);
  }
}));
