import {
  createRandomAuthenticatedProfile,
  createRandomAuthenticatedUser,
} from "$/__tests__/factories";
import { mockedHook } from "$/__tests__/helpers";
import { DashboardSettings } from "$/components/features/dashboard/DashboardSettings";
import { useProfile } from "$/hooks/useProfile";
import { useUser } from "$/hooks/useUser";
import { ApiError } from "$/lib/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation");
jest.mock("$/hooks/useProfile");
jest.mock("$/hooks/useUser");

const mockUseProfile = mockedHook(useProfile);
const mockUseUser = mockedHook(useUser);

describe("DashboardSettings", () => {
  const mockProfile = createRandomAuthenticatedProfile();
  const mockUser = createRandomAuthenticatedUser();

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseProfile.mockReturnValue({});
    mockUseUser.mockReturnValue({});
  });

  it("renders loading skeleton when profile or user is loading", () => {
    mockUseUser.mockReturnValue({
      isUserLoading: true,
    });
    mockUseProfile.mockReturnValue({
      isProfileLoading: false,
    });

    render(<DashboardSettings />);

    const skeleton = screen.getByLabelText(/carregando/i);
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("renders error state when profile fails to load", () => {
    const profileError = new ApiError(
      "SERVER_UNKNOWN_ERROR",
      "Failed to load profile",
    );
    mockUseProfile.mockReturnValue({
      isProfileLoading: false,
      profileError,
    });

    render(<DashboardSettings />);

    expect(
      screen.getByText("Não foi possível carregar suas configurações."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tentar Novamente" }),
    ).toBeInTheDocument();
  });

  it("renders error state when user fails to load", () => {
    const userError = new ApiError(
      "SERVER_UNKNOWN_ERROR",
      "Failed to load user",
    );
    mockUseUser.mockReturnValue({
      isUserLoading: false,
      userError,
    });

    render(<DashboardSettings />);

    expect(
      screen.getByText("Não foi possível carregar suas configurações."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tentar Novamente" }),
    ).toBeInTheDocument();
  });

  it("renders both ProfileSettings and AccountSettings when data loads successfully", () => {
    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      isProfileLoading: false,
    });
    mockUseUser.mockReturnValue({
      user: mockUser,
      isUserLoading: false,
    });

    render(<DashboardSettings />);

    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Conta")).toBeInTheDocument();
  });

  it("calls revalidateProfile when retry button is clicked in profile error state", async () => {
    const user = userEvent.setup();

    const revalidateProfile = jest.fn(async () => undefined);
    const profileError = new ApiError(
      "SERVER_UNKNOWN_ERROR",
      "Failed to load profile",
    );
    mockUseProfile.mockReturnValue({
      isProfileLoading: false,
      profileError,
      revalidateProfile,
    });
    mockUseUser.mockReturnValue({
      user: mockUser,
      isUserLoading: false,
    });

    render(<DashboardSettings />);
    await user.click(screen.getByRole("button", { name: "Tentar Novamente" }));

    expect(revalidateProfile).toHaveBeenCalled();
  });

  it("calls revalidateUser when retry button is clicked in user error state", async () => {
    const user = userEvent.setup();

    const revalidateUser = jest.fn(async () => undefined);
    const userError = new ApiError(
      "SERVER_UNKNOWN_ERROR",
      "Failed to load user",
    );
    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      isProfileLoading: false,
    });
    mockUseUser.mockReturnValue({
      isUserLoading: false,
      userError,
      revalidateUser,
    });

    render(<DashboardSettings />);
    await user.click(screen.getByRole("button", { name: "Tentar Novamente" }));

    expect(revalidateUser).toHaveBeenCalled();
  });
});
