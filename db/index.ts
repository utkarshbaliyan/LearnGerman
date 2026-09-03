import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getD1() {
  const { env } = await import("cloudflare:workers");
  const workerEnv = env as unknown as { DB?: D1Database };
  if (!workerEnv.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  return workerEnv.DB;
}

export async function getDb() {
  return drizzle(await getD1(), { schema });
}
