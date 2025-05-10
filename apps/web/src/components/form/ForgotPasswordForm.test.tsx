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

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

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

  it("should successfully submit the email and switch to the notice view", async () => {
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
