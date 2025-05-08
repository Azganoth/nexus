import { PUBLIC_LINK_SELECT, PUBLIC_PROFILE_SELECT } from "$/constants";
import { ApiError } from "$/utils/errors";
import { prisma } from "@repo/database";
import type { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import type { z } from "zod";

export const getProfileByUserId = async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      ...PUBLIC_PROFILE_SELECT,
      links: {
        orderBy: {
          displayOrder: "asc",
        },
        select: PUBLIC_LINK_SELECT,
      },
    },
  });

  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Este perfil não existe.");
  }

  return profile;
};

export const getProfileByUsername = async (username: string) => {
  const profile = await prisma.profile.findFirst({
    where: { username },
    select: {
      ...PUBLIC_PROFILE_SELECT,
      links: {
        where: {
          isPublic: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
        select: PUBLIC_LINK_SELECT,
      },
    },
  });

  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Este perfil público não existe.");
  }

  return profile;
};

export const updateProfile = async (
  userId: string,
  data: z.infer<typeof UPDATE_PROFILE_SCHEMA>,
) => {
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data,
    select: {
      ...PUBLIC_PROFILE_SELECT,
      links: {
        orderBy: {
          displayOrder: "asc",
        },
        select: PUBLIC_LINK_SELECT,
      },
    },
  });

  return updatedProfile;
};
