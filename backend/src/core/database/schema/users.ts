import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalUserId: text("external_user_id").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
