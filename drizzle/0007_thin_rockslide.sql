CREATE TABLE `comment_attachments` (
	`comment_id` text NOT NULL,
	`document_id` text NOT NULL,
	PRIMARY KEY(`comment_id`, `document_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
