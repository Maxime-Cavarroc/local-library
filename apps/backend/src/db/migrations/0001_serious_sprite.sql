CREATE TABLE `downloaded` (
	`user_id` integer NOT NULL,
	`book` text NOT NULL,
	PRIMARY KEY(`user_id`, `book`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` integer NOT NULL,
	`book` text NOT NULL,
	PRIMARY KEY(`user_id`, `book`)
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`user_id` integer NOT NULL,
	`book` text NOT NULL,
	`percentage` real NOT NULL,
	PRIMARY KEY(`user_id`, `book`)
);
