import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
}, (table) => [primaryKey({ columns: [table.userId, table.taskId] }), index('tutor_sessions_user_updated_at').on(table.userId, table.updatedAt)]);

// Contains no learner text; deletion of practice cannot reset the daily budget.
export const tutorQuotas = sqliteTable("tutor_quotas", {
  userId: text("user_id").notNull(),
  day: text("day").notNull(),
  used: integer("used").notNull().default(0),
  generated: integer("generated").notNull().default(0),
  checked: integer("checked").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.userId, table.day] })]);

export const aiProviderUsage = sqliteTable('ai_provider_usage', {
  day: text('day').primaryKey(),
  calls: integer('calls').notNull().default(0),
});

// Retained through restores; contains no email, name, writing or recordings.
export const accountDeletions = sqliteTable('account_deletions', {
  userId: text('user_id').primaryKey(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index('account_deletions_status_created').on(table.status, table.createdAt)]);
