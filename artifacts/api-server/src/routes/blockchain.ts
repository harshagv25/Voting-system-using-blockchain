import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { votesTable } from "@workspace/db";
import { computeBlockHash } from "../lib/crypto.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const votes = await db.select().from(votesTable).orderBy(votesTable.blockIndex);

    let isValid = true;
    for (let i = 1; i < votes.length; i++) {
      if (votes[i].previousHash !== votes[i - 1].hash) {
        isValid = false;
        break;
      }
    }

    const blocks = votes.map((v) => ({
      index: v.blockIndex,
      voterId: v.voterId,
      candidateId: v.candidateId,
      timestamp: v.createdAt.toISOString(),
      previousHash: v.previousHash,
      hash: v.hash,
      nonce: v.nonce,
    }));

    res.json({
      blocks,
      isValid,
      totalBlocks: blocks.length,
    });
  } catch (err) {
    req.log.error({ err }, "Get blockchain error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/validate", async (req, res) => {
  try {
    const votes = await db.select().from(votesTable).orderBy(votesTable.blockIndex);

    if (votes.length === 0) {
      res.json({ isValid: true, message: "Blockchain is empty — no votes yet", brokenAt: null });
      return;
    }

    for (let i = 0; i < votes.length; i++) {
      const v = votes[i];
      const recomputed = computeBlockHash({
        index: v.blockIndex,
        voterId: v.voterId,
        candidateId: v.candidateId,
        timestamp: v.createdAt.toISOString(),
        previousHash: v.previousHash,
        nonce: v.nonce,
      });

      if (recomputed !== v.hash) {
        res.json({
          isValid: false,
          message: `Chain integrity broken at block ${v.blockIndex}`,
          brokenAt: v.blockIndex,
        });
        return;
      }

      if (i > 0 && v.previousHash !== votes[i - 1].hash) {
        res.json({
          isValid: false,
          message: `Chain link broken at block ${v.blockIndex}`,
          brokenAt: v.blockIndex,
        });
        return;
      }
    }

    res.json({ isValid: true, message: "Blockchain integrity verified — all blocks valid", brokenAt: null });
  } catch (err) {
    req.log.error({ err }, "Validate blockchain error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
