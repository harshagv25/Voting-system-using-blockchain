import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import candidatesRouter from "./candidates.js";
import votingRouter from "./voting.js";
import resultsRouter from "./results.js";
import blockchainRouter from "./blockchain.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/candidates", candidatesRouter);
router.use("/voting", votingRouter);
router.use("/results", resultsRouter);
router.use("/blockchain", blockchainRouter);
router.use("/admin", adminRouter);

export default router;
