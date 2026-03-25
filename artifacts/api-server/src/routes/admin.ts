import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { electionTable, votersTable, votesTable, fraudLogsTable, candidatesTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

async function ensureElectionRow() {
  const rows = await db.select().from(electionTable).limit(1);
  if (rows.length === 0) {
    await db.insert(electionTable).values({ isActive: false, resultsHidden: false });
    const newRows = await db.select().from(electionTable).limit(1);
    return newRows[0];
  }
  return rows[0];
}

router.get("/election", async (req, res) => {
  try {
    const election = await ensureElectionRow();
    res.json({
      isActive: election.isActive,
      startedAt: election.startedAt?.toISOString() ?? null,
      endedAt: election.endedAt?.toISOString() ?? null,
      resultsHidden: election.resultsHidden,
    });
  } catch (err) {
    req.log.error({ err }, "Get election status error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.put("/election", async (req, res) => {
  try {
    const { isActive } = req.body;
    const election = await ensureElectionRow();

    const updateData: Record<string, unknown> = { isActive };
    if (isActive && !election.isActive) {
      updateData.startedAt = new Date();
      updateData.endedAt = null;
    } else if (!isActive && election.isActive) {
      updateData.endedAt = new Date();
    }

    const [updated] = await db.update(electionTable)
      .set(updateData)
      .where(eq(electionTable.id, election.id))
      .returning();

    res.json({
      isActive: updated.isActive,
      startedAt: updated.startedAt?.toISOString() ?? null,
      endedAt: updated.endedAt?.toISOString() ?? null,
      resultsHidden: updated.resultsHidden,
    });
  } catch (err) {
    req.log.error({ err }, "Update election status error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const election = await ensureElectionRow();

    const [voterCount] = await db.select({ count: count() }).from(votersTable);
    const [voteCount] = await db.select({ count: count() }).from(votesTable);
    const [fraudCount] = await db.select({ count: count() }).from(fraudLogsTable);

    const totalVoters = voterCount?.count ?? 0;
    const totalVotesCast = voteCount?.count ?? 0;
    const verificationRate = totalVoters > 0 ? Math.round((totalVotesCast / totalVoters) * 10000) / 100 : 0;

    res.json({
      totalVoters,
      totalVotesCast,
      fraudAttempts: fraudCount?.count ?? 0,
      activeElection: election.isActive,
      verificationRate,
    });
  } catch (err) {
    req.log.error({ err }, "Get admin stats error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { adminPassword } = req.body;
    if (adminPassword !== "Admin@123") {
      res.status(401).json({ error: "Unauthorized", message: "Invalid admin password" });
      return;
    }

    await db.update(votersTable).set({ hasVoted: false, votedAt: null });
    await db.delete(votesTable);
    await db.update(candidatesTable).set({ voteCount: 0 });
    await db.delete(fraudLogsTable);

    const election = await ensureElectionRow();
    await db.update(electionTable).set({
      isActive: false,
      startedAt: null,
      endedAt: null,
      resultsHidden: false,
    }).where(eq(electionTable.id, election.id));

    res.json({ success: true, message: "Election reset successfully" });
  } catch (err) {
    req.log.error({ err }, "Reset election error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/fraud-log", async (req, res) => {
  try {
    const logs = await db.select().from(fraudLogsTable).orderBy(sql`${fraudLogsTable.createdAt} DESC`).limit(100);
    res.json(logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Get fraud log error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/fraud-log", async (req, res) => {
  try {
    const { voterId, attemptType, details } = req.body;

    if (!attemptType || !details) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    await db.insert(fraudLogsTable).values({
      voterId: voterId || null,
      attemptType,
      details,
      ipAddress: req.ip || null,
    });

    res.status(201).json({ success: true, message: "Fraud attempt logged" });
  } catch (err) {
    req.log.error({ err }, "Log fraud error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.put("/toggle-results", async (req, res) => {
  try {
    const { hidden } = req.body;
    const election = await ensureElectionRow();

    await db.update(electionTable)
      .set({ resultsHidden: hidden })
      .where(eq(electionTable.id, election.id));

    res.json({ success: true, message: hidden ? "Results hidden" : "Results visible" });
  } catch (err) {
    req.log.error({ err }, "Toggle results error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
