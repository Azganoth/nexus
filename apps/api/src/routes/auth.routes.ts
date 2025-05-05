import {
  login,
  logout,
  refreshAccess,
  signup,
} from "$/controllers/auth.controller";
import { authLimiter } from "$/middlewares/security.middleware";
import { Router } from "express";

export const authRouter: Router = Router();

authRouter.post("/login", authLimiter, login);
authRouter.post("/signup", signup);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshAccess);
