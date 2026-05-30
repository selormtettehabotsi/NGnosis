CREATE TABLE `verification_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `user_id` text DEFAULT '' NOT NULL REFERENCES users(id);--> statement-breakpoint
-- Assign existing courses to the first user so the NOT NULL constraint holds
UPDATE `courses` SET `user_id` = (SELECT `id` FROM `users` ORDER BY `created_at` ASC LIMIT 1) WHERE `user_id` = '';--> statement-breakpoint
ALTER TABLE `users` ADD `email_verified` integer DEFAULT false NOT NULL;