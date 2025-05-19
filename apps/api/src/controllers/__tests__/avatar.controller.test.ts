import { createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { AUTHENTICATED_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import { createAvatarUploadUrlsByUserId } from "$/services/avatar.service";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";
import type { AvatarUploadUrls } from "@repo/shared/contracts";
import type { Express } from "express";
import supertest from "supertest";

jest.mock("$/services/avatar.service");

const mockCreateAvatarUploadUrlsByUserId = jest.mocked(createAvatarUploadUrlsByUserId);

describe("Avatar Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockAuthenticatedUser = selectData(mockUser, AUTHENTICATED_USER_SELECT);
  const mockAccessToken = signAccessToken(mockUser.id, mockUser.role);

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("POST /avatars/upload-url", () => {
    const validBody = { fileExt: "png", fileSize: 1024, fileType: "image/png" };
    const mockResult: AvatarUploadUrls = {
      uploadUrl: "https://upload.url",
      publicUrl: "https://public.url/avatar.png",
    };

    it("returns 200 and upload/public URLs on success", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      mockCreateAvatarUploadUrlsByUserId.mockResolvedValue(mockResult);

      const response = await supertest(app)
        .post("/avatars/upload-url")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockResult);
      expect(mockCreateAvatarUploadUrlsByUserId).toHaveBeenCalledWith(
        mockUser.id,
        validBody,
      );
    });

    it("should return 401 if no token is provided", async () => {
      const response = await supertest(app)
        .post("/avatars/upload-url")
        .send(validBody);

      expect(response.status).toBe(401);
    });

    it("should return 422 for invalid body", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const response = await supertest(app)
        .post("/avatars/upload-url")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ fileExt: "invalid" });

      expect(response.status).toBe(422);
    });
  });
});
