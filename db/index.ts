import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getBindings } from '@/platform-bindings';

export async function getD1() {
  const env = await getBindings();
  const workerEnv = env as unknown as { DB?: D1Database };
  if (!workerEnv.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  return workerEnv.DB;
}

export async function getDb() {
  return drizzle(await getD1(), { schema });
}
