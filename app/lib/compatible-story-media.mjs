import {immutableMediaResponse} from './book-object-media.mjs';

export function allowedCompatibleStoryMedia(asset, registry) {
  const match=typeof asset==='string'&&asset.match(/^reading-(?:a1|a2|b1|b2)-\d{2,3}-v\d+-[a-f0-9]{12}-aac48-([a-f0-9]{12})\.m4a$/);
  if(!match)return null;
  const key='stories/compatible/'+asset,entry=registry[key];
  return entry&&Number.isSafeInteger(entry.bytes)&&entry.bytes>0&&entry.bytes<=8*1024**2&&
    /^[a-f0-9]{64}$/.test(entry.sha256)&&entry.sha256.slice(0,12)===match[1]&&entry.contentType==='audio/mp4'?{key,entry}:null;
}

export function compatibleStoryMediaResponse(request,asset,options) {
  return immutableMediaResponse(request,allowedCompatibleStoryMedia(asset,options.registry),options);
}
