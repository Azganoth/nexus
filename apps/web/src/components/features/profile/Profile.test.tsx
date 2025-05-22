import { createRandomPublicProfile } from "$/__tests__/factories";
import { Profile } from "$/components/features/profile/Profile";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("Profile", () => {
  const mockProfile = createRandomPublicProfile(2);

  it("renders the profile component", () => {
    render(<Profile profile={mockProfile} />);

    const avatar = screen.getByRole("presentation");
    expect(avatar).toHaveAttribute("src", mockProfile.avatarUrl);
    expect(avatar).toHaveAttribute("alt", "");

    expect(
      screen.getByRole("heading", { name: mockProfile.displayName }),
    ).toBeInTheDocument();

    expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(mockProfile.links.length);
    expect(links[0]).toHaveTextContent(mockProfile.links[0].title);
    expect(links[0]).toHaveAttribute("href", mockProfile.links[0].url);
    expect(links[0]).toHaveAttribute("target", "_blank");

    expect(links[1]).toHaveTextContent(mockProfile.links[1].title);
    expect(links[1]).toHaveAttribute("href", mockProfile.links[1].url);
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
