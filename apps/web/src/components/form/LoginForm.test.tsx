import { spyConsole } from "$/__tests__/helpers";
import { LoginForm } from "$/components/form/LoginForm";
import { apiClient } from "$/services/apiClient";
import { ApiError } from "$/services/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

jest.mock("$/services/apiClient");

const mockApiClient = jest.mocked(apiClient);

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should successfully log in a user with valid credentials", async () => {
    const user = userEvent.setup();

    const successData = {
      accessToken: "this-is-an-access-token",
      user: { id: "1", email: "test@example.com", name: "Test User" },
    };
    mockApiClient.post.mockResolvedValue(successData);
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Senha"), "password123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  describe("UI State and Feedback", () => {
    it("should disable the submit button during submission", async () => {
      const user = userEvent.setup();

      // Make the promise hang so the intermediate state can be checked
      mockApiClient.post.mockImplementation(() => new Promise(() => {}));
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Senha"), "password123");
      const submitButton = screen.getByRole("button", { name: /entrar/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it("should display a validation error and then clear it when the user corrects the input", async () => {
      const user = userEvent.setup();

      render(<LoginForm />);
      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: /entrar/i });

      await user.click(emailInput);
      await user.click(document.body); // Lose focus
      await user.click(submitButton);

      const errorMessage = await screen.findByText("O email é obrigatório.");
      expect(errorMessage).toBeInTheDocument();

      await user.type(emailInput, "correct@example.com");

      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  describe("Validation and Error Handling", () => {
    it("should set aria-invalid to true on an input when a validation error occurs", async () => {
      const user = userEvent.setup();

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(
        await screen.findByText("O email é obrigatório."),
      ).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should display a server error for incorrect credentials", async () => {
      const user = userEvent.setup();

      const errorMessage = ERRORS["INCORRECT_CREDENTIALS"];
      mockApiClient.post.mockRejectedValue(
        new ApiError("INCORRECT_CREDENTIALS", errorMessage),
      );
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Senha"), "wrong-password");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it("should display a generic unexpected error message if the API fails with an unhandled error", async () => {
      const user = userEvent.setup();

      const expectedMessage = `${ERRORS.UNEXPECTED_ERROR} Tente novamente.`;
      const unknownError = new ApiError(
        "SERVER_UNKNOWN_ERROR",
        ERRORS.SERVER_UNKNOWN_ERROR,
      );
      mockApiClient.post.mockRejectedValue(unknownError);
      spyConsole("error", [unknownError]);
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Senha"), "password123");
      await user.click(screen.getByRole("button", { name: /entrar/i }));

      expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    });
  });
});
