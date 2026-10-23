import { S3Client, HeadObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Minimal object interface used by the existing checksum-verified media routes.
// EC2 supplies short-lived credentials through its instance role.
export function mediaBucket(name, client = new S3Client({})) {
  function metadata(object) {
    return {size: object.ContentLength, httpEtag: object.ETag, customMetadata: object.Metadata ?? {}};
  }
  return {
    async head(key) {
      try { return metadata(await client.send(new HeadObjectCommand({Bucket: name, Key: key}))); }
      catch (error) { if (error.$metadata?.httpStatusCode === 404) return null; throw error; }
    },
    async get(key, options) {
      const range = options?.range;
      try {
        const object = await client.send(new GetObjectCommand({Bucket: name, Key: key,
          ...(range ? {Range: `bytes=${range.offset}-${range.offset + range.length - 1}`} : {})}));
        return {...metadata(object), body: object.Body.transformToWebStream()};
      } catch (error) { if (error.$metadata?.httpStatusCode === 404) return null; throw error; }
    },
    async put(key, body, options = {}) {
      try {
        return await client.send(new PutObjectCommand({Bucket: name, Key: key, Body: body,
          ContentType: options.httpMetadata?.contentType, CacheControl: options.httpMetadata?.cacheControl,
          Metadata: options.customMetadata, ChecksumSHA256: options.sha256 ? Buffer.from(options.sha256).toString('base64') : undefined,
          ...(options.onlyIf ? {IfNoneMatch: '*'} : {})}));
      } catch (error) { if ([409, 412].includes(error.$metadata?.httpStatusCode)) return null; throw error; }
    },
  };
}
