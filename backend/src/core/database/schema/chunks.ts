import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { documents } from "./documents";
import { documentVersions } from "./document-versions";

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    documentId: uuid("document_id")
      .references(() => documents.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    versionId: uuid("version_id")
      .references(() => documentVersions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    sectionTitle: text("section_title"),
    page: integer("page"),
    position: integer("position").notNull(),
    text: text("text").notNull(),
    tokenCount: integer("token_count"),
    contentHash: text("content_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDocVersionPosition: unique().on(
      table.documentId,
      table.versionId,
      table.position,
    ),
    docVersionPositionIdx: index("chunks_doc_version_position_idx").on(
      table.documentId,
      table.versionId,
      table.position,
    ),
  }),
);
