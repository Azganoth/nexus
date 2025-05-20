import {
  AUTHENTICATED_LINK_SELECT,
  AUTHENTICATED_PROFILE_SELECT,
  AUTHENTICATED_USER_SELECT,
} from "$/constants";
import { ApiError, ValidationError } from "$/utils/errors";
import { prisma } from "@repo/database";
import type { AuthenticatedUser, UserDataExport } from "@repo/shared/contracts";
import type { UPDATE_USER_SCHEMA } from "@repo/shared/schemas";
import bcrypt from "bcrypt";
import type { z } from "zod/v4";

export const updateUser = async (
  userId: string,
  data: z.infer<typeof UPDATE_USER_SCHEMA>,
): Promise<AuthenticatedUser> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: AUTHENTICATED_USER_SELECT,
  });

  return user;
};

export const deleteUser = async (
  userId: string,
  password: string,
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user) {
    throw new ApiError(404, "NOT_FOUND");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ValidationError({ password: ["A senha está incorreta."] });
  }

  // Hard delete.
  await prisma.user.delete({
    where: { id: userId },
  });
};

export const exportUserData = async (
  userId: string,
): Promise<UserDataExport> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...AUTHENTICATED_USER_SELECT,
      profile: {
        select: {
          ...AUTHENTICATED_PROFILE_SELECT,
          links: {
            orderBy: { displayOrder: "asc" },
            select: AUTHENTICATED_LINK_SELECT,
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "NOT_FOUND");
  }

  const { profile, ...exportedUser } = user;
  const exportedData: UserDataExport = {
    user: exportedUser,
    profile: null,
    links: null,
    exportDate: new Date(),
  };

  if (profile) {
    const { links, ...exportedProfile } = profile;
    exportedData.profile = exportedProfile;

    if (links) {
      exportedData.links = links;
    }
  }

  return exportedData;
};
