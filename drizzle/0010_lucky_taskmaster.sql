ALTER TABLE `document_versions` ADD `name` text;--> statement-breakpoint
ALTER TABLE `document_versions` ADD `kind` text;--> statement-breakpoint
ALTER TABLE `document_versions` ADD `size` integer;--> statement-breakpoint
ALTER TABLE `document_versions` ADD `storage_key` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `completed_at` text;--> statement-breakpoint
UPDATE `tasks` SET `completed_at` = `updated_at`
WHERE `status_id` IN (SELECT `id` FROM `project_statuses` WHERE `category` = 'done');
