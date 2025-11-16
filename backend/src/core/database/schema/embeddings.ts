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
import { chunks } from "./chunks";

export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    chunkId: uuid("chunk_id")
      .references(() => chunks.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    vectorId: text("vector_id").notNull(),
    indexName: text("index_name").notNull(),
    namespace: text("namespace").notNull(),
    modelName: text("model_name").notNull(),
    modelVersion: text("model_version").notNull(),
    dim: integer("dim").notNull(),
    embedTs: timestamp("embed_ts").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.indexName, table.namespace, table.vectorId),
    index("embeddings_org_index_namespace_idx").on(
      table.orgId,
      table.indexName,
      table.namespace,
    ),
  ],
);
