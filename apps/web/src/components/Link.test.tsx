import { CustomLink } from "@components/Link";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("Link", () => {
  it("renders correctly", () => {
    render(<CustomLink href="/test">Test Link</CustomLink>);

    const link = screen.getByRole("link", { name: "Test Link" });
    expect(link).toHaveAttribute("href", "/test");
  });
});
