import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fraudLogsTable = pgTable("fraud_logs", {
  id: serial("id").primaryKey(),
  voterId: text("voter_id"),
  attemptType: text("attempt_type").notNull(),
  details: text("details").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFraudLogSchema = createInsertSchema(fraudLogsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFraudLog = z.infer<typeof insertFraudLogSchema>;
export type FraudLog = typeof fraudLogsTable.$inferSelect;
