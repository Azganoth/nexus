import {
  createRandomProfileWithLinks,
  createRandomUser,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { PUBLIC_PROFILE_SELECT, PUBLIC_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import {
  getProfileByUserId,
  getProfileByUsername,
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

describe("Profile Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockPublicUser = selectData(mockUser, PUBLIC_USER_SELECT);

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("GET /profiles/me", () => {
    it("should return 401 if no token is provided", async () => {
      const response = await supertest(app).get("/profiles/me");
      expect(response.status).toBe(401);
      expect(response.body.code).toBe("NOT_LOGGED_IN");
    });

    it("should return the authenticated user's profile if the token is valid", async () => {
      const profile = createRandomProfileWithLinks(mockUser.id);
      const publicProfile = selectData(profile, PUBLIC_PROFILE_SELECT);
      const accessToken = signAccessToken(mockUser.id, mockUser.role);
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);
      mockGetProfileByUserId.mockResolvedValue(publicProfile);

      const response = await supertest(app)
        .get("/profiles/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.id).toBe(publicProfile.id);
      expect(response.body.data.username).toBe(publicProfile.username);
      expect(response.body.data.links.length).toBe(3);
    });
  });

  describe("GET /profiles/:username", () => {
    it("should return a public profile successfully", async () => {
      const profile = createRandomProfileWithLinks(mockUser.id, 5, {
        isPublic: true,
      });
      const publicProfile = selectData(profile, PUBLIC_PROFILE_SELECT);
      mockGetProfileByUsername.mockResolvedValue(publicProfile);

      const response = await supertest(app).get(
        `/profiles/${publicProfile.username}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.username).toBe(publicProfile.username);
      expect(response.body.data.links.length).toBe(5);
    });

    it("should return 403 for a private profile", async () => {
      const profile = createRandomProfileWithLinks(mockUser.id, 5, {
        isPublic: false,
      });
      const publicProfile = selectData(profile, PUBLIC_PROFILE_SELECT);
      mockGetProfileByUsername.mockResolvedValue(publicProfile);

      const response = await supertest(app).get(
        `/profiles/${publicProfile.username}`,
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
});
