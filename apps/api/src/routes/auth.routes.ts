import {
  forgotPassword,
  login,
  logout,
  refreshAccess,
  resetPassword,
  signup,
  verifyResetToken,
} from "$/controllers/auth.controller";
import { authLimiter } from "$/middlewares/security.middleware";
import { Router } from "express";

export const authRouter: Router = Router();

authRouter.post("/login", authLimiter, login);
authRouter.post("/signup", signup);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshAccess);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/verify-reset-token", verifyResetToken);
