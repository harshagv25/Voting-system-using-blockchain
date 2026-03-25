import { pgTable, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const votersTable = pgTable("voters", {
  voterId: varchar("voter_id", { length: 20 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  aadhaarHash: text("aadhaar_hash").notNull().unique(),
  faceDescriptor: text("face_descriptor"),
  hasVoted: boolean("has_voted").notNull().default(false),
  aadhaarVerified: boolean("aadhaar_verified").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  votedAt: timestamp("voted_at"),
});

export const insertVoterSchema = createInsertSchema(votersTable).omit({
  createdAt: true,
  hasVoted: true,
  aadhaarVerified: true,
  isAdmin: true,
});
export type InsertVoter = z.infer<typeof insertVoterSchema>;
export type Voter = typeof votersTable.$inferSelect;
