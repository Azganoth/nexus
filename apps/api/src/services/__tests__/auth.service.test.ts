import {
  createRandomPasswordResetToken,
  createRandomRefreshToken,
  createRandomUser,
} from "$/__tests__/factories";
import { mockTransaction, selectData } from "$/__tests__/helpers";
import { mockEnv, mockPrisma } from "$/__tests__/mocks";
import { AUTHENTICATED_USER_SELECT, UNUSED_SELECT } from "$/constants";
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
import { sendPasswordResetEmail } from "$/services/notification.service";
import {
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  Prisma,
  type PasswordResetToken,
  type RefreshToken,
  type User,
} from "@repo/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("bcrypt");
jest.mock("$/services/notification.service");

const mockBcrypt = jest.mocked(bcrypt);
const mockSendPasswordResetEmail = jest.mocked(sendPasswordResetEmail);

describe("Auth Service", () => {
  const mockUser = createRandomUser();
  const mockAuthenticatedUser = selectData(mockUser, AUTHENTICATED_USER_SELECT);
  const mockTokens = {
    accessToken: {
      userId: mockUser.id,
      userRole: mockUser.role,
    } satisfies AccessTokenPayload,
    refreshToken: {
      userId: mockUser.id,
    } satisfies RefreshTokenPayload,
  };
  const mockSignedRefreshToken = signRefreshToken(mockUser.id);

  const testFullSession = (result: FullSession) => {
    expect(verifyAccessToken(result.accessToken)).toEqual(
      mockTokens.accessToken,
    );
    expect(verifyRefreshToken(result.refreshToken)).toEqual(
      mockTokens.refreshToken,
    );
    expect(result.refreshTokenExpires).toBeInstanceOf(Date);
    expect(result.user).toEqual(mockAuthenticatedUser);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("logs in a user and issues tokens", async () => {
      const foundUser = {
        ...mockAuthenticatedUser,
        password: mockUser.password,
      };
      mockPrisma.user.findUnique.mockResolvedValue(foundUser as User);
      mockBcrypt.compare.mockImplementation(async () => true);

      const result = await loginUser(mockUser.email, mockUser.password);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: mockUser.email },
        }),
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        mockUser.password,
        mockUser.password,
      );
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: mockUser.id,
            token: expect.any(String),
            expiresAt: expect.any(Date),
          },
        }),
      );

      testFullSession(result);
    });

    it("should throw ambiguous ApiError for non existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        loginUser(mockUser.email, mockUser.password),
      ).rejects.toThrowApiError(401, "INCORRECT_CREDENTIALS");
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw ambiguous ApiError for incorrect password", async () => {
      const foundUser = {
        ...mockAuthenticatedUser,
        password: mockUser.password,
      };
      mockPrisma.user.findUnique.mockResolvedValue(foundUser as User);
      mockBcrypt.compare.mockImplementation(async () => false);

      await expect(
        loginUser(mockUser.email, mockUser.password),
      ).rejects.toThrowApiError(401, "INCORRECT_CREDENTIALS");
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        mockUser.password,
        mockUser.password,
      );
    });
  });

  describe("signupUser", () => {
    it("creates a new user and issues tokens", async () => {
      mockBcrypt.hash.mockImplementation(() =>
        Promise.resolve(mockUser.password),
      );
      mockPrisma.user.create.mockResolvedValue(mockAuthenticatedUser as User);

      const result = await signupUser(
        mockUser.email,
        mockUser.password,
        mockUser.name,
      );

      expect(mockBcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            email: mockUser.email,
            password: mockUser.password,
            name: mockUser.name,
            profile: {
              create: {
                username: expect.any(String),
                displayName: mockUser.name,
                avatarUrl: expect.any(String),
              },
            },
          },
        }),
      );
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: mockUser.id,
            token: expect.any(String),
            expiresAt: expect.any(Date),
          },
        }),
      );

      testFullSession(result);
    });

    it("should throw ValidationError if the email is already in use", async () => {
      const mockError = new Prisma.PrismaClientKnownRequestError(
        "Restrição de unicidade no email foi violada.",
        {
          code: "P2002",
          clientVersion: "",
        },
      );
      mockBcrypt.hash.mockImplementation(() =>
        Promise.resolve(mockUser.password),
      );
      mockPrisma.user.create.mockRejectedValue(mockError);

      await expect(
        signupUser(mockUser.email, mockUser.password, mockUser.name),
      ).rejects.toThrowValidationError({
        email: ["O email já está em uso."],
      });
    });
  });

  describe("refreshAccessToken", () => {
    it("refreshes an access token", async () => {
      const storedRefreshToken = selectData(
        createRandomRefreshToken(mockUser.id),
        { id: true, expiresAt: true },
      );

      mockPrisma.refreshToken.findUnique.mockResolvedValue(
        storedRefreshToken as RefreshToken,
      );
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      const mockPrismaTx = mockTransaction(mockPrisma);

      const result = await refreshAccessToken(mockSignedRefreshToken);

      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: mockSignedRefreshToken },
        }),
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
        }),
      );
      expect(mockPrismaTx.refreshToken.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: storedRefreshToken.id },
        }),
      );
      expect(mockPrismaTx.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: mockUser.id,
            token: expect.any(String),
            expiresAt: expect.any(Date),
          },
        }),
      );

      testFullSession(result);
    });

    it("should throw ApiError if no refresh token is provided", async () => {
      await expect(refreshAccessToken("")).rejects.toThrowApiError(
        401,
        "REFRESH_TOKEN_MISSING",
      );
    });

    it("should throw ApiError if the refresh token is invalid", async () => {
      const invalidRefreshToken = "this-is-not-a-valid-token";
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        refreshAccessToken(invalidRefreshToken),
      ).rejects.toThrowApiError(401, "REFRESH_TOKEN_INVALID");
    });

    it("should throw ApiError if the refresh token is expired", async () => {
      const expiredRefreshToken = jwt.sign(
        { userId: mockUser.id },
        mockEnv.JWT_REFRESH_SECRET,
        {
          expiresIn: "-1s",
        },
      );
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        refreshAccessToken(expiredRefreshToken),
      ).rejects.toThrowApiError(401, "REFRESH_TOKEN_INVALID");
    });

    it("should throw ApiError if the refresh token is not found in the database", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(
        refreshAccessToken(mockSignedRefreshToken),
      ).rejects.toThrowApiError(401, "REFRESH_TOKEN_INVALID");
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        }),
      );
    });

    it("should throw ApiError if the refresh token is expired in the database", async () => {
      const storedRefreshToken = createRandomRefreshToken(mockUser.id, {
        expiresAt: new Date(Date.now() - 1000),
      });
      const refreshToken = selectData(storedRefreshToken, {
        id: true,
        expiresAt: true,
      });
      mockPrisma.refreshToken.findUnique.mockResolvedValue(
        refreshToken as RefreshToken,
      );

      await expect(
        refreshAccessToken(mockSignedRefreshToken),
      ).rejects.toThrowApiError(401, "REFRESH_TOKEN_EXPIRED");
    });

    it("should throw ApiError if user associated with token no longer exists", async () => {
      const storedRefreshToken = createRandomRefreshToken(mockUser.id);
      const refreshToken = selectData(storedRefreshToken, {
        id: true,
        expiresAt: true,
      });

      mockPrisma.refreshToken.findUnique.mockResolvedValue(
        refreshToken as RefreshToken,
      );
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        refreshAccessToken(mockSignedRefreshToken),
      ).rejects.toThrowApiError(401, "REFRESH_TOKEN_INVALID");
    });
  });

  describe("logoutUser", () => {
    it("deletes the refresh token from the database", async () => {
      const refreshToken = signRefreshToken(mockUser.id);
      await logoutUser(refreshToken);
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: refreshToken },
        }),
      );
    });

    describe.each([
      { value: "", description: "is an empty string" },
      { value: undefined, description: "is undefined" },
    ])("when the refresh token $description", ({ value }) => {
      it("should do nothing", async () => {
        await logoutUser(value as string);
        expect(mockPrisma.refreshToken.deleteMany).not.toHaveBeenCalled();
      });
    });
  });

  describe("revalidateUser", () => {
    it("validates the token and returns the user and a new access token", async () => {
      const storedRefreshToken = selectData(
        createRandomRefreshToken(mockUser.id),
        { id: true, expiresAt: true },
      );

      mockPrisma.refreshToken.findUnique.mockResolvedValue(
        storedRefreshToken as RefreshToken,
      );
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const result = await revalidateUser(mockSignedRefreshToken);

      expect(result && verifyAccessToken(result.accessToken)).toEqual(
        mockTokens.accessToken,
      );
      expect(result?.user).toEqual(mockAuthenticatedUser);
    });

    it("should return null if no refresh token is provided", async () => {
      expect(await revalidateUser("")).toBeNull();
    });

    it("should return null if the refresh token is invalid", async () => {
      const invalidRefreshToken = "this-is-not-a-valid-token";
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      expect(await revalidateUser(invalidRefreshToken)).toBeNull();
    });

    it("should return null if the refresh token is expired", async () => {
      const expiredRefreshToken = jwt.sign(
        { userId: mockUser.id },
        mockEnv.JWT_REFRESH_SECRET,
        {
          expiresIn: "-1s",
        },
      );
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      expect(await revalidateUser(expiredRefreshToken)).toBeNull();
    });

    it("should return null if the refresh token is not found in the database", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      expect(await revalidateUser(mockSignedRefreshToken)).toBeNull();
    });

    it("should return null if the user associated with the token no longer exists", async () => {
      const storedRefreshToken = createRandomRefreshToken(mockUser.id);
      const refreshToken = selectData(storedRefreshToken, {
        id: true,
        expiresAt: true,
      });

      mockPrisma.refreshToken.findUnique.mockResolvedValue(
        refreshToken as RefreshToken,
      );
      mockPrisma.user.findUnique.mockResolvedValue(null);

      expect(await revalidateUser(mockSignedRefreshToken)).toBeNull();
    });
  });

  describe("requestPasswordReset", () => {
    const mockPasswordResetToken = createRandomPasswordResetToken(mockUser.id);
    const mockResetToken = selectData(mockPasswordResetToken, { id: true });

    it("creates a reset token and sends an email if the user exists", async () => {
      const foundUser = selectData(mockUser, { id: true, email: true });
      mockPrisma.user.findUnique.mockResolvedValue(foundUser as User);
      mockPrisma.passwordResetToken.upsert.mockResolvedValue(
        mockResetToken as PasswordResetToken,
      );

      await requestPasswordReset(mockUser.email);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: mockUser.email },
        }),
      );

      expect(mockPrisma.passwordResetToken.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
          create: expect.objectContaining({
            userId: mockUser.id,
            token: expect.any(String),
          }),
          update: expect.objectContaining({ token: expect.any(String) }),
        }),
      );

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String),
      );
    });

    it("should do nothing if the user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await requestPasswordReset("not-found@example.com");

      expect(mockPrisma.passwordResetToken.upsert).not.toHaveBeenCalled();
      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    const mockPasswordResetToken = createRandomPasswordResetToken(mockUser.id);
    const mockResetToken = selectData(mockPasswordResetToken, {
      id: true,
      expiresAt: true,
      userId: true,
    });
    const mockNewPassword = "newStrongPassword123";

    it("updates the password and deletes the token if the token is valid", async () => {
      const token = mockPasswordResetToken.token;
      mockTransaction(mockPrisma);
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(
        mockResetToken as PasswordResetToken,
      );
      mockBcrypt.hash.mockImplementation(async () => mockNewPassword);
      mockPrisma.user.update.mockResolvedValue(
        selectData(mockUser, { id: true }) as User,
      );
      mockPrisma.passwordResetToken.delete.mockResolvedValue(
        selectData(mockPasswordResetToken, UNUSED_SELECT) as PasswordResetToken,
      );

      await changePassword(token, mockNewPassword);

      expect(mockPrisma.passwordResetToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token },
        }),
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(mockNewPassword, 10);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockResetToken.userId },
          data: { password: mockNewPassword },
        }),
      );
      expect(mockPrisma.passwordResetToken.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockResetToken.id },
        }),
      );
    });

    it("should throw error if the token is not found", async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        changePassword("invalid-token", mockNewPassword),
      ).rejects.toThrowApiError(400, "PASSWORD_RESET_TOKEN_INVALID");
    });

    it("should throw error if the token has expired", async () => {
      const expiredToken = {
        ...mockResetToken,
        expiresAt: new Date(Date.now() - 1000),
      };
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(
        expiredToken as PasswordResetToken,
      );

      await expect(
        changePassword(mockPasswordResetToken.token, mockNewPassword),
      ).rejects.toThrowApiError(400, "PASSWORD_RESET_TOKEN_INVALID");
    });
  });

  describe("verifyPasswordResetToken", () => {
    it("returns successfully if the token is valid and not expired", async () => {
      const validToken = createRandomPasswordResetToken(mockUser.id);
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(validToken);

      await expect(
        verifyPasswordResetToken(validToken.token),
      ).resolves.toBeUndefined();

      expect(mockPrisma.passwordResetToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { token: validToken.token } }),
      );
    });

    it("should throw ApiError if the token is not found in the database", async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        verifyPasswordResetToken("non-existent-token"),
      ).rejects.toThrowApiError(400, "PASSWORD_RESET_TOKEN_INVALID");
    });

    it("should throw ApiError if the token has expired", async () => {
      const expiredToken = createRandomPasswordResetToken(mockUser.id, {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(expiredToken);

      await expect(
        verifyPasswordResetToken(expiredToken.token),
      ).rejects.toThrowApiError(400, "PASSWORD_RESET_TOKEN_INVALID");
    });
  });
});
