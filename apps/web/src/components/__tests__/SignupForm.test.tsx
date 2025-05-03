import { spyConsoleError } from "$/__tests__/helpers";
import { SignupForm } from "$/components/SignupForm";
import { useAuth, type AuthContextType } from "$/contexts/AuthContext";
import { fetchApi } from "$/lib/api";
import { HttpError } from "$/lib/errors";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

jest.mock("$/lib/api");
jest.mock("$/contexts/AuthContext");

const mockFetchApi = jest.mocked(fetchApi);
const mockUseAuth = jest.mocked(useAuth);
const mockLogin = jest.fn<AuthContextType["login"]>();
const mockLogout = jest.fn<AuthContextType["logout"]>();

describe("SignupForm", () => {
  const mockNewUser = {
    name: "New User",
    email: "new@example.com",
    password: "Password123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      auth: null,
      isAuthenticating: false,
      logout: mockLogout,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should successfully create and log in a new user", async () => {
    const user = userEvent.setup();

    const successData = {
      accessToken: "this-is-an-access-token",
      user: { id: "1", email: mockNewUser.email, name: mockNewUser.name },
    };
    mockFetchApi.mockResolvedValue(successData);
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Nome"), mockNewUser.name);
    await user.type(screen.getByLabelText("Email"), mockNewUser.email);
    await user.type(screen.getByLabelText("Senha"), mockNewUser.password);
    await user.type(
      screen.getByLabelText("Confirme a senha"),
      mockNewUser.password,
    );
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledWith("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: mockNewUser.name,
          email: mockNewUser.email,
          password: mockNewUser.password,
        }),
      });
    });
    expect(mockLogin).toHaveBeenCalledWith(successData);
  });

  describe("UI State and Feedback", () => {
    it("should disable the submit button during submission", async () => {
      const user = userEvent.setup();

      mockFetchApi.mockImplementation(() => new Promise(() => {}));
      render(<SignupForm />);

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

    it("should display a password mismatch error and then clear it", async () => {
      const user = userEvent.setup();

      const correctPassword = "Password123";
      const wrongPassword = "Password456";
      render(<SignupForm />);
      const passwordInput = screen.getByLabelText("Senha");
      const confirmPasswordInput = screen.getByLabelText("Confirme a senha");

      await user.type(passwordInput, correctPassword);
      await user.type(confirmPasswordInput, wrongPassword);
      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      const errorMessage = await screen.findByText("As senhas não coincidem");
      expect(errorMessage).toBeInTheDocument();

      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, correctPassword);

      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  describe("Validation and Error Handling", () => {
    it("should set aria-invalid to true on password confirmation when passwords do not match", async () => {
      const user = userEvent.setup();

      render(<SignupForm />);
      const confirmPasswordInput = screen.getByLabelText("Confirme a senha");

      await user.type(screen.getByLabelText("Senha"), "Password123");
      await user.type(confirmPasswordInput, "Password456");
      await user.click(screen.getByRole("button", { name: /cadastrar/i }));

      expect(
        await screen.findByText("As senhas não coincidem"),
      ).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should show a server error if the email is already in use", async () => {
      const user = userEvent.setup();

      mockFetchApi.mockRejectedValue(
        new HttpError({
          status: "fail",
          data: { email: ["O email já está em uso."] },
        }),
      );
      render(<SignupForm />);

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

    it("should display a generic unexpected error for an unhandled API failure", async () => {
      const user = userEvent.setup();
      spyConsoleError();

      mockFetchApi.mockRejectedValue(
        new HttpError({
          status: "error",
          code: "SERVER_UNKNOWN_ERROR",
          message: ERRORS.SERVER_UNKNOWN_ERROR,
        }),
      );
      render(<SignupForm />);

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
