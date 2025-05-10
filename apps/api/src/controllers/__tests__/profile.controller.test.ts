import {
  createRandomProfileWithLinks,
  createRandomUser,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import {
  AUTHENTICATED_PROFILE_SELECT,
  AUTHENTICATED_USER_SELECT,
  PUBLIC_PROFILE_SELECT,
} from "$/constants";
import { createServer } from "$/server";
import {
  getProfileByUserId,
  getProfileByUsername,
  updateProfile,
} from "$/services/profile.service";
import { ApiError } from "$/utils/errors";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";
import type { Express } from "express";
import supertest from "supertest";

jest.mock("$/services/profile.service");

const mockGetProfileByUserId = jest.mocked(getProfileByUserId);
const mockGetProfileByUsername = jest.mocked(getProfileByUsername);
const mockUpdateProfile = jest.mocked(updateProfile);

describe("Profile Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockAuthenticatedUser = selectData(mockUser, AUTHENTICATED_USER_SELECT);
  const mockAccessToken = signAccessToken(mockUser.id, mockUser.role);

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("GET /profiles/me", () => {
    it("returns the authenticated user's profile", async () => {
      const profile = createRandomProfileWithLinks(mockUser.id);
      const publicProfile = selectData(profile, AUTHENTICATED_PROFILE_SELECT);
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      mockGetProfileByUserId.mockResolvedValue(publicProfile);

      const response = await supertest(app)
        .get("/profiles/me")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.id).toBe(publicProfile.id);
      expect(response.body.data.username).toBe(publicProfile.username);
      expect(response.body.data.links.length).toBe(3);
    });

    it("should return 401 if no token is provided", async () => {
      const response = await supertest(app).get("/profiles/me");
      expect(response.status).toBe(401);
      expect(response.body.code).toBe("NOT_LOGGED_IN");
    });
  });

  describe("GET /profiles/:username", () => {
    it("returns a public profile", async () => {
      const profile = selectData(
        createRandomProfileWithLinks(mockUser.id, 5, { isPublic: true }),
        {
          ...PUBLIC_PROFILE_SELECT,
          isPublic: true,
        },
      );
      mockGetProfileByUsername.mockResolvedValue(profile);

      const response = await supertest(app).get(
        `/profiles/${profile.username}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.username).toBe(profile.username);
      expect(response.body.data.links.length).toBe(5);
    });

    it("should return 403 for a private profile", async () => {
      const profile = selectData(
        createRandomProfileWithLinks(mockUser.id, 5, { isPublic: false }),
        {
          ...PUBLIC_PROFILE_SELECT,
          isPublic: true,
        },
      );
      mockGetProfileByUsername.mockResolvedValue(profile);

      const response = await supertest(app).get(
        `/profiles/${profile.username}`,
      );

      expect(response.status).toBe(403);
      expect(response.body.code).toBe("PRIVATE_PROFILE");
    });

    it("should return 404 if the profile is not found", async () => {
      const notFoundError = new ApiError(404, "NOT_FOUND");
      mockGetProfileByUsername.mockRejectedValue(notFoundError);

      const response = await supertest(app).get("/profiles/nonexistentuser");

      expect(response.status).toBe(404);
      expect(response.body.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /profiles/me", () => {
    it("should return 401 if no token is provided", async () => {
      const response = await supertest(app)
        .patch("/profiles/me")
        .send({ bio: "new bio" });

      expect(response.status).toBe(401);
    });

    it("should return 422 for invalid update data", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const response = await supertest(app)
        .patch("/profiles/me")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ displayName: "a".repeat(61) });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("fail");
      expect(response.body.data).toHaveProperty("displayName");
    });

    it("updates the profile and returns the updated data", async () => {
      const updateData = {
        bio: "Minha bio atualizada.",
      };
      const updatedProfile = {
        ...createRandomProfileWithLinks(mockUser.id),
        ...updateData,
      };
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      mockUpdateProfile.mockResolvedValue(updatedProfile);

      const response = await supertest(app)
        .patch("/profiles/me")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.bio).toBe(updateData.bio);
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser.id, updateData);
    });
  });
});
