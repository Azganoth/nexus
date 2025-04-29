import { authRouter } from "$/routes/auth.routes";
import { healthRouter } from "$/routes/health.routes";
import { userRouter } from "$/routes/user.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/auth", authRouter);
router.use("/health", healthRouter);
router.use("/users", userRouter);

export default router;
