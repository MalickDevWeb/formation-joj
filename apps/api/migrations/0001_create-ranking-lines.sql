CREATE TABLE "ranking_lines" (
	"sport_event_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"athlete" varchar(100) NOT NULL,
	"country" varchar(3) NOT NULL,
	"performance" varchar(50) NOT NULL,
	CONSTRAINT "ranking_lines_pkey" PRIMARY KEY("sport_event_id","rank")
);
--> statement-breakpoint
ALTER TABLE "ranking_lines" ADD CONSTRAINT "ranking_lines_sport_event_id_sport_events_id_fk" FOREIGN KEY ("sport_event_id") REFERENCES "public"."sport_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ranking_lines_athlete_key" ON "ranking_lines" USING btree ("sport_event_id","athlete","country");