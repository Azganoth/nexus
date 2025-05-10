import { createRandomUser } from "$/__tests__/factories";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "$/utils/jwt";
import { describe, expect, it } from "@jest/globals";

describe("JWT Utils", () => {
  const mockUser = createRandomUser();

  describe("Access Token", () => {
    it("performs a successful sign and verify roundtrip", () => {
      const token = signAccessToken(mockUser.id, mockUser.role);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(mockUser.id);
    });

    it("should throw an error for invalid signature", () => {
      const token = signAccessToken(mockUser.id, mockUser.role);
      const tamperedToken = token.slice(0, -1) + "X";

      expect(() => verifyAccessToken(tamperedToken)).toThrow(
        /invalid signature/,
      );
    });
  });

  describe("Refresh Token", () => {
    it("performs a successful sign and verify roundtrip", () => {
      const token = signRefreshToken(mockUser.id);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(mockUser.id);
    });

    it("should throw an error for invalid signature", () => {
      const token = signRefreshToken(mockUser.id);
      const tamperedToken = token.slice(0, -1) + "Y";

      expect(() => verifyRefreshToken(tamperedToken)).toThrow(
        /invalid signature/,
      );
    });
  });
});
