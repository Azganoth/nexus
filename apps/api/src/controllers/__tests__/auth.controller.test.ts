import {
  createRandomPasswordResetToken,
  createRandomUser,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { PUBLIC_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import {
  changePassword,
  createUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
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
const mockRequestPasswordReset = jest.mocked(requestPasswordReset);
const mockChangePassword = jest.mocked(changePassword);

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
      expect(response.headers["set-cookie"][0]).toMatch(
        new RegExp(`^refreshToken=${mockRefreshToken}`),
      );
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
    it("should successfully refresh tokens and set a new refresh token cookie", async () => {
      const newRefreshToken = "this-is-a-new-valid-refresh-token";
      mockRefreshAccessToken.mockResolvedValue({
        accessToken: mockAccessToken,
        newRefreshToken,
      });

      const response = await supertest(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshToken=${mockRefreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        accessToken: mockAccessToken,
      });
      expect(response.headers["set-cookie"][0]).toMatch(
        new RegExp(`^refreshToken=${newRefreshToken}`),
      );
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

  describe("POST /auth/forgot-password", () => {
    it("should return 204 when the request is valid", async () => {
      mockRequestPasswordReset.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post("/auth/forgot-password")
        .send({ email: mockUser.email });

      expect(response.status).toBe(204);
      expect(mockRequestPasswordReset).toHaveBeenCalledWith(mockUser.email);
    });

    it("should return 422 for invalid email input", async () => {
      const response = await supertest(app)
        .post("/auth/forgot-password")
        .send({ email: "not-a-valid-email" });

      expect(response.status).toBe(422);
    });
  });

  describe("POST /auth/reset-password", () => {
    const mockPasswordResetToken = createRandomPasswordResetToken(mockUser.id);
    const mockValidPayload = {
      token: mockPasswordResetToken.token,
      password: "newStrongPassword123",
    };

    it("should return 204 on a successful password reset", async () => {
      mockChangePassword.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post("/auth/reset-password")
        .send(mockValidPayload);

      expect(response.status).toBe(204);
      expect(mockChangePassword).toHaveBeenCalledWith(
        mockValidPayload.token,
        mockValidPayload.password,
      );
    });

    it("should return 400 for invalid token", async () => {
      mockChangePassword.mockRejectedValue(
        new ApiError(400, "PASSWORD_RESET_TOKEN_INVALID"),
      );

      const response = await supertest(app)
        .post("/auth/reset-password")
        .send(mockValidPayload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe("PASSWORD_RESET_TOKEN_INVALID");
    });
  });
});
