import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { documents } from "./documents";
import { documentVersions } from "./document-versions";

export const ingestJobs = pgTable(
  "ingest_jobs",
  {
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
    stage: text("stage").notNull(), // parse | embed | index
    status: text("status").notNull(), // queued | running | succeeded | failed
    attempts: integer("attempts").default(0).notNull(),
    lastError: text("last_error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    lookupIdx: index("ingest_jobs_lookup_idx").on(
      table.orgId,
      table.documentId,
      table.stage,
      table.status,
    ),
  }),
);
