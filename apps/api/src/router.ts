import { authRouter } from "$/routes/auth.routes";
import { healthRouter } from "$/routes/health.routes";
import { linkRouter } from "$/routes/link.routes";
import { profileRouter } from "$/routes/profile.routes";
import { userRouter } from "$/routes/user.routes";
import { avatarRouter } from "$/routes/avatar.routes";
import { Router } from "express";

const router: Router = Router();

router.use("/auth", authRouter);
router.use("/health", healthRouter);
router.use("/users", userRouter);
router.use("/profiles", profileRouter);
router.use("/links", linkRouter);
router.use("/avatars", avatarRouter);

export default router;
