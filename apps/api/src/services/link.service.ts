import { ID_SELECT, PUBLIC_LINK_SELECT } from "$/constants";
import { ApiError } from "$/utils/errors";
import { prisma, Prisma } from "@repo/database";
import type { CREATE_LINK_SCHEMA } from "@repo/shared/schemas";
import type { z } from "zod";

export const getLinksForUser = async (userId: string) => {
  const links = await prisma.link.findMany({
    where: { profile: { userId } },
    orderBy: { displayOrder: "asc" },
    select: PUBLIC_LINK_SELECT,
  });
  return links;
};

export const createLinkForUser = async (
  userId: string,
  data: z.infer<typeof CREATE_LINK_SCHEMA>,
) => {
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { userId },
    select: { id: true, _count: { select: { links: true } } },
  });

  if (profile._count.links >= 10) {
    throw new ApiError(403, "TOO_MANY_LINKS");
  }

  const newLink = await prisma.link.create({
    data: {
      ...data,
      profileId: profile.id,
      displayOrder: profile._count.links,
    },
    select: PUBLIC_LINK_SELECT,
  });

  return newLink;
};

export const updateUserLink = async (
  userId: string,
  linkId: number,
  data: Partial<z.infer<typeof CREATE_LINK_SCHEMA>>,
) => {
  try {
    const updatedLink = await prisma.link.update({
      where: {
        id: linkId,
        profile: { userId },
      },
      data,
      select: PUBLIC_LINK_SELECT,
    });

    return updatedLink;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ApiError(404, "NOT_FOUND", "O link não foi encontrado.");
    }
    throw error;
  }
};

export const deleteUserLink = async (userId: string, linkId: number) => {
  try {
    await prisma.link.delete({
      where: {
        id: linkId,
        profile: { userId },
      },
      select: ID_SELECT,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ApiError(404, "NOT_FOUND", "O link não foi encontrado.");
    }
    throw error;
  }
};
