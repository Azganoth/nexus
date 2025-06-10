import { createRandomAuthenticatedProfile } from "$/__tests__/factories";
import { mockedHook, renderWithProviders } from "$/__tests__/helpers";
import { useProfile } from "$/hooks/useProfile";
import { ApiError } from "$/lib/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardProfile } from "./DashboardProfile";

jest.mock("$/hooks/useProfile");

const mockUseProfile = mockedHook(useProfile);

describe("DashboardProfile", () => {
  const mockProfile = createRandomAuthenticatedProfile();

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseProfile.mockReturnValue({});
  });

  it("renders loading skeleton when profile is loading", () => {
    mockUseProfile.mockReturnValue({
      isProfileLoading: true,
    });

    renderWithProviders(<DashboardProfile />);

    const skeleton = screen.getByLabelText(/carregando perfil/i);
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

    renderWithProviders(<DashboardProfile />);

    expect(
      screen.getByText("Não foi possível carregar seu perfil."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tentar novamente/i }),
    ).toBeInTheDocument();
  });

  it("renders error state when profile is missing", () => {
    mockUseProfile.mockReturnValue({
      isProfileLoading: false,
      profile: undefined,
    });

    renderWithProviders(<DashboardProfile />);

    expect(
      screen.getByText("Não foi possível carregar seu perfil."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tentar novamente/i }),
    ).toBeInTheDocument();
  });

  it("renders ProfileDashboard and ProfileShare when data loads successfully", () => {
    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      isProfileLoading: false,
    });

    renderWithProviders(<DashboardProfile />);

    expect(
      screen.getByRole("heading", { name: mockProfile.displayName, level: 2 }),
    ).toBeInTheDocument();
  });

  it("calls revalidateProfile when retry button is clicked in error state", async () => {
    const user = userEvent.setup();
    const revalidateProfile = jest.fn(async () => undefined);
    mockUseProfile.mockReturnValue({
      isProfileLoading: false,
      profileError: new ApiError(
        "SERVER_UNKNOWN_ERROR",
        "Failed to load profile",
      ),
      revalidateProfile,
    });

    renderWithProviders(<DashboardProfile />);
    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(revalidateProfile).toHaveBeenCalled();
  });
});
