CREATE TABLE "access_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"note" text,
	"password_hash" text,
	"payment_proof_key" text,
	"token" text NOT NULL,
	"user_id" text,
	"org_id" text,
	"claimed_at" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	CONSTRAINT "access_requests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "mail_outbox" (
	"id" text PRIMARY KEY NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"kind" text DEFAULT 'transactional' NOT NULL,
	"request_id" text,
	"sent_at" text,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "access_requests_status" ON "access_requests" USING btree ("status","created_at");