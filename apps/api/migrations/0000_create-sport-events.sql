CREATE TABLE "sport_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"discipline" varchar(100) NOT NULL,
	"site" varchar(20) NOT NULL,
	"starts_at" timestamp (3) with time zone NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp (3) with time zone NOT NULL
);
