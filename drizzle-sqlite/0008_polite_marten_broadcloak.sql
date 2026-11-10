ALTER TABLE `documents` ADD `is_starred` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `is_trashed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `deleted_at` text;