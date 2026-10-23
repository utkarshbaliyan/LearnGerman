CREATE TABLE `account_deletions` (
	`user_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `account_deletions_status_created` ON `account_deletions` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `ai_provider_usage` (
	`day` text PRIMARY KEY NOT NULL,
	`calls` integer DEFAULT 0 NOT NULL
);

--> statement-breakpoint
CREATE TRIGGER users_block_deleted_insert BEFORE INSERT ON users
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;

--> statement-breakpoint
CREATE TRIGGER users_block_deleted_update BEFORE UPDATE ON users
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;

--> statement-breakpoint
CREATE TRIGGER user_progress_block_deleted_insert BEFORE INSERT ON user_progress
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.user_id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;

--> statement-breakpoint
CREATE TRIGGER user_progress_block_deleted_update BEFORE UPDATE ON user_progress
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.user_id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;

--> statement-breakpoint
CREATE TRIGGER tutor_sessions_block_deleted_insert BEFORE INSERT ON tutor_sessions
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.user_id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;

--> statement-breakpoint
CREATE TRIGGER tutor_sessions_block_deleted_update BEFORE UPDATE ON tutor_sessions
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.user_id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;

--> statement-breakpoint
CREATE TRIGGER tutor_quotas_block_deleted_insert BEFORE INSERT ON tutor_quotas
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.user_id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;

--> statement-breakpoint
CREATE TRIGGER tutor_quotas_block_deleted_update BEFORE UPDATE ON tutor_quotas
WHEN EXISTS (SELECT 1 FROM account_deletions WHERE user_id = NEW.user_id)
BEGIN
  SELECT RAISE(ABORT, 'account_deleted');
END;
