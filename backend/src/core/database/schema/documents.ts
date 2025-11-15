import {
  pgTable,
  text,
  uuid,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    ownerUserId: uuid("owner_user_id").references(() => users.id),
    title: text("title").notNull(),
    fileType: text("file_type").notNull(),
    tags: text("tags").array().default([]).notNull(),
    status: text("status").default("queued").notNull(), // queued | processing | ready | error
    aclGroups: uuid("acl_groups").array().default([]).notNull(),
    contentHash: text("content_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orgStatusIdx: index("documents_org_status_idx").on(
      table.orgId,
      table.status,
    ),
    tagsIdx: index("documents_tags_idx").on(table.tags),
    aclGroupsIdx: index("documents_acl_groups_idx").on(table.aclGroups),
  }),
);
