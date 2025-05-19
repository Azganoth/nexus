import { createAvatarUploadUrlsByUserId } from "$/services/avatar.service";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { AvatarUploadUrls } from "@repo/shared/contracts";
import { AVATAR_UPLOAD_SCHEMA } from "@repo/shared/schemas";
import { Request, Response } from "express";

export const createMyAvatarUploadUrls = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = await validateSchema(AVATAR_UPLOAD_SCHEMA, req.body);
  const result = await createAvatarUploadUrlsByUserId(userId, data);

  res.status(200).json(composeResponse<AvatarUploadUrls>(result));
};
