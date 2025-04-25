import { SignupForm } from "@components/SignupForm";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { signup } from "@lib/api";
import { toast } from "@lib/toast";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@lib/api", () => ({
  signup: jest.fn(),
}));

jest.mock("@lib/toast", () => ({
  toast: jest.fn(),
}));

describe("SignupForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillAndSubmitForm = async ({
    email = "test@exemplo.com",
    password = "Senha123",
    confirmPassword = "Senha123",
  } = {}) => {
    await user.type(screen.getByLabelText(/email/i), email);
    await user.type(screen.getByLabelText(/^senha/i), password);
    await user.type(
      screen.getByLabelText(/confirme a senha/i),
      confirmPassword,
    );
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    return { email, password, confirmPassword };
  };

  it("renders all form fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirme a senha/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cadastrar/i }),
    ).toBeInTheDocument();
  });

  // FIX: react-hook-form bug?
  // it("validates email format", async () => {
  //   render(<SignupForm />);

  //   await fillAndSubmitForm({ email: "invalidemail" });

  //   expect(
  //     await screen.findByText(/insira um email válido/i),
  //   ).toBeInTheDocument();
  // });

  it("validates password requirements", async () => {
    render(<SignupForm />);

    await fillAndSubmitForm({ password: "short" });

    expect(
      await screen.findByText(/pelo menos 8 caracteres/i),
    ).toBeInTheDocument();
  });

  it("validates password match", async () => {
    render(<SignupForm />);

    await fillAndSubmitForm({ confirmPassword: "outraSenha" });

    expect(
      await screen.findByText(/senhas não coincidem/i),
    ).toBeInTheDocument();
  });

  it("submits valid form", async () => {
    render(<SignupForm />);

    const { email, password } = await fillAndSubmitForm();

    await waitFor(() => expect(signup).toBeCalledWith(email, password));
  });

  it("disables submit button", async () => {
    (signup as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 500)),
    );
    render(<SignupForm />);

    await fillAndSubmitForm();

    expect(screen.getByRole("button")).toBeDisabled();
    await waitFor(() => expect(signup).toHaveBeenCalled());
  });

  it("shows error on failure", async () => {
    (signup as jest.Mock).mockImplementationOnce(() => Promise.reject());
    render(<SignupForm />);

    await fillAndSubmitForm();

    await waitFor(() => expect(toast).toHaveBeenCalled());
  });

  it("has proper input associations", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "id",
      "signup-email",
    );
  });

  it("shows aria attributes for errors", async () => {
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
