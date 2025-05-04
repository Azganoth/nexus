import { createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { PUBLIC_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "$/services/auth.service";
import { ApiError } from "$/utils/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Express } from "express";
import supertest from "supertest";

jest.mock("$/services/auth.service");

const mockLoginUser = jest.mocked(loginUser);
const mockCreateUser = jest.mocked(createUser);
const mockRefreshAccessToken = jest.mocked(refreshAccessToken);
const mockLogoutUser = jest.mocked(logoutUser);

describe("Auth Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockAccessToken = "this-is-a-valid-access-token";
  const mockRefreshToken = "this-is-a-valid-refresh-token";
  const mockPublicUser = selectData(mockUser, PUBLIC_USER_SELECT);
  const mockOutput = {
    accessToken: mockAccessToken,
    user: mockPublicUser,
  };
  const mockInput = {
    ...mockOutput,
    refreshToken: mockRefreshToken,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("POST /auth/signup", () => {
    it("should successfully create a user and return 201", async () => {
      mockCreateUser.mockResolvedValue(mockInput);

      const password = "Password123";
      const response = await supertest(app).post("/auth/signup").send({
        email: mockUser.email,
        password,
        name: mockUser.name,
      });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(mockOutput);
      expect(mockCreateUser).toHaveBeenCalledWith(
        mockUser.email,
        password,
        mockUser.name,
      );
    });

    it("should return 422 for invalid input data", async () => {
      const response = await supertest(app)
        .post("/auth/signup")
        .send({ email: "not-an-email", password: "short", name: "" });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("fail");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).toHaveProperty("password");
      expect(response.body.data).toHaveProperty("name");
    });
  });

  describe("POST /auth/login", () => {
    it("should successfully log in, return accessToken and set refreshToken cookie", async () => {
      mockLoginUser.mockResolvedValue(mockInput);

      const response = await supertest(app)
        .post("/auth/login")
        .send({ email: mockUser.email, password: mockUser.password });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockOutput);
      expect(response.headers["set-cookie"][0]).toMatch(
        new RegExp(`^refreshToken=${mockRefreshToken}`),
      );
      expect(mockLoginUser).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.password,
      );
    });

    it("should return 401 if login service throws an error", async () => {
      mockLoginUser.mockRejectedValue(
        new ApiError(401, "INCORRECT_CREDENTIALS"),
      );

      const response = await supertest(app)
        .post("/auth/login")
        .send({ email: mockUser.email, password: mockUser.password });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe("INCORRECT_CREDENTIALS");
    });
  });

  describe("POST /auth/logout", () => {
    it("should call the logout service and clear the cookie", async () => {
      mockLogoutUser.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post("/auth/logout")
        .set("Cookie", `refreshToken=${mockRefreshToken}`);

      expect(response.status).toBe(204);
      expect(response.headers["set-cookie"][0]).toMatch(
        /^refreshToken=;.*(Max-Age=0|Expires=Thu, 01 Jan 1970)/,
      );
      expect(mockLogoutUser).toHaveBeenCalledWith(mockRefreshToken);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should successfully refresh the access token", async () => {
      mockRefreshAccessToken.mockResolvedValue({
        accessToken: mockAccessToken,
      });

      const response = await supertest(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshToken=${mockRefreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        accessToken: mockAccessToken,
      });
      expect(mockRefreshAccessToken).toHaveBeenCalledWith(mockRefreshToken);
    });

    it("should return 401 if the refresh token is invalid", async () => {
      mockRefreshAccessToken.mockRejectedValue(
        new ApiError(401, "REFRESH_TOKEN_INVALID"),
      );

      const response = await supertest(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshToken=invalid-token`);

      expect(response.status).toBe(401);
      expect(response.body.code).toMatch("REFRESH_TOKEN_INVALID");
    });
  });
});
