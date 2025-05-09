import { deleteMe, getMe, updateMe } from "$/controllers/user.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const userRouter: Router = Router();

userRouter.get("/me", authenticate, getMe);
userRouter.patch("/me", authenticate, updateMe);
userRouter.delete("/me", authenticate, deleteMe);
