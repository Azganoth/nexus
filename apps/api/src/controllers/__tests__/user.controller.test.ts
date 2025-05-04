import { createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { PUBLIC_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";
import type { Express } from "express";
import supertest from "supertest";

describe("User Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockPublicUser = selectData(mockUser, PUBLIC_USER_SELECT);

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("GET /users/me", () => {
    it("should return 401 if no token is provided", async () => {
      const response = await supertest(app).get("/users/me");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe("NOT_LOGGED_IN");
    });

    it("should return the current user's data if the token is valid", async () => {
      const token = signAccessToken(mockUser.id);
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);

      const response = await supertest(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");

      expect(response.body.data).toEqual(mockPublicUser);
      expect(response.body.data.password).toBeUndefined();
    });
  });
});
