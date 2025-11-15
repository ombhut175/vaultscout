CREATE TYPE "public"."role" AS ENUM('admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TABLE "document_acl_groups" (
	"document_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	CONSTRAINT "document_acl_groups_document_id_group_id_pk" PRIMARY KEY("document_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "user_organizations" (
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_organizations_user_id_org_id_pk" PRIMARY KEY("user_id","org_id")
);
--> statement-breakpoint
DROP INDEX "documents_acl_groups_idx";--> statement-breakpoint
ALTER TABLE "document_acl_groups" ADD CONSTRAINT "document_acl_groups_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "document_acl_groups" ADD CONSTRAINT "document_acl_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "document_acl_groups_document_idx" ON "document_acl_groups" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_acl_groups_group_idx" ON "document_acl_groups" USING btree ("group_id");--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "acl_groups";