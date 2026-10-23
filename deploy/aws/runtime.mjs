import { openSqlite } from './sqlite.mjs';
import { mediaBucket } from './s3.mjs';

let bindings;
export async function getBindings() {
  if (!bindings) {
    if (!process.env.LESELAUT_SQLITE_PATH || !process.env.LESELAUT_MEDIA_BUCKET) throw new Error('AWS storage is not configured.');
    bindings = {DB: openSqlite(process.env.LESELAUT_SQLITE_PATH, {readOnly: process.env.LESELAUT_READ_ONLY === '1'}),
      BUCKET: mediaBucket(process.env.LESELAUT_MEDIA_BUCKET)};
  }
  return bindings;
}
