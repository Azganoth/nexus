import { createRandomAuthenticatedProfile } from "$/__tests__/factories";
import { mockedHook, renderWithProviders } from "$/__tests__/helpers";
import { DashboardHeader } from "$/app/dashboard/components/DashboardHeader";
import { useProfile } from "$/hooks/useProfile";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname, useRouter } from "next/navigation";

jest.mock("next/navigation");
jest.mock("$/hooks/useProfile");
jest.mock("$/lib/apiClient");

const mockUseRouter = mockedHook(useRouter);
const mockUsePathname = mockedHook(usePathname);

const mockUseProfile = mockedHook(useProfile);

describe("DashboardHeader", () => {
  const mockProfile = createRandomAuthenticatedProfile();

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      isProfileLoading: false,
    });
  });

  it("renders skeleton when loading", () => {
    mockUseProfile.mockReturnValue({
      profile: undefined,
      isProfileLoading: true,
    });
    renderWithProviders(<DashboardHeader />);

    expect(
      screen.getByRole("banner", { name: /carregando/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveAttribute("aria-busy", "true");
  });

  it("renders dashboard header with correct title and navigation", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    renderWithProviders(<DashboardHeader />);

    expect(
      screen.getByRole("banner", { name: /cabeçalho/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nexus" })).toBeInTheDocument();

    // Settings icon
    expect(screen.getByLabelText(/configurações/i)).toBeInTheDocument();

    // Visitar and Prévia links
    expect(screen.getByLabelText(/visitar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prévia/i)).toBeInTheDocument();

    // No logout button
    expect(
      screen.queryByRole("button", { name: /sair/i }),
    ).not.toBeInTheDocument();
  });

  it("renders settings header with correct title and logout button", () => {
    mockUsePathname.mockReturnValue("/dashboard/settings");
    renderWithProviders(<DashboardHeader />);

    expect(
      screen.getByRole("heading", { name: "Configurações" }),
    ).toBeInTheDocument();

    // Back arrow
    expect(screen.getByLabelText(/voltar/i)).toBeInTheDocument();

    // Logout button
    const logoutBtn = screen.getByRole("button", { name: /sair/i });
    expect(logoutBtn).toBeInTheDocument();

    // No Visitar or Prévia links
    expect(screen.queryByLabelText(/visitar/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/prévia/i)).not.toBeInTheDocument();
  });

  it("calls logout and redirects on logout button click", async () => {
    const user = userEvent.setup();

    const mockPush = jest.fn();
    mockUseRouter.mockImplementation(() => ({ push: mockPush }));
    mockUsePathname.mockReturnValue("/dashboard/settings");

    renderWithProviders(<DashboardHeader />);
    const logout = screen.getByRole("button", { name: /sair/i });
    await user.click(logout);

    expect(mockPush).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("renders preview header with correct title and navigation", () => {
    mockUsePathname.mockReturnValue("/dashboard/preview");
    renderWithProviders(<DashboardHeader />);

    expect(screen.getByRole("heading", { name: "Prévia" })).toBeInTheDocument();

    // Back arrow
    expect(screen.getByLabelText(/voltar/i)).toBeInTheDocument();

    // Visitar link
    expect(screen.getByLabelText(/visitar/i)).toBeInTheDocument();

    // No logout or Prévia link
    expect(
      screen.queryByRole("button", { name: /sair/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/prévia/i)).not.toBeInTheDocument();
  });

  it("uses profile username in Visitar link", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      isProfileLoading: false,
    });
    renderWithProviders(<DashboardHeader />);

    const visitarLink = screen.getByLabelText(/visitar/i);
    expect(visitarLink).toHaveAttribute("href", `/p/${mockProfile.username}`);
  });

  it("applies correct aria attributes", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    renderWithProviders(<DashboardHeader />);

    const banner = screen.getByRole("banner");
    expect(banner).toHaveAttribute("aria-label", "Cabeçalho do dashboard");
  });
});
