import { AUTHENTICATED_LINK_SELECT, UNUSED_SELECT } from "$/constants";
import { ApiError } from "$/utils/errors";
import { prisma, Prisma } from "@repo/database";
import type { AuthenticatedLink } from "@repo/shared/contracts";
import type {
  CREATE_LINK_SCHEMA,
  UPDATE_LINK_SCHEMA,
} from "@repo/shared/schemas";
import type { z } from "zod/v4";

export const getLinksForUser = async (
  userId: string,
): Promise<AuthenticatedLink[]> => {
  const links = await prisma.link.findMany({
    where: {
      profile: { userId },
    },
    orderBy: {
      displayOrder: "asc",
    },
    select: AUTHENTICATED_LINK_SELECT,
  });
  return links;
};

export const createLinkForUser = async (
  userId: string,
  data: z.infer<typeof CREATE_LINK_SCHEMA>,
): Promise<AuthenticatedLink> => {
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
      displayOrder: profile._count.links + 1,
    },
    select: AUTHENTICATED_LINK_SELECT,
  });

  return newLink;
};

export const updateUserLink = async (
  userId: string,
  linkId: number,
  data: Partial<z.infer<typeof UPDATE_LINK_SCHEMA>>,
): Promise<AuthenticatedLink> => {
  try {
    const updatedLink = await prisma.link.update({
      where: {
        id: linkId,
        profile: { userId },
      },
      data,
      select: AUTHENTICATED_LINK_SELECT,
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

async function reindexProfileLinks(profileId: string) {
  const links = await prisma.link.findMany({
    where: { profileId },
    orderBy: { displayOrder: "asc" },
    select: { id: true },
  });

  await prisma.$transaction(
    links.map((link, idx) =>
      prisma.link.update({
        where: { id: link.id },
        data: { displayOrder: idx },
        select: { id: true },
      }),
    ),
  );
}

export const deleteUserLink = async (
  userId: string,
  linkId: number,
): Promise<void> => {
  try {
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
      select: { id: true },
    });

    await prisma.link.delete({
      where: {
        id: linkId,
        profile: { userId },
      },
      select: UNUSED_SELECT,
    });

    await reindexProfileLinks(profile.id);
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

export const updateLinkOrderForUser = async (
  userId: string,
  orderedIds: number[],
): Promise<void> => {
  const userLinks = await prisma.link.findMany({
    where: { profile: { userId } },
    select: { id: true },
  });

  const existingIds = new Set(userLinks.map((link) => link.id));
  const receivedIds = new Set(orderedIds);

  // Ensure the received IDs match exactly the user's actual links.
  if (
    existingIds.size !== receivedIds.size ||
    !orderedIds.every((id) => existingIds.has(id))
  ) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "A lista de IDs fornecida é inválida ou não corresponde aos seus links.",
    );
  }

  await prisma.$transaction(async (tx) => {
    // Set all displayOrder values to negative values to
    // workaround unique contraint crashes
    await Promise.all(
      orderedIds.map((id, index) =>
        tx.link.update({
          where: { id },
          data: { displayOrder: -(index + 1) },
          select: { id: true },
        }),
      ),
    );

    await Promise.all(
      orderedIds.map((id, index) =>
        tx.link.update({
          where: { id },
          data: { displayOrder: index },
          select: { id: true },
        }),
      ),
    );
  });
};
