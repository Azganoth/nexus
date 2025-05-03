import { createRandomUser } from "$/__tests__/factories";
import { createMockHttp } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { authenticate } from "$/middlewares/auth.middleware";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";

describe("Auth Middleware", () => {
  const mockUser = createRandomUser();
  const mockPublicUser = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
  };
  const mockAccessToken = signAccessToken(mockUser.id);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate a user and attach them to the request", async () => {
    const { req, res, next } = createMockHttp({
      req: { headers: { authorization: `Bearer ${mockAccessToken}` } },
    });
    mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);

    await authenticate(req, res, next);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockUser.id },
      }),
    );
    expect(req.user).toEqual(mockPublicUser);
    expect(next).toHaveBeenCalledWith();
  });

  it("should throw 401 ApiError if token is for a non-existent user", async () => {
    const { req, res, next } = createMockHttp({
      req: {
        headers: { authorization: `Bearer ${mockAccessToken}` },
      },
    });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(authenticate(req, res, next)).rejects.toThrowApiError(
      401,
      "USER_FOR_TOKEN_NOT_FOUND",
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw 401 ApiError if token verification fails", async () => {
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
