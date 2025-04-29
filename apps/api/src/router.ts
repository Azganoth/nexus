import { authRouter } from "$/routes/auth.routes";
import { healthRouter } from "$/routes/health.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/auth", authRouter);
router.use("/health", healthRouter);

export default router;
