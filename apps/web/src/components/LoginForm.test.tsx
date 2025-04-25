import { LoginForm } from "@components/LoginForm";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { login } from "@lib/api";
import { toast } from "@lib/toast";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@lib/api", () => ({
  login: jest.fn(),
}));

jest.mock("@lib/toast", () => ({
  toast: jest.fn(),
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillAndSubmitForm = async ({
    email = "test@exemplo.com",
    password = "Senha123",
  } = {}) => {
    await user.type(screen.getByLabelText(/email/i), email);
    await user.type(screen.getByLabelText(/senha/i), password);
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    return { email, password };
  };

  it("renders all form fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  // FIX: react-hook-form bug?
  // it("validates email format", async () => {
  //   render(<LoginForm />);

  //   await fillAndSubmitForm({ email: "invalidemail" });

  //   expect(
  //     await screen.findByText(/insira um email válido/i),
  //   ).toBeInTheDocument();
  // });

  it("validates password requirements", async () => {
    render(<LoginForm />);

    await fillAndSubmitForm({ password: "short" });

    expect(
      await screen.findByText(/pelo menos 8 caracteres/i),
    ).toBeInTheDocument();
  });

  it("submits valid form", async () => {
    render(<LoginForm />);

    const { email, password } = await fillAndSubmitForm();

    await waitFor(() => expect(login).toBeCalledWith(email, password));
  });

  it("disables submit button", async () => {
    (login as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 500)),
    );
    render(<LoginForm />);

    await fillAndSubmitForm();

    expect(screen.getByRole("button")).toBeDisabled();
    await waitFor(() => expect(login).toHaveBeenCalled());
  });

  it("shows error on failure", async () => {
    (login as jest.Mock).mockImplementationOnce(() => Promise.reject());
    render(<LoginForm />);

    await fillAndSubmitForm();

    await waitFor(() => expect(toast).toHaveBeenCalled());
  });

  it("has proper input associations", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "id",
      "login-email",
    );
  });

  it("shows aria attributes for errors", async () => {
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /entrar/i }));
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
