import { mockedHook } from "$/__tests__/helpers";
import { Signup } from "$/components/features/auth/Signup";
import { apiClient } from "$/lib/apiClient";
import { ApiError, ValidationError } from "$/lib/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";
import { spyConsole } from "@repo/shared/testUtils";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useRouter } from "next/navigation";

jest.mock("next/navigation");
jest.mock("$/lib/apiClient");

const mockUseRouter = mockedHook(useRouter);
const mockApiClient = jest.mocked(apiClient);

describe("Signup", () => {
  const mockNewUser = {
    name: "New User",
    email: "new@example.com",
    password: "Password123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  it("creates and logs in a new user", async () => {
    const user = userEvent.setup();

    const successData = {
      accessToken: "this-is-an-access-token",
      user: {
        id: "1dc8d7c75-b500-4500-bb21-b0cc2a4ead41",
        email: mockNewUser.email,
        name: mockNewUser.name,
      },
    };
    mockApiClient.post.mockResolvedValue(successData);
    render(<Signup />);

    await user.type(screen.getByLabelText("Nome"), mockNewUser.name);
    await user.type(screen.getByLabelText("Email"), mockNewUser.email);
    await user.type(screen.getByLabelText("Senha"), mockNewUser.password);
    await user.type(
      screen.getByLabelText("Confirme a senha"),
      mockNewUser.password,
    );
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/signup", {
        name: mockNewUser.name,
        email: mockNewUser.email,
        password: mockNewUser.password,
      });
    });
  });

  describe("UI State and Feedback", () => {
    it("disables the submit button during submission", async () => {
      const user = userEvent.setup();

      mockApiClient.post.mockImplementation(() => new Promise(() => {}));
      render(<Signup />);

      await user.type(screen.getByLabelText("Nome"), mockNewUser.name);
      await user.type(screen.getByLabelText("Email"), "new@example.com");
      await user.type(screen.getByLabelText("Senha"), mockNewUser.password);
      await user.type(
        screen.getByLabelText("Confirme a senha"),
        mockNewUser.password,
      );
      const submitButton = screen.getByRole("button", { name: /cadastrar/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it("displays a password mismatch error and then clears it", async () => {
      const user = userEvent.setup();

      const correctPassword = "Password123";
      const wrongPassword = "Password456";
      render(<Signup />);
      const passwordInput = screen.getByLabelText("Senha");
      const confirmPasswordInput = screen.getByLabelText("Confirme a senha");

      await user.type(passwordInput, correctPassword);
      await user.type(confirmPasswordInput, wrongPassword);
      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      const errorMessage = await screen.findByText("As senhas não coincidem.");
      expect(errorMessage).toBeInTheDocument();

      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, correctPassword);

      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  describe("Validation and Error Handling", () => {
    it("sets aria-invalid to true on password confirmation when passwords do not match", async () => {
      const user = userEvent.setup();

      render(<Signup />);
      const confirmPasswordInput = screen.getByLabelText("Confirme a senha");

      await user.type(screen.getByLabelText("Senha"), "Password123");
      await user.type(confirmPasswordInput, "Password456");
      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(
        await screen.findByText("As senhas não coincidem."),
      ).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should show a server error if the email is already in use", async () => {
      const user = userEvent.setup();

      mockApiClient.post.mockRejectedValue(
        new ValidationError({ email: ["O email já está em uso."] }),
      );
      render(<Signup />);

      await user.type(screen.getByLabelText("Nome"), mockNewUser.name);
      await user.type(screen.getByLabelText("Email"), mockNewUser.email);
      await user.type(screen.getByLabelText("Senha"), mockNewUser.password);
      await user.type(
        screen.getByLabelText("Confirme a senha"),
        mockNewUser.password,
      );
      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(
        await screen.findByText("O email já está em uso."),
      ).toBeInTheDocument();
    });

    it("should show a generic unexpected error for an unhandled API failure", async () => {
      const user = userEvent.setup();

      const unknownError = new ApiError(
        "SERVER_UNKNOWN_ERROR",
        ERRORS.SERVER_UNKNOWN_ERROR,
      );
      mockApiClient.post.mockRejectedValue(unknownError);
      spyConsole("error", [unknownError]);
      render(<Signup />);

      await user.type(screen.getByLabelText("Nome"), mockNewUser.name);
      await user.type(screen.getByLabelText("Email"), mockNewUser.email);
      await user.type(screen.getByLabelText("Senha"), mockNewUser.password);
      await user.type(
        screen.getByLabelText("Confirme a senha"),
        mockNewUser.password,
      );
      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      const expectedMessage = `${ERRORS.UNEXPECTED_ERROR} Tente novamente.`;
      expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    });
  });
});
