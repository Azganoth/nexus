import { createRandomPublicProfile } from "$/__tests__/factories";
import { ProfileShare } from "$/components/features/profile/ProfileShare";
import { toast } from "$/components/ui/Toast";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("$/components/ui/Toast");

const mockToast = jest.mocked(toast);

describe("ProfileShare", () => {
  const mockProfile = createRandomPublicProfile();
  const mockUsername = mockProfile.username;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders with the correct profile URL", () => {
    render(<ProfileShare username={mockUsername} />);

    expect(screen.getByText(`/p/${mockUsername}`)).toBeInTheDocument();
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ProfileShare username={mockUsername} className="custom-class" />);
    expect(screen.getByRole("group")).toHaveClass("custom-class");
  });

  it("copies the correct URL to clipboard and shows success toast", async () => {
    const user = userEvent.setup();

    render(<ProfileShare username={mockUsername} />);

    const button = screen.getByRole("button");
    await user.click(button);
    expect(mockToast.success).toHaveBeenCalledWith(
      "Link para página de perfil copiado!",
    );

    await waitFor(() => {
      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(button).toHaveAttribute("aria-label", "Link copiado com sucesso");
    });
  });

  it("prevents multiple copies while in copied state", async () => {
    const user = userEvent.setup();

    render(<ProfileShare username={mockUsername} />);

    const button = screen.getByRole("button");
    await user.click(button);
    expect(mockToast.success).toHaveBeenCalledWith(
      "Link para página de perfil copiado!",
    );

    await user.click(button);
    expect(mockToast.success).toHaveBeenCalledTimes(1);
  });
});
