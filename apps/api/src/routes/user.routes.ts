import {
  deleteMe,
  getMe,
  updateMe,
  exportMyData,
} from "$/controllers/user.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const userRouter: Router = Router();

userRouter.get("/me", authenticate, getMe);
userRouter.patch("/me", authenticate, updateMe);
userRouter.delete("/me", authenticate, deleteMe);
userRouter.get("/me/export", authenticate, exportMyData);
