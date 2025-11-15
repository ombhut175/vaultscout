import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const searchLogs = pgTable(
  "search_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    queryText: text("query_text").notNull(),
    filters: jsonb("filters").default({}).notNull(),
    topk: integer("topk").default(10).notNull(),
    latencyMs: integer("latency_ms"),
    matchIds: text("match_ids").array().default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orgCreatedIdx: index("search_logs_org_created_idx").on(
      table.orgId,
      table.createdAt,
    ),
  }),
);
