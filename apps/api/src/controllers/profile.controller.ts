import {
  getProfileByUserId,
  getProfileByUsername,
} from "$/services/profile.service";
import { ApiError } from "$/utils/errors";
import { composeResponse } from "$/utils/helpers";
import type { PublicProfile } from "@repo/shared/contracts";
import type { Request, Response } from "express";

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const profile = await getProfileByUserId(userId);

  res.status(200).json(composeResponse<PublicProfile>(profile));
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const { username } = req.params;
  const profile = await getProfileByUsername(username);
  if (!profile.isPublic) {
    throw new ApiError(403, "PRIVATE_PROFILE");
  }

  res.status(200).json(composeResponse<PublicProfile>(profile));
};
