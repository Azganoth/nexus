import {
  getMyProfile,
  getPublicProfile,
} from "$/controllers/profile.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const profileRouter: Router = Router();

profileRouter.get("/me", authenticate, getMyProfile);
profileRouter.get("/:username", getPublicProfile);
