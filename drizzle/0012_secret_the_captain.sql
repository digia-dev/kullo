CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`company_id` text,
	`client_code` text,
	`status` text DEFAULT 'active' NOT NULL,
	`client_tier` text,
	`segment` text,
	`account_owner_id` text,
	`client_since` text,
	`contract_start` text,
	`contract_end` text,
	`renewal_date` text,
	`contract_value` real,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`payment_terms` text,
	`notes` text,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `clients_org` ON `clients` (`org_id`);--> statement-breakpoint
CREATE INDEX `clients_company` ON `clients` (`company_id`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`website` text,
	`industry` text,
	`company_type` text,
	`company_size` text,
	`description` text,
	`email` text,
	`phone` text,
	`address` text,
	`city` text,
	`province` text,
	`postal_code` text,
	`country` text,
	`owner_id` text,
	`source` text,
	`priority` text,
	`status` text DEFAULT 'prospect' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `companies_org` ON `companies` (`org_id`);--> statement-breakpoint
CREATE INDEX `companies_org_name` ON `companies` (`org_id`,`name`);--> statement-breakpoint
CREATE TABLE `company_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`company_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`relationship_type` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`reports_to_contact_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_contacts_pair` ON `company_contacts` (`company_id`,`contact_id`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`company_id` text,
	`first_name` text NOT NULL,
	`last_name` text,
	`salutation` text,
	`job_title` text,
	`department` text,
	`email` text,
	`personal_email` text,
	`phone` text,
	`mobile_phone` text,
	`whatsapp` text,
	`linkedin_url` text,
	`website` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`reports_to_contact_id` text,
	`relationship_type` text,
	`owner_id` text,
	`birthday` text,
	`address` text,
	`city` text,
	`country` text,
	`status` text DEFAULT 'active' NOT NULL,
	`lead_source` text,
	`last_contacted` text,
	`next_follow_up` text,
	`preferred_communication` text,
	`notes` text,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contacts_org` ON `contacts` (`org_id`);--> statement-breakpoint
CREATE INDEX `contacts_company` ON `contacts` (`company_id`);--> statement-breakpoint
CREATE TABLE `crm_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`type` text DEFAULT 'note' NOT NULL,
	`subject` text NOT NULL,
	`description` text,
	`company_id` text,
	`contact_id` text,
	`client_id` text,
	`vendor_id` text,
	`partner_id` text,
	`lead_id` text,
	`opportunity_id` text,
	`assigned_to` text,
	`due_date` text,
	`due_time` text,
	`completed_at` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` text,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `crm_activities_org` ON `crm_activities` (`org_id`,`status`);--> statement-breakpoint
CREATE TABLE `database_saved_views` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`owner_id` text,
	`name` text NOT NULL,
	`entity` text NOT NULL,
	`scope` text DEFAULT 'personal' NOT NULL,
	`filters` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `database_saved_views_org` ON `database_saved_views` (`org_id`,`entity`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`company_name` text,
	`email` text,
	`phone` text,
	`website` text,
	`industry` text,
	`lead_source` text,
	`status` text DEFAULT 'new' NOT NULL,
	`score` integer,
	`owner_id` text,
	`estimated_value` real,
	`expected_close_date` text,
	`notes` text,
	`converted_company_id` text,
	`converted_contact_id` text,
	`converted_at` text,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `leads_org` ON `leads` (`org_id`);--> statement-breakpoint
CREATE INDEX `leads_org_status` ON `leads` (`org_id`,`status`);--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`company_id` text,
	`primary_contact_id` text,
	`owner_id` text,
	`pipeline` text DEFAULT 'Pipeline Penjualan' NOT NULL,
	`stage` text DEFAULT 'new' NOT NULL,
	`deal_value` real,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`probability` integer,
	`expected_close_date` text,
	`source` text,
	`priority` text,
	`description` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`primary_contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `opportunities_org` ON `opportunities` (`org_id`);--> statement-breakpoint
CREATE INDEX `opportunities_org_stage` ON `opportunities` (`org_id`,`stage`);--> statement-breakpoint
CREATE TABLE `partners` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`company_id` text,
	`partner_code` text,
	`partner_type` text,
	`status` text DEFAULT 'active' NOT NULL,
	`owner_id` text,
	`partnership_start` text,
	`partnership_end` text,
	`notes` text,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `partners_org` ON `partners` (`org_id`);--> statement-breakpoint
CREATE INDEX `partners_company` ON `partners` (`company_id`);--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`company_id` text,
	`vendor_code` text,
	`category` text,
	`vendor_type` text,
	`status` text DEFAULT 'pending_verification' NOT NULL,
	`owner_id` text,
	`payment_terms` text,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`contract_start` text,
	`contract_end` text,
	`contract_value` real,
	`rating` real,
	`tax_id` text,
	`bank_name` text,
	`bank_account_name` text,
	`bank_account_number` text,
	`procurement_contact_id` text,
	`purchase_category` text,
	`performance_notes` text,
	`notes` text,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`archived_at` text,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `vendors_org` ON `vendors` (`org_id`);--> statement-breakpoint
CREATE INDEX `vendors_company` ON `vendors` (`company_id`);