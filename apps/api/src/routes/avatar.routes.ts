import { createMyAvatarUploadUrls } from "$/controllers/avatar.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const avatarRouter: Router = Router();

avatarRouter.post("/upload-url", authenticate, createMyAvatarUploadUrls);
