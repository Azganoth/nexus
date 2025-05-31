import { createRandomAuthenticatedUser } from "$/__tests__/factories";
import { mockedHook, renderWithProviders } from "$/__tests__/helpers";
import { Signup } from "$/components/features/auth/Signup";
import { apiClient } from "$/lib/apiClient";
import { ApiError, ValidationError } from "$/lib/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";
import { spyConsole } from "@repo/shared/testUtils";
import { screen, waitFor } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
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
    confirmPassword: "Password123",
    acceptTerms: true,
    acceptPrivacy: true,
  };

  const fillAndSubmit = async (
    user: UserEvent,
    {
      name = mockNewUser.name,
      email = mockNewUser.email,
      password = mockNewUser.password,
      confirmPassword = mockNewUser.confirmPassword,
      acceptTerms = mockNewUser.acceptTerms,
      acceptPrivacy = mockNewUser.acceptPrivacy,
    }: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      acceptTerms?: boolean;
      acceptPrivacy?: boolean;
    } = {},
  ) => {
    await user.type(screen.getByLabelText("Nome"), name);
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Senha"), password);
    await user.type(screen.getByLabelText("Confirme a senha"), confirmPassword);
    if (acceptTerms) {
      await user.click(screen.getByLabelText("Termos de uso"));
    }
    if (acceptPrivacy) {
      await user.click(screen.getByLabelText("Privacidade"));
    }

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
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
      user: createRandomAuthenticatedUser({
        name: mockNewUser.name,
        email: mockNewUser.email,
      }),
    };
    mockApiClient.post.mockResolvedValue(successData);
    renderWithProviders(<Signup />);

    await fillAndSubmit(user);

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
      renderWithProviders(<Signup />);

      await fillAndSubmit(user);

      expect(screen.getByRole("button", { name: /cadastrar/i })).toBeDisabled();
    });

    it("displays a password mismatch error and then clears it", async () => {
      const user = userEvent.setup();

      const correctPassword = "Password123";
      const wrongPassword = "Password456";
      renderWithProviders(<Signup />);

      await fillAndSubmit(user, { confirmPassword: wrongPassword });

      const errorMessage = await screen.findByText("As senhas não coincidem.");
      expect(errorMessage).toBeInTheDocument();

      const confirmPasswordInput = screen.getByLabelText("Confirme a senha");
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, correctPassword);

      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  describe("Validation and Error Handling", () => {
    it("sets aria-invalid to true on password confirmation when passwords do not match", async () => {
      const user = userEvent.setup();

      renderWithProviders(<Signup />);
      const confirmPasswordInput = screen.getByLabelText("Confirme a senha");

      await fillAndSubmit(user, { confirmPassword: "Password456" });

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
      renderWithProviders(<Signup />);

      await fillAndSubmit(user);

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
      renderWithProviders(<Signup />);

      await fillAndSubmit(user);

      const expectedMessage = `${ERRORS.UNEXPECTED_ERROR} Tente novamente.`;
      expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    });
  });
});
