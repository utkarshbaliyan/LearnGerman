import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let initialization: Promise<unknown> | null = null;

export async function getD1() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  return env.DB;
}

export async function ensureDatabase() {
  if (!initialization) {
    const d1 = await getD1();
    initialization = (async () => {
      await d1.batch([
        d1.prepare(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL,
        username TEXT,
        display_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`),
        d1.prepare(`CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT NOT NULL,
        scope TEXT NOT NULL,
        data TEXT DEFAULT '{}' NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (user_id, scope),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`),
      ]);
      const columns = await d1.prepare("PRAGMA table_info(users)").all<{ name: string }>();
      if (!columns.results.some((column) => column.name === "username")) {
        await d1.prepare("ALTER TABLE users ADD COLUMN username TEXT").run();
      }
      await d1.prepare("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username)").run();
    })().catch((error) => { initialization = null; throw error; });
  }
  await initialization;
}

export async function getDb() {
  return drizzle(await getD1(), { schema });
}
