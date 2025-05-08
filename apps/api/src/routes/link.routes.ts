import {
  createLink,
  deleteLink,
  getLinks,
  updateLink,
} from "$/controllers/link.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const linkRouter: Router = Router();

linkRouter.get("/", authenticate, getLinks);
linkRouter.post("/", authenticate, createLink);
linkRouter.patch("/:id", authenticate, updateLink);
linkRouter.delete("/:id", authenticate, deleteLink);
