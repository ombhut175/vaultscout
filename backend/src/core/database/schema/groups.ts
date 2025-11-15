import { pgTable, text, uuid, unique } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    uniqueOrgName: unique().on(table.orgId, table.name),
  }),
);
