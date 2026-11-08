CREATE TABLE `support_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`topic` text DEFAULT 'umum' NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `memberships` ADD `notification_prefs` text DEFAULT '{}' NOT NULL;