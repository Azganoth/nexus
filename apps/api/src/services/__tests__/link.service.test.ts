import {
  createRandomLink,
  createRandomProfileWithLinks,
  createRandomUser,
} from "$/__tests__/factories";
import { mockTransaction, selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { PUBLIC_LINK_SELECT } from "$/constants";
import {
  createLinkForUser,
  deleteUserLink,
  getLinksForUser,
  updateLinkOrderForUser,
  updateUserLink,
} from "$/services/link.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma, type Link, type Profile } from "@repo/database";

describe("Link Service", () => {
  const mockUser = createRandomUser();
  const mockProfile = createRandomProfileWithLinks(mockUser.id);
  const mockLink = createRandomLink(mockProfile.id);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getLinksForUser", () => {
    it("should return an array of links for a given user", async () => {
      mockPrisma.link.findMany.mockResolvedValue(mockProfile.links);

      const result = await getLinksForUser(mockUser.id);

      expect(mockPrisma.link.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { profile: { userId: mockUser.id } },
          orderBy: { displayOrder: "asc" },
        }),
      );
      expect(result).toHaveLength(mockProfile.links.length);
      expect(result).toEqual(mockProfile.links);
    });

    it("should return an empty array if the user has no links", async () => {
      mockPrisma.link.findMany.mockResolvedValue([]);

      const result = await getLinksForUser(mockUser.id);

      expect(result).toEqual([]);
    });
  });

  describe("createLinkForUser", () => {
    const mockNewLink = { title: "Novo Link", url: "https://example.com" };

    it("should successfully create a link if the user is under the limit", async () => {
      const profile = {
        ...selectData(mockProfile, { id: true }),
        _count: { links: mockProfile.links.length },
      };
      mockPrisma.link.create.mockResolvedValue(mockLink);
      mockPrisma.profile.findUniqueOrThrow.mockResolvedValue(
        profile as unknown as Profile,
      );

      const result = await createLinkForUser(mockUser.id, mockNewLink);

      expect(mockPrisma.link.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ...mockNewLink,
            profileId: mockProfile.id,
            displayOrder: profile._count.links,
          },
        }),
      );
      expect(result).toEqual(mockLink);
    });

    it("should throw ApiError if the user has reached the link limit", async () => {
      const profile = {
        ...selectData(mockProfile, { id: true }),
        _count: { links: 10 },
      };
      mockPrisma.profile.findUniqueOrThrow.mockResolvedValue(
        profile as unknown as Profile,
      );

      await expect(
        createLinkForUser(mockUser.id, mockNewLink),
      ).rejects.toThrowApiError(403, "TOO_MANY_LINKS");
    });
  });

  describe("updateUserLink", () => {
    const mockUpdateData = { title: "Título Atualizado" };

    it("should successfully update a link", async () => {
      const updatedLink = {
        ...selectData(mockLink, PUBLIC_LINK_SELECT),
        ...mockUpdateData,
      };
      mockPrisma.link.update.mockResolvedValue(updatedLink as Link);

      const result = await updateUserLink(
        mockUser.id,
        mockLink.id,
        mockUpdateData,
      );

      expect(mockPrisma.link.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockLink.id, profile: { userId: mockUser.id } },
          data: mockUpdateData,
        }),
      );
      expect(result).toEqual(updatedLink);
    });

    it("should throw ApiError if the link to update is not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("", {
        code: "P2025",
        clientVersion: "",
      });
      mockPrisma.link.update.mockRejectedValue(prismaError);

      await expect(
        updateUserLink(mockUser.id, mockLink.id, mockUpdateData),
      ).rejects.toThrowApiError(404, "NOT_FOUND");
    });
  });

  describe("deleteUserLink", () => {
    it("should successfully delete a link", async () => {
      mockPrisma.link.delete.mockResolvedValue(
        selectData(mockLink, { id: true }) as Link,
      );

      await expect(
        deleteUserLink(mockUser.id, mockLink.id),
      ).resolves.not.toThrow();

      expect(mockPrisma.link.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockLink.id, profile: { userId: mockUser.id } },
        }),
      );
    });

    it("should throw a 404 ApiError if the link to delete is not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("", {
        code: "P2025",
        clientVersion: "",
      });
      mockPrisma.link.delete.mockRejectedValue(prismaError);

      await expect(
        deleteUserLink(mockUser.id, mockLink.id),
      ).rejects.toThrowApiError(404, "NOT_FOUND");
    });
  });

  describe("updateLinkOrderForUser", () => {
    const mockLinks = [{ id: 1 }, { id: 2 }, { id: 3 }];

    it("should successfully update the order of links", async () => {
      const newOrder = [2, 3, 1];
      mockPrisma.link.findMany.mockResolvedValue(mockLinks as Link[]);
      mockTransaction(mockPrisma);

      await updateLinkOrderForUser(mockUser.id, newOrder);

      expect(mockPrisma.link.update).toHaveBeenCalledTimes(3);
      expect(mockPrisma.link.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: expect.any(Number) },
          data: { displayOrder: expect.any(Number) },
        }),
      );
    });

    it("should throw ApiError if ID counts do not match", async () => {
      mockPrisma.link.findMany.mockResolvedValue(mockLinks as Link[]);
      const newOrderWithMissingId = [1];

      await expect(
        updateLinkOrderForUser(mockUser.id, newOrderWithMissingId),
      ).rejects.toThrowApiError(400, "BAD_REQUEST");
    });

    it("should throw ApiError if an unknown ID is provided", async () => {
      mockPrisma.link.findMany.mockResolvedValue(mockLinks as Link[]);
      const newOrderWithUnknownId = [1, 999];

      await expect(
        updateLinkOrderForUser(mockUser.id, newOrderWithUnknownId),
      ).rejects.toThrowApiError(400, "BAD_REQUEST");
    });
  });
});
