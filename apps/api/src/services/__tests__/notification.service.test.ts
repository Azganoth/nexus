import { spyConsole } from "$/__tests__/helpers";
import { mockResend } from "$/__tests__/mocks";
import { env } from "$/config/env";
import { sendPasswordResetEmail } from "$/services/notification.service";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import type { ErrorResponse } from "resend";

describe("Notification Service", () => {
  const mockEmail = "test@example.com";
  const mockToken = "reset-token-123";

  beforeAll(() => {
    jest.restoreAllMocks();
  });

  describe("sendPasswordResetEmail", () => {
    it("should call resend.emails.send with the correct parameters", async () => {
      const expectedResetLink = `${env.APP_URL}/reset-password?token=${mockToken}`;

      await sendPasswordResetEmail(mockEmail, mockToken);

      expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [mockEmail],
          subject: expect.stringMatching(/redefina sua senha/i),
          html: expect.stringContaining(expectedResetLink),
        }),
      );
    });

    it("should log an error if the resend API call fails", async () => {
      const error = {
        message: "Failed to send",
        name: "internal_server_error",
      } satisfies ErrorResponse;
      const consoleErrorSpy = spyConsole("error", [
        "Failed to send password reset email:",
        error,
      ]);
      mockResend.emails.send.mockResolvedValue({ data: null, error });

      await sendPasswordResetEmail(mockEmail, mockToken);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send password reset email:",
        error,
      );
    });
  });
});
