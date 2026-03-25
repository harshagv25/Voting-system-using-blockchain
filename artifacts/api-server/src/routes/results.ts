import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { candidatesTable, electionTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const elections = await db.select().from(electionTable).limit(1);
    const election = elections[0];

    const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.id);
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    const results = candidates.map((c) => ({
      candidateId: c.id,
      name: c.name,
      party: c.party,
      symbol: c.symbol,
      voteCount: c.voteCount,
      percentage: totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 10000) / 100 : 0,
    }));

    res.json({
      isHidden: election?.resultsHidden ?? false,
      totalVotes,
      results,
    });
  } catch (err) {
    req.log.error({ err }, "Get results error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
