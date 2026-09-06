import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  username: text("username").unique(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userProgress = sqliteTable("user_progress", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scope: text("scope").notNull(),
  data: text("data").notNull().default("{}"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.userId, table.scope] })]);

// Tutor records are owned by the authenticated Supabase subject. No client scores.
export const tutorSessions = sqliteTable("tutor_sessions", {
  userId: text("user_id").notNull(),
  taskId: text("task_id").notNull(),
  data: text("data").notNull(),
  version: integer("version").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.taskId] })]);

// Contains no learner text; deletion of practice cannot reset the daily budget.
export const tutorQuotas = sqliteTable("tutor_quotas", {
  userId: text("user_id").notNull(),
  day: text("day").notNull(),
  used: integer("used").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.userId, table.day] })]);
