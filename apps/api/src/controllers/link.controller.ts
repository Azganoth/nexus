import {
  createLinkForUser,
  deleteUserLink,
  getLinksForUser,
  updateUserLink,
} from "$/services/link.service";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { PublicLink } from "@repo/shared/contracts";
import { CREATE_LINK_SCHEMA, UPDATE_LINK_SCHEMA } from "@repo/shared/schemas";
import type { Request, Response } from "express";

export const getLinks = async (req: Request, res: Response) => {
  const links = await getLinksForUser(req.user!.id);

  res.status(200).json(composeResponse<PublicLink[]>(links));
};

export const createLink = async (req: Request, res: Response) => {
  const data = await validateSchema(CREATE_LINK_SCHEMA, req.body);
  const newLink = await createLinkForUser(req.user!.id, data);

  res.status(201).json(composeResponse<PublicLink>(newLink));
};

export const updateLink = async (req: Request, res: Response) => {
  const data = await validateSchema(UPDATE_LINK_SCHEMA, req.body);
  const linkId = Number(req.params.id);
  const updatedLink = await updateUserLink(req.user!.id, linkId, data);

  res.status(200).json(composeResponse<PublicLink>(updatedLink));
};

export const deleteLink = async (req: Request, res: Response) => {
  const linkId = Number(req.params.id);
  await deleteUserLink(req.user!.id, linkId);

  res.status(204).end();
};
