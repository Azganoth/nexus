import { createRandomUser } from "$/__tests__/factories";
import { createMockHttp, selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { AUTHENTICATED_USER_SELECT } from "$/constants";
import { authenticate, authorize } from "$/middlewares/auth.middleware";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";

describe("Auth Middleware", () => {
  const mockUser = createRandomUser();
  const mockAuthenticatedUser = selectData(mockUser, AUTHENTICATED_USER_SELECT);
  const mockAccessToken = signAccessToken(mockUser.id, mockUser.role);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("authenticates a user and attaches them to the request", async () => {
      const { req, res, next } = createMockHttp({
        req: { headers: { authorization: `Bearer ${mockAccessToken}` } },
      });
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      await authenticate(req, res, next);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
        }),
      );
      expect(req.user).toEqual(mockAuthenticatedUser);
      expect(next).toHaveBeenCalledWith();
    });

    it("should throw ApiError if token is for a non-existent user", async () => {
      const { req, res, next } = createMockHttp({
        req: {
          headers: { authorization: `Bearer ${mockAccessToken}` },
        },
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authenticate(req, res, next)).rejects.toThrowApiError(
        401,
        "ACCESS_TOKEN_INVALID",
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should throw ApiError if token verification fails", async () => {
      const { req, res, next } = createMockHttp({
        req: { headers: { authorization: "Bearer this-is-not-a-valid-token" } },
      });

      await expect(authenticate(req, res, next)).rejects.toThrowApiError(
        401,
        "ACCESS_TOKEN_INVALID",
      );
    });

    describe.each([
      {
        description: "is missing",
        headers: {},
      },
      {
        description: "is malformed (missing 'Bearer ')",
        headers: { authorization: "some-token" },
      },
    ])("when authorization header $description", ({ headers }) => {
      it("should throw 401 ApiError", async () => {
        const { req, res, next } = createMockHttp({ req: { headers } });
        await expect(authenticate(req, res, next)).rejects.toThrowApiError(
          401,
          "NOT_LOGGED_IN",
        );
      });
    });
  });

  describe("authorize", () => {
    it("authorizes if the user has a permitted role", () => {
      const { req, res, next } = createMockHttp({
        req: { user: { ...mockAuthenticatedUser, role: "ADMIN" } },
      });
      const adminOnlyMiddleware = authorize(["ADMIN"]);

      adminOnlyMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("authorizes if the user role is one of several allowed roles", () => {
      const { req, res, next } = createMockHttp({
        req: { user: { ...mockAuthenticatedUser, role: "USER" } },
      });
      const middleware = authorize(["USER", "ADMIN"]);

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should throw ApiError if the user does not have a permitted role", () => {
      const { req, res, next } = createMockHttp({
        req: { user: { ...mockAuthenticatedUser, role: "USER" } },
      });
      const adminOnlyMiddleware = authorize(["ADMIN"]);

      expect(() => adminOnlyMiddleware(req, res, next)).toThrowApiError(
        403,
        "NOT_AUTHORIZED",
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should throw ApiError if req.user is missing", () => {
      const { req, res, next } = createMockHttp({ req: { user: undefined } });
      const adminOnly = authorize(["ADMIN"]);

      expect(() => adminOnly(req, res, next)).toThrowApiError(
        403,
        "NOT_AUTHORIZED",
      );
    });
  });
});
