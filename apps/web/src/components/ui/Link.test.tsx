import { Link } from "$/components/ui/Link";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("Link", () => {
  it("renders with children", () => {
    render(<Link href="/test">Click me</Link>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders as a link with correct href", () => {
    render(<Link href="/test">Click me</Link>);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("applies custom className", () => {
    render(
      <Link href="/test" className="custom-class">
        Click me
      </Link>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
  });

  it("forwards additional props to link", () => {
    render(
      <Link href="/test" data-testid="custom-link" aria-label="Test link">
        Click me
      </Link>,
    );

    const link = screen.getByTestId("custom-link");
    expect(link).toHaveAttribute("aria-label", "Test link");
  });

  describe("New Tab Behavior", () => {
    it("opens in new tab when newTab is true", () => {
      render(
        <Link href="/test" newTab>
          Click me
        </Link>,
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });

    it("does not open in new tab when newTab is false", () => {
      render(
        <Link href="/test" newTab={false}>
          Click me
        </Link>,
      );

      const link = screen.getByRole("link");
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    });

    it("does not open in new tab when newTab is undefined", () => {
      render(<Link href="/test">Click me</Link>);

      const link = screen.getByRole("link");
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    });
  });

  describe("Accessibility", () => {
    it("is keyboard accessible", () => {
      render(<Link href="/test">Click me</Link>);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("supports custom aria attributes", () => {
      render(
        <Link
          href="/test"
          aria-describedby="description"
          aria-label="Custom label"
        >
          Click me
        </Link>,
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-describedby", "description");
      expect(link).toHaveAttribute("aria-label", "Custom label");
    });
  });

  describe("Different href types", () => {
    it("handles relative URLs", () => {
      render(<Link href="/relative-path">Relative link</Link>);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/relative-path");
    });

    it("handles absolute URLs", () => {
      render(<Link href="https://example.com">External link</Link>);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("handles hash links", () => {
      render(<Link href="#section">Hash link</Link>);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "#section");
    });
  });
});
