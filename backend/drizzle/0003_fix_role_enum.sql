-- Manual migration to convert role_id UUID to role enum
-- This fixes the mismatch between database state and schema

-- Step 1: Drop the FK constraint if it exists (safe with IF EXISTS)
ALTER TABLE "user_organizations" DROP CONSTRAINT IF EXISTS "user_organizations_role_id_roles_id_fk";

-- Step 2: Add the new role enum column
ALTER TABLE "user_organizations" ADD COLUMN IF NOT EXISTS "role" "role";

-- Step 3: Migrate data - map existing role_id to enum value
-- Assuming default mapping: any existing rows get 'editor' role
UPDATE "user_organizations" SET "role" = 'editor' WHERE "role" IS NULL;

-- Step 4: Make role column NOT NULL
ALTER TABLE "user_organizations" ALTER COLUMN "role" SET NOT NULL;

-- Step 5: Drop the old role_id column
ALTER TABLE "user_organizations" DROP COLUMN IF EXISTS "role_id";

-- Step 6: Drop roles table if it exists
DROP TABLE IF EXISTS "roles" CASCADE;

-- Step 7: Add missing indexes on document_acl_groups
CREATE INDEX IF NOT EXISTS "document_acl_groups_document_idx" ON "document_acl_groups" USING btree ("document_id");
CREATE INDEX IF NOT EXISTS "document_acl_groups_group_idx" ON "document_acl_groups" USING btree ("group_id");
