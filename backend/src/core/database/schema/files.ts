import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  bigint,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { documents } from "./documents";
import { documentVersions } from "./document-versions";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  documentId: uuid("document_id")
    .references(() => documents.id, { onDelete: "cascade" })
    .notNull(),
  versionId: uuid("version_id")
    .references(() => documentVersions.id, { onDelete: "cascade" })
    .notNull(),
  bucket: text("bucket").notNull(), // vs-raw | vs-extracted | vs-previews | vs-exports | vs-temp
  path: text("path").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  sha256: text("sha256").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
