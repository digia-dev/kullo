CREATE TABLE `message_attachments` (
	`message_id` text NOT NULL,
	`document_id` text NOT NULL,
	PRIMARY KEY(`message_id`, `document_id`),
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_departments` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`head_user_id` text,
	`color` text DEFAULT '#0f6cbd' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`head_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_departments`("id", "org_id", "name", "head_user_id", "color", "created_at") SELECT "id", "org_id", "name", "head_user_id", "color", "created_at" FROM `departments`;--> statement-breakpoint
DROP TABLE `departments`;--> statement-breakpoint
ALTER TABLE `__new_departments` RENAME TO `departments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `departments_org_name` ON `departments` (`org_id`,`name`);--> statement-breakpoint
CREATE TABLE `__new_task_labels` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#0f6cbd' NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_task_labels`("id", "org_id", "name", "color") SELECT "id", "org_id", "name", "color" FROM `task_labels`;--> statement-breakpoint
DROP TABLE `task_labels`;--> statement-breakpoint
ALTER TABLE `__new_task_labels` RENAME TO `task_labels`;--> statement-breakpoint
CREATE UNIQUE INDEX `task_labels_org_name` ON `task_labels` (`org_id`,`name`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`title` text,
	`phone` text,
	`avatar_color` text DEFAULT '#0f6cbd' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "password_hash", "title", "phone", "avatar_color", "created_at") SELECT "id", "name", "email", "password_hash", "title", "phone", "avatar_color", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);