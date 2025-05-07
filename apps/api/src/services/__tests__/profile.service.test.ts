import { createRandomProfile, createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { PUBLIC_PROFILE_SELECT } from "$/constants";
import {
  getProfileByUserId,
  getProfileByUsername,
} from "$/services/profile.service";
import { ApiError } from "$/utils/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Profile } from "@repo/database";

describe("Profile Service", () => {
  const mockUser = createRandomUser();
  const mockProfile = createRandomProfile(mockUser.id);
  const mockPublicProfile = selectData(mockProfile, PUBLIC_PROFILE_SELECT);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfileByUserId", () => {
    it("should return a profile when found", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(
        mockPublicProfile as Profile,
      );

      const profile = await getProfileByUserId(mockUser.id);

      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        }),
      );
      expect(profile).toEqual(mockPublicProfile);
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
    it("should return a profile including private fields when found", async () => {
      mockPrisma.profile.findFirst.mockResolvedValue(
        mockPublicProfile as Profile,
      );

      const profile = await getProfileByUsername(mockUser.id);

      expect(mockPrisma.profile.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { username: mockUser.id },
        }),
      );
      expect(profile).toEqual(mockPublicProfile);
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
});
