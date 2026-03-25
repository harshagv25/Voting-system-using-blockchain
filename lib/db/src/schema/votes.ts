import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  blockIndex: integer("block_index").notNull(),
  voterId: text("voter_id").notNull().unique(),
  candidateId: integer("candidate_id").notNull(),
  previousHash: text("previous_hash").notNull(),
  hash: text("hash").notNull(),
  nonce: integer("nonce").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votesTable.$inferSelect;
