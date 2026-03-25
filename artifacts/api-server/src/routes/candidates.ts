import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { candidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.id);
    res.json(candidates);
  } catch (err) {
    req.log.error({ err }, "List candidates error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, party, description, photoUrl, symbol } = req.body;

    if (!name || !party || !description) {
      res.status(400).json({ error: "Missing fields", message: "Name, party, and description required" });
      return;
    }

    const [candidate] = await db.insert(candidatesTable).values({
      name,
      party,
      description,
      photoUrl: photoUrl || null,
      symbol: symbol || null,
    }).returning();

    res.status(201).json(candidate);
  } catch (err) {
    req.log.error({ err }, "Create candidate error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, party, description, photoUrl, symbol } = req.body;

    const [candidate] = await db.update(candidatesTable)
      .set({ name, party, description, photoUrl: photoUrl || null, symbol: symbol || null })
      .where(eq(candidatesTable.id, id))
      .returning();

    if (!candidate) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    res.json(candidate);
  } catch (err) {
    req.log.error({ err }, "Update candidate error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await db.delete(candidatesTable).where(eq(candidatesTable.id, id));

    res.json({ success: true, message: "Candidate deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete candidate error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
