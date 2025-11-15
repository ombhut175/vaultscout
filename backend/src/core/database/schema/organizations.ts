import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  pineconeNamespace: text("pinecone_namespace")
    .default("__default__")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
