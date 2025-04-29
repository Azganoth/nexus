import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "$/utils/jwt";
import { describe, expect, it } from "@jest/globals";

describe("JWT Utils", () => {
  const MOCK_USER_ID = "test-user-id";

  describe("Access Token", () => {
    it("should perform a successful sign and verify roundtrip", () => {
      const token = signAccessToken(MOCK_USER_ID);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(MOCK_USER_ID);
    });

    it("should throw an error for an invalid signature", () => {
      const token = signAccessToken(MOCK_USER_ID);
      const tamperedToken = token.slice(0, -1) + "X";

      expect(() => verifyAccessToken(tamperedToken)).toThrow(
        /invalid signature/,
      );
    });
  });

  describe("Refresh Token", () => {
    it("should perform a successful sign and verify roundtrip", () => {
      const token = signRefreshToken(MOCK_USER_ID);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(MOCK_USER_ID);
    });

    it("should throw an error for an invalid signature", () => {
      const token = signRefreshToken(MOCK_USER_ID);
      const tamperedToken = token.slice(0, -1) + "Y";

      expect(() => verifyRefreshToken(tamperedToken)).toThrow(
        /invalid signature/,
      );
    });
  });
});
