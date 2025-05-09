import {
  createLink,
  deleteLink,
  getLinks,
  updateLink,
  updateLinkOrder,
} from "$/controllers/link.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const linkRouter: Router = Router();

linkRouter.patch("/order", authenticate, updateLinkOrder);
linkRouter.get("/", authenticate, getLinks);
linkRouter.post("/", authenticate, createLink);
linkRouter.patch("/:id", authenticate, updateLink);
linkRouter.delete("/:id", authenticate, deleteLink);
