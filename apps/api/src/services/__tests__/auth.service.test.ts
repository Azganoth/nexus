import {
  createRandomRefreshToken,
  createRandomUser,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockEnv, mockPrisma } from "$/__tests__/mocks";
import { ID_SELECT, PUBLIC_USER_SELECT } from "$/constants";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "$/services/auth.service";
import {
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma, type RefreshToken, type User } from "@repo/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("bcrypt");

const mockBcrypt = jest.mocked(bcrypt);

describe("Auth Service", () => {
  const mockUser = createRandomUser();
  const mockPublicUser = selectData(mockUser, PUBLIC_USER_SELECT);
  const mockPublicUserWithPassword = {
    ...mockPublicUser,
    password: mockUser.password,
  };
  const mockUserId = selectData(mockUser, ID_SELECT);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should successfully log in a user and return tokens", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockPublicUserWithPassword as User,
      );
      mockBcrypt.compare.mockImplementation(() => Promise.resolve(true));

      const { accessToken, refreshToken, user } = await loginUser(
        mockUser.email,
        mockUser.password,
      );

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
      expect(user).toEqual(mockPublicUser);

      const accessTokenPayload = verifyAccessToken(accessToken);
      const refreshTokenPayload = verifyRefreshToken(refreshToken);
      expect(accessTokenPayload.userId).toBe(mockUser.id);
      expect(refreshTokenPayload.userId).toBe(mockUser.id);
    });

    it("should throw ambiguous ApiError for non existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        loginUser(mockUser.email, mockUser.password),
      ).rejects.toThrowApiError(401, "INCORRECT_CREDENTIALS");
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw ambiguous ApiError for incorrect password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockPublicUserWithPassword as User,
      );
      mockBcrypt.compare.mockImplementation(() => Promise.resolve(false));

      await expect(
        loginUser(mockUser.email, mockUser.password),
      ).rejects.toThrowApiError(401, "INCORRECT_CREDENTIALS");
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        mockUser.password,
        mockUser.password,
      );
    });
  });

  describe("createUser", () => {
    it("should successfully create a new user", async () => {
      mockBcrypt.hash.mockImplementation(() =>
        Promise.resolve(mockUser.password),
      );
      mockPrisma.user.create.mockResolvedValue(mockPublicUser as User);

      const { accessToken, refreshToken, user } = await createUser(
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

      expect(user).toEqual(mockPublicUser);

      const accessTokenPayload = verifyAccessToken(accessToken);
      const refreshTokenPayload = verifyRefreshToken(refreshToken);
      expect(accessTokenPayload.userId).toBe(mockUser.id);
      expect(refreshTokenPayload.userId).toBe(mockUser.id);
    });

    it("should throw ApiError 422 if the email is already in use", async () => {
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
        createUser(mockUser.email, mockUser.password, mockUser.name),
      ).rejects.toThrowValidationError({
        email: ["O email já está em uso."],
      });
    });
  });

  describe("refreshAccessToken", () => {
    const mockRefreshToken = signRefreshToken(mockUser.id);

    it("should successfully refresh an access token", async () => {
      const storedRefreshToken = createRandomRefreshToken(mockUser.id);
      const refreshToken = selectData(storedRefreshToken, {
        id: true,
        expiresAt: true,
      });

      mockPrisma.refreshToken.findUnique.mockResolvedValue(
        refreshToken as RefreshToken,
      );
      mockPrisma.user.findUnique.mockResolvedValue(mockUserId as User);

      const { accessToken } = await refreshAccessToken(mockRefreshToken);

      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: mockRefreshToken },
        }),
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
        }),
      );

      expect(accessToken).toBeDefined();

      const accessTokenPayload = verifyAccessToken(accessToken);
      expect(accessTokenPayload.userId).toBe(mockUser.id);
    });

    it("should throw ApiError if no refresh token is provided", async () => {
      await expect(refreshAccessToken("")).rejects.toThrowApiError(
        401,
        "REFRESH_TOKEN_MISSING",
      );
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
        refreshAccessToken(mockRefreshToken),
      ).rejects.toThrowApiError(401, "USER_FOR_TOKEN_NOT_FOUND");
    });

    const invalidTokenScenarios = [
      {
        scenario: "token is invalid",
        setup: () => "this-is-not-a-valid-token",
      },
      {
        scenario: "token is expired",
        setup: () =>
          jwt.sign({ userId: mockUser.id }, mockEnv.JWT_REFRESH_SECRET, {
            expiresIn: "-1s",
          }),
      },
      {
        scenario: "token is not found in the database",
        setup: () => {
          mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
          return "this-is-a-valid-token";
        },
      },
      {
        scenario: "token is expired in the database",
        setup: () => {
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

          return "this-is-a-valid-token";
        },
      },
    ];

    describe.each(invalidTokenScenarios)(
      "when refresh token is invalid or expired",
      ({ scenario, setup }) => {
        it(`should throw ApiError if ${scenario}`, async () => {
          const token = setup();

          await expect(refreshAccessToken(token)).rejects.toThrowApiError(
            401,
            "REFRESH_TOKEN_INVALID",
          );
        });
      },
    );
  });

  describe("logoutUser", () => {
    it("should delete refresh tokens when a token is provided", async () => {
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
});
