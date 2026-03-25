import { pgTable, serial, boolean, timestamp } from "drizzle-orm/pg-core";

export const electionTable = pgTable("election", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").notNull().default(false),
  resultsHidden: boolean("results_hidden").notNull().default(false),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

export type Election = typeof electionTable.$inferSelect;
