import {
  forgotPassword,
  login,
  logout,
  refreshAccess,
  resetPassword,
  revalidateSession,
  signup,
  verifyResetToken,
} from "$/controllers/auth.controller";
import { authLimiter } from "$/middlewares/security.middleware";
import { Router } from "express";

export const authRouter: Router = Router();

authRouter.get("/session", revalidateSession);
authRouter.post("/login", authLimiter, login);
authRouter.post("/signup", authLimiter, signup);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshAccess);
authRouter.post("/forgot-password", authLimiter, forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/verify-reset-token", verifyResetToken);
