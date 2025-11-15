import { pgTable, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { documents } from "./documents";
import { groups } from "./groups";

export const documentAclGroups = pgTable(
  "document_acl_groups",
  {
    documentId: uuid("document_id")
      .references(() => documents.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    groupId: uuid("group_id")
      .references(() => groups.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.documentId, table.groupId] }),
    documentIdx: index("document_acl_groups_document_idx").on(
      table.documentId,
    ),
    groupIdx: index("document_acl_groups_group_idx").on(table.groupId),
  }),
);
