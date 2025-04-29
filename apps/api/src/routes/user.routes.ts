import { getMe } from "$/controllers/user.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const userRouter: Router = Router();

userRouter.get("/me", authenticate, getMe);
