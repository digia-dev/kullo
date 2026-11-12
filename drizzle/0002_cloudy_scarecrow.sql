CREATE TABLE "platform_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"request_id" text,
	"meta" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform_audit" ADD CONSTRAINT "platform_audit_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit" ADD CONSTRAINT "platform_audit_request_id_access_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."access_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platform_audit_created" ON "platform_audit" USING btree ("created_at");