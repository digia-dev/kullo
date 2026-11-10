ALTER TABLE `conversation_members` ADD `role` text DEFAULT 'member' NOT NULL;--> statement-breakpoint
UPDATE `conversation_members` SET `role` = 'admin'
WHERE `rowid` IN (
  SELECT MIN(`rowid`) FROM `conversation_members`
  WHERE `conversation_id` IN (SELECT `id` FROM `conversations` WHERE `kind` <> 'dm')
  GROUP BY `conversation_id`
);
