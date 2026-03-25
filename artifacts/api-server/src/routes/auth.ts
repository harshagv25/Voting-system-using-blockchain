import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { votersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  sha256,
  generateVoterId,
  hashPassword,
  verifyPassword,
} from "../lib/crypto.js";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, aadhaarNumber, faceDescriptor } = req.body;

    if (!name || !email || !password || !aadhaarNumber) {
      res.status(400).json({ error: "Missing required fields", message: "Name, email, password, and Aadhaar number are required" });
      return;
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      res.status(400).json({ error: "Invalid Aadhaar", message: "Aadhaar number must be exactly 12 digits" });
      return;
    }

    const aadhaarHash = sha256(aadhaarNumber);

    const existingByEmail = await db.select().from(votersTable).where(eq(votersTable.email, email)).limit(1);
    if (existingByEmail.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }

    const existingByAadhaar = await db.select().from(votersTable).where(eq(votersTable.aadhaarHash, aadhaarHash)).limit(1);
    if (existingByAadhaar.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Aadhaar number already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const voterId = generateVoterId();

    const [voter] = await db.insert(votersTable).values({
      voterId,
      name,
      email,
      passwordHash,
      aadhaarHash,
      faceDescriptor: faceDescriptor ? JSON.stringify(faceDescriptor) : null,
    }).returning();

    const token = Buffer.from(`${voterId}:${Date.now()}`).toString("base64");

    res.status(201).json({
      voterId: voter.voterId,
      name: voter.name,
      email: voter.email,
      token,
      hasVoted: voter.hasVoted,
      aadhaarVerified: voter.aadhaarVerified,
    });
  } catch (err) {
    req.log.error({ err }, "Registration error");
    res.status(500).json({ error: "Internal error", message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Missing fields", message: "Email and password required" });
      return;
    }

    const [voter] = await db.select().from(votersTable).where(eq(votersTable.email, email)).limit(1);

    if (!voter) {
      res.status(401).json({ error: "Invalid credentials", message: "Email or password incorrect" });
      return;
    }

    const valid = await verifyPassword(password, voter.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials", message: "Email or password incorrect" });
      return;
    }

    const token = Buffer.from(`${voter.voterId}:${Date.now()}`).toString("base64");

    res.json({
      voterId: voter.voterId,
      name: voter.name,
      email: voter.email,
      token,
      hasVoted: voter.hasVoted,
      aadhaarVerified: voter.aadhaarVerified,
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Internal error", message: "Login failed" });
  }
});

router.post("/verify-aadhaar", async (req, res) => {
  try {
    const { voterId, aadhaarNumber } = req.body;

    if (!voterId || !aadhaarNumber) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      res.status(400).json({ error: "Invalid Aadhaar", message: "Must be 12 digits" });
      return;
    }

    const [voter] = await db.select().from(votersTable).where(eq(votersTable.voterId, voterId)).limit(1);

    if (!voter) {
      res.status(404).json({ error: "Voter not found" });
      return;
    }

    const inputHash = sha256(aadhaarNumber);
    if (inputHash !== voter.aadhaarHash) {
      res.status(401).json({ error: "Aadhaar mismatch", message: "Aadhaar verification failed" });
      return;
    }

    await db.update(votersTable).set({ aadhaarVerified: true }).where(eq(votersTable.voterId, voterId));

    res.json({ verified: true, message: "Aadhaar verified successfully" });
  } catch (err) {
    req.log.error({ err }, "Aadhaar verify error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/store-face", async (req, res) => {
  try {
    const { voterId, faceDescriptor } = req.body;

    if (!voterId || !faceDescriptor) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    await db.update(votersTable)
      .set({ faceDescriptor: JSON.stringify(faceDescriptor) })
      .where(eq(votersTable.voterId, voterId));

    res.json({ success: true, message: "Face data stored" });
  } catch (err) {
    req.log.error({ err }, "Store face error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const voterId = req.headers["x-voter-id"] as string;

    if (!voterId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [voter] = await db.select().from(votersTable).where(eq(votersTable.voterId, voterId)).limit(1);

    if (!voter) {
      res.status(404).json({ error: "Voter not found" });
      return;
    }

    res.json({
      voterId: voter.voterId,
      name: voter.name,
      email: voter.email,
      hasVoted: voter.hasVoted,
      aadhaarVerified: voter.aadhaarVerified,
      hasFaceData: !!voter.faceDescriptor,
      registeredAt: voter.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/face-descriptor/:voterId", async (req, res) => {
  try {
    const { voterId } = req.params;

    const [voter] = await db.select({
      faceDescriptor: votersTable.faceDescriptor,
    }).from(votersTable).where(eq(votersTable.voterId, voterId)).limit(1);

    if (!voter) {
      res.status(404).json({ error: "Voter not found" });
      return;
    }

    if (!voter.faceDescriptor) {
      res.status(404).json({ error: "No face data" });
      return;
    }

    res.json({ faceDescriptor: JSON.parse(voter.faceDescriptor) });
  } catch (err) {
    req.log.error({ err }, "Get face descriptor error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
