import { Logo } from "$/components/ui/Logo";
import logo from "$/images/Logo.png";
import logoWithName from "$/images/LogoWithName.png";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: jest.fn((props) => {
    // @ts-expect-error Irrelevant
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  }),
}));
jest.mock("$/images/Logo.png", () => ({
  __esModule: true,
  default: "logo-image.png",
}));
jest.mock("$/images/LogoWithName.png", () => ({
  __esModule: true,
  default: "logo-with-name-image.png",
}));

describe("Logo", () => {
  it('should render the icon-only variant when variant is "icon-only"', () => {
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

  it('should render the icon-and-name variant when variant is "icon-and-name"', () => {
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

  it("should apply custom class names", () => {
    const customClass = "my-custom-logo-class";
    render(<Logo variant="icon-only" className={customClass} />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass(customClass);
  });
});
