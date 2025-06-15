import {
  AUTHENTICATED_LINK_SELECT,
  AUTHENTICATED_PROFILE_SELECT,
  PUBLIC_LINK_SELECT,
  PUBLIC_PROFILE_SELECT,
  SHOWCASE_USERNAMES,
} from "$/constants";
import { ApiError } from "$/utils/errors";
import { prisma } from "@repo/database";
import type {
  AuthenticatedProfile,
  PublicProfile,
} from "@repo/shared/contracts";
import type { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import type { z } from "zod/v4";

export const getProfileByUserId = async (
  userId: string,
): Promise<AuthenticatedProfile> => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      ...AUTHENTICATED_PROFILE_SELECT,
      links: {
        orderBy: {
          displayOrder: "asc",
        },
        select: AUTHENTICATED_LINK_SELECT,
      },
    },
  });

  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Este perfil não existe.");
  }

  return profile;
};

export const getProfileByUsername = async (
  username: string,
): Promise<PublicProfile & { isPublic: boolean }> => {
  const profile = await prisma.profile.findFirst({
    where: { username },
    select: {
      ...PUBLIC_PROFILE_SELECT,
      isPublic: true,
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
): Promise<AuthenticatedProfile> => {
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data,
    select: {
      ...AUTHENTICATED_PROFILE_SELECT,
      links: {
        orderBy: {
          displayOrder: "asc",
        },
        select: AUTHENTICATED_LINK_SELECT,
      },
    },
  });

  return updatedProfile;
};

export const getShowcaseProfiles = async (): Promise<PublicProfile[]> => {
  const profiles = await prisma.profile.findMany({
    where: {
      username: { in: SHOWCASE_USERNAMES },
      isPublic: true,
    },
    select: {
      ...PUBLIC_PROFILE_SELECT,
      links: {
        where: { isPublic: true },
        orderBy: { displayOrder: "asc" },
        select: PUBLIC_LINK_SELECT,
      },
    },
  });

  return profiles.sort(
    (a, b) =>
      SHOWCASE_USERNAMES.indexOf(a.username) -
      SHOWCASE_USERNAMES.indexOf(b.username),
  );
};
