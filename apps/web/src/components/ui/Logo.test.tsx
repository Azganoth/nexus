import { Logo } from "$/components/ui/Logo";
import logo from "$/images/Logo.png";
import logoWithName from "$/images/LogoWithName.png";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("Logo", () => {
  it('renders the icon-only variant when variant is "icon-only"', () => {
    render(<Logo variant="icon-only" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", logo.src);
    expect(image).toHaveAttribute(
      "alt",
      expect.stringMatching(/logo do nexus/i),
    );
  });

  it('renders the icon-and-name variant when variant is "icon-and-name"', () => {
    render(<Logo variant="icon-and-name" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", logoWithName.src);
    expect(image).toHaveAttribute(
      "alt",
      expect.stringMatching(/logo do nexus/i),
    );
  });

  it("applies custom class names", () => {
    const customClass = "my-custom-logo-class";
    render(<Logo variant="icon-only" className={customClass} />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass(customClass);
  });
});
