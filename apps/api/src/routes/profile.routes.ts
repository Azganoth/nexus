import {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} from "$/controllers/profile.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const profileRouter: Router = Router();

profileRouter.get("/me", authenticate, getMyProfile);
profileRouter.patch("/me", authenticate, updateMyProfile);
profileRouter.get("/:username", getPublicProfile);
