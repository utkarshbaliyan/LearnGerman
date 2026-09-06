CREATE TABLE `tutor_quotas` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `day`)
);
--> statement-breakpoint
CREATE TABLE `tutor_sessions` (
	`user_id` text NOT NULL,
	`task_id` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `task_id`)
);
