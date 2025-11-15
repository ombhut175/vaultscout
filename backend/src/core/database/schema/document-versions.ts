import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { documents } from "./documents";

export const documentVersions = pgTable(
  "document_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .references(() => documents.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    version: integer("version").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDocVersion: unique().on(table.documentId, table.version),
  }),
);
