import { createTestPublicProfile } from "$/__tests__/factories";
import { Profile } from "$/components/features/Profile";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("Profile", () => {
  const mockProfile = createTestPublicProfile();

  it("should render all profile details correctly", () => {
    render(<Profile profile={mockProfile} />);

    const avatar = screen.getByRole("presentation");
    expect(avatar).toHaveAttribute("src", mockProfile.avatarUrl);
    expect(avatar).toHaveAttribute("alt", "");

    expect(
      screen.getByRole("heading", { name: "Alice Ferreira" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Professional cosplayer and content creator."),
    ).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("Instagram");
    expect(links[0]).toHaveAttribute("href", "https://instagram.com/alice");
    expect(links[0]).toHaveAttribute("target", "_blank");

    expect(links[1]).toHaveTextContent("Patreon");
    expect(links[1]).toHaveAttribute("href", "https://patreon.com/alice");
  });

  it("should not render the bio paragraph if the bio is null or empty", () => {
    const profileWithoutBio = { ...mockProfile, bio: null };
    render(<Profile profile={profileWithoutBio} />);

    const bioElement = screen.queryByText(
      "Professional cosplayer and content creator.",
    );
    expect(bioElement).not.toBeInTheDocument();
  });

  it("should render an empty list if there are no links", () => {
    const profileWithoutLinks = { ...mockProfile, links: [] };
    render(<Profile profile={profileWithoutLinks} />);

    const listItems = screen.queryAllByRole("listitem");
    expect(listItems).toHaveLength(0);
  });
});
