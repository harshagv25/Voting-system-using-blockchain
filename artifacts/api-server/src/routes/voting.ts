import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { votersTable, votesTable, candidatesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { sha256, computeBlockHash } from "../lib/crypto.js";

const router: IRouter = Router();

router.post("/cast", async (req, res) => {
  try {
    const { voterId, candidateId, faceVerified, aadhaarVerified } = req.body;

    if (!voterId || !candidateId) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    if (!faceVerified) {
      res.status(400).json({ error: "Face not verified", message: "Face authentication required before voting" });
      return;
    }

    if (!aadhaarVerified) {
      res.status(400).json({ error: "Aadhaar not verified", message: "Aadhaar verification required before voting" });
      return;
    }

    const [voter] = await db.select().from(votersTable).where(eq(votersTable.voterId, voterId)).limit(1);

    if (!voter) {
      res.status(404).json({ error: "Voter not found" });
      return;
    }

    if (voter.hasVoted) {
      res.status(400).json({ error: "Already voted", message: "You have already cast your vote" });
      return;
    }

    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, candidateId)).limit(1);
    if (!candidate) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    const existingBlocks = await db.select().from(votesTable).orderBy(votesTable.blockIndex);
    const blockIndex = existingBlocks.length;
    const previousHash = blockIndex === 0 ? "0000000000000000000000000000000000000000000000000000000000000000" : existingBlocks[existingBlocks.length - 1].hash;

    const voterIdHash = sha256(voterId);
    const timestamp = new Date().toISOString();
    let nonce = 0;

    let hash = computeBlockHash({
      index: blockIndex,
      voterId: voterIdHash,
      candidateId,
      timestamp,
      previousHash,
      nonce,
    });

    while (!hash.startsWith("00")) {
      nonce++;
      hash = computeBlockHash({
        index: blockIndex,
        voterId: voterIdHash,
        candidateId,
        timestamp,
        previousHash,
        nonce,
      });
      if (nonce > 10000) break;
    }

    const [vote] = await db.insert(votesTable).values({
      blockIndex,
      voterId: voterIdHash,
      candidateId,
      previousHash,
      hash,
      nonce,
    }).returning();

    await db.update(votersTable)
      .set({ hasVoted: true, votedAt: new Date() })
      .where(eq(votersTable.voterId, voterId));

    await db.update(candidatesTable)
      .set({ voteCount: sql`${candidatesTable.voteCount} + 1` })
      .where(eq(candidatesTable.id, candidateId));

    res.status(201).json({
      success: true,
      blockHash: vote.hash,
      blockIndex: vote.blockIndex,
      message: "Vote cast successfully and recorded on blockchain",
    });
  } catch (err) {
    req.log.error({ err }, "Cast vote error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/status/:voterId", async (req, res) => {
  try {
    const { voterId } = req.params;

    const [voter] = await db.select({
      hasVoted: votersTable.hasVoted,
      votedAt: votersTable.votedAt,
    }).from(votersTable).where(eq(votersTable.voterId, voterId)).limit(1);

    if (!voter) {
      res.status(404).json({ error: "Voter not found" });
      return;
    }

    if (!voter.hasVoted) {
      res.json({ hasVoted: false, votedAt: null, candidateId: null });
      return;
    }

    const voterHash = sha256(voterId);
    const [vote] = await db.select().from(votesTable).where(eq(votesTable.voterId, voterHash)).limit(1);

    res.json({
      hasVoted: voter.hasVoted,
      votedAt: voter.votedAt?.toISOString() ?? null,
      candidateId: vote?.candidateId ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Get voting status error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
