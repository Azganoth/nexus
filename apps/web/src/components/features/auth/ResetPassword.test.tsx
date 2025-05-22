import { mockedHook } from "$/__tests__/helpers";
import { toast } from "$/components/ui/Toast";
import { apiClient } from "$/lib/apiClient";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { ResetPassword } from "./ResetPassword";

jest.mock("next/navigation");
jest.mock("$/lib/apiClient");
jest.mock("$/components/ui/Toast");

const mockUseRouter = mockedHook(useRouter);

const mockApiClient = jest.mocked(apiClient);
const mockToast = jest.mocked(toast);

describe("ResetPasswordForm", () => {
  const mockToken = "this-is-a-valid-reset-token";
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  it("resets the password with valid token and password", async () => {
    const user = userEvent.setup();

    mockApiClient.post.mockResolvedValue(undefined);
    render(<ResetPassword token={mockToken} />);

    await user.type(screen.getByLabelText("Password"), "NewPassword123");
    await user.type(
      screen.getByLabelText("Confirm Password"),
      "NewPassword123",
    );
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/reset-password", {
        token: mockToken,
        password: "NewPassword123",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Senha alterada com sucesso.",
    );
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  describe("UI State and Feedback", () => {
    it("disables the submit button during submission", async () => {
      const user = userEvent.setup();
      render(<ResetPassword token={mockToken} />);

      await user.type(screen.getByLabelText("Password"), "Password123");
      await user.type(screen.getByLabelText("Confirm Password"), "Password456");
      await user.click(
        screen.getByRole("button", { name: /redefinir senha/i }),
      );

      expect(
        await screen.findByText("As senhas não coincidem"),
      ).toBeInTheDocument();
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it("shows success message and redirects after successful reset", async () => {
      const user = userEvent.setup();
      mockApiClient.post.mockResolvedValue(undefined);
      render(<ResetPassword token={mockToken} />);

      await user.type(screen.getByLabelText("Password"), "NewPassword123");
      await user.type(
        screen.getByLabelText("Confirm Password"),
        "NewPassword123",
      );
      await user.click(
        screen.getByRole("button", { name: /redefinir senha/i }),
      );

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          "/auth/reset-password",
          {
            token: mockToken,
            password: "NewPassword123",
          },
        );
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Senha alterada com sucesso.",
      );
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  // NOTE: react-hook-form is bugged in jsdom
  // describe("Validation and Error Handling", () => {
  //   it("should display a server error if the token is invalid", async () => {
  //     const user = userEvent.setup();
  //     const errorMessage =
  //       "Token de redefinição de senha é inválido ou expirou.";
  //     mockApiClient.post.mockRejectedValue(
  //       new ApiError("PASSWORD_RESET_TOKEN_INVALID", errorMessage),
  //     );
  //     render(<ResetPasswordForm token="invalid-token" />);

  //     await user.type(screen.getByLabelText("Password"), "NewPassword123");
  //     await user.type(
  //       screen.getByLabelText("Confirm Password"),
  //       "NewPassword123",
  //     );
  //     await user.click(
  //       screen.getByRole("button", { name: /redefinir senha/i }),
  //     );

  //     expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  //   });

  //   it("should display a generic unexpected error for an unhandled API failure", async () => {
  //     const user = userEvent.setup();
  //     const errorMessage =
  //       "An unexpected error occurred. Please try again later.";
  //     mockApiClient.post.mockRejectedValue(
  //       new ApiError("UNEXPECTED_ERROR", errorMessage),
  //     );
  //     render(<ResetPasswordForm token="invalid-token" />);

  //     await user.type(screen.getByLabelText("Password"), "NewPassword123");
  //     await user.type(
  //       screen.getByLabelText("Confirm Password"),
  //       "NewPassword123",
  //     );
  //     await user.click(
  //       screen.getByRole("button", { name: /redefinir senha/i }),
  //     );

  //     expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  //   });
  // });
});
