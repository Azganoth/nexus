import {
  createRandomProfileWithLinks,
  createRandomUser,
  type ProfileWithLinks,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import {
  AUTHENTICATED_PROFILE_SELECT,
  PUBLIC_PROFILE_SELECT,
} from "$/constants";
import {
  getProfileByUserId,
  getProfileByUsername,
  updateProfile,
} from "$/services/profile.service";
import { ApiError } from "$/utils/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { AuthenticatedProfile } from "@repo/shared/contracts";

describe("Profile Service", () => {
  const mockUser = createRandomUser();
  const mockProfile = createRandomProfileWithLinks(mockUser.id);
  const mockAuthenticatedProfile = selectData(
    mockProfile,
    AUTHENTICATED_PROFILE_SELECT,
  );
  const mockPublicProfile = selectData(mockProfile, PUBLIC_PROFILE_SELECT);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfileByUserId", () => {
    it("returns a profile when found", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(
        mockAuthenticatedProfile as ProfileWithLinks,
      );

      const profile = await getProfileByUserId(mockUser.id);

      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        }),
      );
      expect(profile).toEqual(mockAuthenticatedProfile);
    });

    it("should throw ApiError if no profile is found", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      await expect(getProfileByUserId("non-existent-user-id")).rejects.toThrow(
        ApiError,
      );
      await expect(
        getProfileByUserId("non-existent-user-id"),
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });

  describe("getProfileByUsername", () => {
    const mockProfileByUsername = {
      ...mockPublicProfile,
      isPublic: true,
    };

    it("returns a profile including private fields when found", async () => {
      mockPrisma.profile.findFirst.mockResolvedValue(
        mockProfileByUsername as ProfileWithLinks,
      );

      const profile = await getProfileByUsername(mockUser.id);

      expect(mockPrisma.profile.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { username: mockUser.id },
        }),
      );
      expect(profile).toEqual(mockProfileByUsername);
    });

    it("should throw ApiError if no profile is found", async () => {
      mockPrisma.profile.findFirst.mockResolvedValue(null);

      await expect(getProfileByUsername("non-existent-user")).rejects.toThrow(
        ApiError,
      );
      await expect(
        getProfileByUsername("non-existent-user"),
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });

  describe("updateProfile", () => {
    it("updates the profile with the provided data", async () => {
      const updateData = {
        displayName: "Novo Nome",
        bio: "Bio atualizada.",
      };
      const updatedProfile: AuthenticatedProfile = {
        ...mockAuthenticatedProfile,
        ...updateData,
      };
      mockPrisma.profile.update.mockResolvedValue(
        updatedProfile as ProfileWithLinks,
      );

      const result = await updateProfile(mockUser.id, updateData);

      expect(mockPrisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
          data: updateData,
        }),
      );

      expect(result.displayName).toBe(updateData.displayName);
      expect(result.bio).toBe(updateData.bio);
    });

    it("should throw an error if prisma fails to update", async () => {
      const dbError = new Error("Database update failed");
      mockPrisma.profile.update.mockRejectedValue(dbError);

      await expect(
        updateProfile(mockUser.id, { displayName: "test" }),
      ).rejects.toThrow(dbError);
    });
  });
});
