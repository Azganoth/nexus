import {
  createRandomPasswordResetToken,
  createRandomUser,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { AUTHENTICATED_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import {
  changePassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
  revalidateUser,
  signupUser,
  verifyPasswordResetToken,
  type FullSession,
} from "$/services/auth.service";
import { ApiError } from "$/utils/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Session } from "@repo/shared/contracts";
import { randomBytes } from "crypto";
import type { Express } from "express";
import supertest from "supertest";

jest.mock("$/services/auth.service");

const mockLoginUser = jest.mocked(loginUser);
const mockSignupUser = jest.mocked(signupUser);
const mockRefreshAccessToken = jest.mocked(refreshAccessToken);
const mockLogoutUser = jest.mocked(logoutUser);
const mockRevalidateUser = jest.mocked(revalidateUser);
const mockRequestPasswordReset = jest.mocked(requestPasswordReset);
const mockChangePassword = jest.mocked(changePassword);
const mockVerifyPasswordResetToken = jest.mocked(verifyPasswordResetToken);

describe("Auth Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockAccessToken = "this-is-a-valid-access-token";
  const mockRefreshToken = "this-is-a-valid-refresh-token";
  const mockAuthenticatedUser = selectData(mockUser, AUTHENTICATED_USER_SELECT);
  const mockSession: Session = {
    accessToken: mockAccessToken,
    user: mockAuthenticatedUser,
  };
  const mockFullSession: FullSession = {
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
    refreshTokenExpires: new Date(),
    user: mockAuthenticatedUser,
  };

  const mockSessionJSON = JSON.parse(JSON.stringify(mockSession));

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("POST /auth/signup", () => {
    it("creates a user with consent and returns 201", async () => {
      mockSignupUser.mockResolvedValue(mockFullSession);

      const password = "Password123";
      const response = await supertest(app).post("/auth/signup").send({
        email: mockUser.email,
        password,
        name: mockUser.name,
        acceptTerms: true,
        acceptPrivacy: true,
      });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(mockSessionJSON);
      expect(response.headers["set-cookie"][0]).toMatch(
        new RegExp(`^refreshToken=${mockRefreshToken}`),
      );
      expect(mockSignupUser).toHaveBeenCalledWith(
        mockUser.email,
        password,
        mockUser.name,
        [
          { type: "TERMS_OF_SERVICE", granted: true },
          { type: "PRIVACY_POLICY", granted: true },
        ],
      );
    });

    it("should return 422 for missing consent fields", async () => {
      const response = await supertest(app).post("/auth/signup").send({
        email: mockUser.email,
        password: "Password123",
        name: mockUser.name,
        // Missing acceptTerms and acceptPrivacy
      });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("fail");
      expect(response.body.data).toHaveProperty("acceptTerms");
      expect(response.body.data).toHaveProperty("acceptPrivacy");
    });

    it("should return 422 for false consent values", async () => {
      const response = await supertest(app).post("/auth/signup").send({
        email: mockUser.email,
        password: "Password123",
        name: mockUser.name,
        acceptTerms: false,
        acceptPrivacy: false,
      });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("fail");
      expect(response.body.data).toHaveProperty("acceptTerms");
      expect(response.body.data).toHaveProperty("acceptPrivacy");
    });

    it("should return 422 for invalid input data", async () => {
      const response = await supertest(app).post("/auth/signup").send({
        email: "not-an-email",
        password: "short",
        name: "",
        acceptTerms: true,
        acceptPrivacy: true,
      });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("fail");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).toHaveProperty("password");
      expect(response.body.data).toHaveProperty("name");
    });
  });

  describe("POST /auth/login", () => {
    it("logs in user, returns accessToken and sets refreshToken cookie", async () => {
      mockLoginUser.mockResolvedValue(mockFullSession);

      const response = await supertest(app)
        .post("/auth/login")
        .send({ email: mockUser.email, password: mockUser.password });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockSessionJSON);
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
    it("calls the logout service and clears the cookie", async () => {
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
    it("refreshes tokens and sets a new refresh token cookie", async () => {
      const newRefreshToken = "this-is-a-new-valid-refresh-token";
      const fullSession = { ...mockFullSession, refreshToken: newRefreshToken };
      mockRefreshAccessToken.mockResolvedValue(fullSession);

      const response = await supertest(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshToken=${mockRefreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockSessionJSON);
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

  describe("GET /auth/session", () => {
    it("returns user data and new access token for valid session", async () => {
      mockRevalidateUser.mockResolvedValue(mockSession);
      const response = await supertest(app)
        .get("/auth/session")
        .set("Cookie", `refreshToken=${mockRefreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockSessionJSON);
    });

    it("should return 401 if no valid refresh token is provided", async () => {
      mockRevalidateUser.mockResolvedValue(null);
      const response = await supertest(app).get("/auth/session");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("returns 204 when the request is valid", async () => {
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
      expect(response.body.status).toBe("fail");
      expect(response.body.data).toHaveProperty("email");
    });
  });

  describe("POST /auth/reset-password", () => {
    const mockPasswordResetToken = createRandomPasswordResetToken(mockUser.id);
    const mockValidPayload = {
      token: mockPasswordResetToken.token,
      password: "newStrongPassword123",
    };

    it("resets password on valid token and password", async () => {
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

  describe("POST /auth/verify-reset-token", () => {
    const mockValidPayload = {
      token: randomBytes(32).toString("hex"),
    };

    it("returns 204 if the token is valid", async () => {
      mockVerifyPasswordResetToken.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post("/auth/verify-reset-token")
        .send(mockValidPayload);

      expect(response.status).toBe(204);
      expect(mockVerifyPasswordResetToken).toHaveBeenCalledWith(
        mockValidPayload.token,
      );
    });

    it("should return 400 for invalid token", async () => {
      mockVerifyPasswordResetToken.mockRejectedValue(
        new ApiError(400, "PASSWORD_RESET_TOKEN_INVALID"),
      );

      const response = await supertest(app)
        .post("/auth/verify-reset-token")
        .send(mockValidPayload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe("PASSWORD_RESET_TOKEN_INVALID");
    });
  });
});
