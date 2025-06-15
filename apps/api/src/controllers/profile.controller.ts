import {
  getProfileByUserId,
  getProfileByUsername,
  getShowcaseProfiles,
  updateProfile,
} from "$/services/profile.service";
import { ApiError } from "$/utils/errors";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type {
  AuthenticatedProfile,
  PublicProfile,
} from "@repo/shared/contracts";
import { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import type { Request, Response } from "express";

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const profile = await getProfileByUserId(userId);

  res.status(200).json(composeResponse<AuthenticatedProfile>(profile));
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { isPublic, ...profile } = await getProfileByUsername(username);
  if (!isPublic) {
    throw new ApiError(403, "PRIVATE_PROFILE");
  }

  res.status(200).json(composeResponse<PublicProfile>(profile));
};

export const updateMyProfile = async (req: Request, res: Response) => {
  const data = await validateSchema(UPDATE_PROFILE_SCHEMA, req.body);
  const updatedProfile = await updateProfile(req.user!.id, data);

  res.status(200).json(composeResponse<AuthenticatedProfile>(updatedProfile));
};

export const getShowcase = async (_: Request, res: Response) => {
  const profiles = await getShowcaseProfiles();

  res.status(200).json(composeResponse<PublicProfile[]>(profiles));
};
