import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  party: text("party").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  symbol: text("symbol"),
  voteCount: integer("vote_count").notNull().default(0),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({
  id: true,
  voteCount: true,
});
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
