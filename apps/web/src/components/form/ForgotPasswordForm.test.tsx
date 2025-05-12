import { ForgotPasswordForm } from "$/components/form/ForgotPasswordForm";
import { toast } from "$/components/ui/Toast";
import { apiClient } from "$/services/apiClient";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";

jest.mock("$/services/apiClient");
jest.mock("$/components/ui/Toast");

jest.mock("$/components/layout/SlidingView", () => ({
  SlidingView: ({
    views,
    currentView,
  }: {
    views: Record<string, ReactNode>;
    currentView: string;
  }) => <div>{views[currentView]}</div>,
}));

const mockApiClient = jest.mocked(apiClient);
const mockToast = jest.mocked(toast);

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sends a password reset email", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockApiClient.post.mockResolvedValue(undefined);
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", {
      name: /redefinir senha/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "test@example.com",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Email de redefinição enviado!",
    );
    expect(
      await screen.findByText(/Um email foi enviado para/i),
    ).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  describe("UI State and Feedback", () => {
    it("disables the submit button during submission", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockApiClient.post.mockResolvedValue(undefined);
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole("button", {
        name: /redefinir senha/i,
      });
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it("shows success message after successful submission", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockApiClient.post.mockResolvedValue(undefined);
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.click(
        screen.getByRole("button", { name: /redefinir senha/i }),
      );

      expect(mockToast.success).toHaveBeenCalledWith(
        "Email de redefinição enviado!",
      );
      expect(
        await screen.findByText(/Um email foi enviado para/i),
      ).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  describe("Validation and Error Handling", () => {
    it("should show a server error if the email is not found", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockApiClient.post.mockRejectedValue(new Error("Email not found"));
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.click(
        screen.getByRole("button", { name: /redefinir senha/i }),
      );

      expect(mockToast.error).toHaveBeenCalledWith(
        "Email not found Tente novamente mais tarde.",
        { duration: 5000 },
      );
    });

    it("should show a generic unexpected error for an unhandled API failure", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockApiClient.post.mockRejectedValue(
        new Error("Generic unexpected error"),
      );
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.click(
        screen.getByRole("button", { name: /redefinir senha/i }),
      );

      expect(mockToast.error).toHaveBeenCalledWith(
        "Generic unexpected error Tente novamente mais tarde.",
        { duration: 5000 },
      );
    });
  });

  it("should handle the resend cooldown and functionality", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockApiClient.post.mockResolvedValue(undefined);
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }));

    const resendButton = await screen.findByRole("button", {
      name: /reenviar em/i,
    });
    expect(resendButton).toBeInTheDocument();
    expect(resendButton).toBeDisabled();
    expect(resendButton).toHaveTextContent("Reenviar em 60s");

    for (let i = 0; i < 30; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(resendButton).toHaveTextContent("Reenviar em 30s");

    for (let i = 0; i < 30; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(resendButton).toBeEnabled();
    expect(resendButton).toHaveTextContent("Reenviar email");

    await user.click(resendButton);

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      "Email de redefinição reenviado!",
    );
    await waitFor(() => {
      expect(resendButton).toHaveTextContent("Reenviar em 60s");
    });
  });
});
