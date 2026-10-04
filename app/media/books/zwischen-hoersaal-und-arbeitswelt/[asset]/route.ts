import registry from '@/content/books/zwischen-hoersaal-und-arbeitswelt/media-registry.json';
import { bookMediaResponse } from '@/app/lib/book-object-media.mjs';

async function respond(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { env } = await import('cloudflare:workers');
  const bindings = env as unknown as { BUCKET?: R2Bucket; BOOK_MEDIA_UPLOAD_SECRET?: string };
  return bookMediaResponse(request, (await params).asset, { bucket: bindings.BUCKET, registry, uploadSecret: bindings.BOOK_MEDIA_UPLOAD_SECRET });
}
export const GET = respond;
export const HEAD = respond;
export const PUT = respond;
