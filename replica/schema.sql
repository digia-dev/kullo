-- Kullo schema (generated from the live SQLite database)

CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`actor_id` text,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`verb` text NOT NULL,
	`meta` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `approval_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`position` integer NOT NULL,
	`approver_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`note` text,
	`decided_at` text,
	FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`task_id` text,
	`document_id` text,
	`name` text NOT NULL,
	`kind` text DEFAULT 'file' NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `checklist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`checklist_id` text NOT NULL,
	`text` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `checklists` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`title` text DEFAULT 'Checklist' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`parent_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`edited_at` text,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `conversation_members` (
	`conversation_id` text NOT NULL,
	`user_id` text NOT NULL,
	`last_read_at` text,
	PRIMARY KEY(`conversation_id`, `user_id`),
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`kind` text DEFAULT 'channel' NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`project_id` text,
	`department_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `departments` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`head_user_id` text,
	`color` text DEFAULT '#365fd1' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`head_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `document_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`version` integer NOT NULL,
	`note` text,
	`author_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`folder_id` text,
	`name` text NOT NULL,
	`kind` text DEFAULT 'pdf' NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`owner_id` text,
	`visibility` text DEFAULT 'company' NOT NULL,
	`project_id` text,
	`department_id` text,
	`storage_key` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `event_participants` (
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`response` text DEFAULT 'accepted' NOT NULL,
	PRIMARY KEY(`event_id`, `user_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`kind` text DEFAULT 'meeting' NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`all_day` integer DEFAULT false NOT NULL,
	`location` text,
	`project_id` text,
	`created_by` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`scope` text DEFAULT 'company' NOT NULL,
	`department_id` text,
	`project_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `form_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`label` text NOT NULL,
	`type` text DEFAULT 'text' NOT NULL,
	`required` integer DEFAULT false NOT NULL,
	`options` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `form_templates`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `form_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'general' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`department_id` text,
	`manager_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`invite_token_hash` text,
	`invite_expires_at` text,
	`joined_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL, `notification_prefs` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `message_reactions` (
	`message_id` text NOT NULL,
	`user_id` text NOT NULL,
	`emoji` text NOT NULL,
	PRIMARY KEY(`message_id`, `user_id`, `emoji`),
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`reply_to_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`due_date` text,
	`done` integer DEFAULT false NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`href` text,
	`read_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`address` text,
	`timezone` text DEFAULT 'Asia/Jakarta' NOT NULL,
	`work_start` text DEFAULT '09:00' NOT NULL,
	`work_end` text DEFAULT '18:00' NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);

CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`member_limit` integer,
	`project_limit` integer,
	`features` text DEFAULT '[]' NOT NULL
);

CREATE TABLE `project_members` (
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	PRIMARY KEY(`project_id`, `user_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `project_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`category` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`department_id` text,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`owner_id` text,
	`manager_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`start_date` text,
	`due_date` text,
	`progress` integer DEFAULT 0 NOT NULL,
	`archived_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`template_id` text,
	`requester_id` text NOT NULL,
	`title` text NOT NULL,
	`amount` integer,
	`data` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`current_step` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `form_templates`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`permissions` text DEFAULT '{}' NOT NULL,
	`system` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`plan_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`renews_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `support_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`topic` text DEFAULT 'umum' NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);

CREATE TABLE `task_collaborators` (
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `user_id`),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `task_dependencies` (
	`task_id` text NOT NULL,
	`depends_on_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `depends_on_id`),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`depends_on_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `task_label_links` (
	`task_id` text NOT NULL,
	`label_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `label_id`),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`label_id`) REFERENCES `task_labels`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `task_labels` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#365fd1' NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`project_id` text,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status_id` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`assignee_id` text,
	`reporter_id` text,
	`start_date` text,
	`due_date` text,
	`estimate_hours` integer,
	`archived_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`status_id`) REFERENCES `project_statuses`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `time_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`minutes` integer NOT NULL,
	`note` text,
	`logged_on` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`title` text,
	`phone` text,
	`avatar_color` text DEFAULT '#365fd1' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);

