import { ResetPasswordForm } from "$/components/form/ResetPasswordForm";
import { toast } from "$/components/ui/Toast";
import { fetchApi } from "$/services/apiClient";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

jest.mock("$/services/apiClient");
jest.mock("$/components/ui/Toast");

const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockFetchApi = jest.mocked(fetchApi);
const mockToast = jest.mocked(toast);

describe("ResetPasswordForm", () => {
  const mockToken = "this-is-a-valid-reset-token";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should successfully reset the password with valid data", async () => {
    const user = userEvent.setup();
    mockFetchApi.mockResolvedValue(undefined);
    render(<ResetPasswordForm token={mockToken} />);

    await user.type(screen.getByLabelText("Password"), "NewPassword123");
    await user.type(
      screen.getByLabelText("Confirm Password"),
      "NewPassword123",
    );
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }));

    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledWith("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: mockToken, password: "NewPassword123" }),
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Senha alterada com sucesso.",
    );
    expect(mockRouterPush).toHaveBeenCalledWith("/login");
  });

  it("should show a client-side error if passwords do not match", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token={mockToken} />);

    await user.type(screen.getByLabelText("Password"), "Password123");
    await user.type(screen.getByLabelText("Confirm Password"), "Password456");
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }));

    expect(
      await screen.findByText("As senhas não coincidem"),
    ).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  // it("should display a server error if the token is invalid", async () => {
  //   const user = userEvent.setup();
  //   const errorMessage = "Token de redefinição de senha é inválido ou expirou.";
  //   mockFetchApi.mockRejectedValue(
  //     new ApiError("PASSWORD_RESET_TOKEN_INVALID", errorMessage),
  //   );
  //   render(<ResetPasswordForm token="invalid-token" />);

  //   await user.type(screen.getByLabelText("Password"), "NewPassword123");
  //   await user.type(
  //     screen.getByLabelText("Confirm Password"),
  //     "NewPassword123",
  //   );
  //   await user.click(screen.getByRole("button", { name: /redefinir senha/i }));

  //   expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  // });
});
