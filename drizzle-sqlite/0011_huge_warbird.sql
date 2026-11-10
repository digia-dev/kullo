CREATE TABLE `business_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`record_id` text,
	`actor_id` text,
	`verb` text NOT NULL,
	`meta` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`record_id`) REFERENCES `business_records`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `business_activities_org` ON `business_activities` (`org_id`);--> statement-breakpoint
CREATE TABLE `business_classifications` (
	`record_id` text NOT NULL,
	`label` text NOT NULL,
	PRIMARY KEY(`record_id`, `label`),
	FOREIGN KEY (`record_id`) REFERENCES `business_records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `business_records` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`type` text DEFAULT 'person' NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`job_title` text,
	`department` text,
	`email` text,
	`phone` text,
	`whatsapp` text,
	`website` text,
	`industry` text,
	`company_size` text,
	`status` text DEFAULT 'active' NOT NULL,
	`organization_id` text,
	`owner_id` text,
	`notes` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `business_records_org` ON `business_records` (`org_id`);--> statement-breakpoint
CREATE INDEX `business_records_org_type` ON `business_records` (`org_id`,`type`);--> statement-breakpoint
CREATE TABLE `follow_ups` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`record_id` text,
	`subject` text NOT NULL,
	`type` text DEFAULT 'call' NOT NULL,
	`due_date` text,
	`due_time` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`assignee_id` text,
	`notes` text,
	`completed_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`record_id`) REFERENCES `business_records`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `follow_ups_org` ON `follow_ups` (`org_id`,`status`);