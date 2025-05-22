import { ErrorHint } from "$/components/ui/ErrorHint";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("ErrorHint", () => {
  it("renders nothing when no error is provided", () => {
    const { container } = render(<ErrorHint />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the error message when error is provided", () => {
    render(<ErrorHint error="Error here." />);

    const errorElement = screen.getByText("Error here.");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement.tagName).toBe("P");
  });

  it("applies correct accessibility attributes", () => {
    render(<ErrorHint error="Error here." />);

    const errorElement = screen.getByText("Error here.");
    expect(errorElement).toHaveAttribute("aria-live", "polite");
  });

  it("applies correct CSS classes", () => {
    render(<ErrorHint error="Error here." />);

    const errorElement = screen.getByText("Error here.");
    expect(errorElement).toHaveClass(
      "text-red",
      "whitespace-pre-line",
      "font-bold",
    );
  });

  it("merges custom class names correctly", () => {
    render(<ErrorHint error="Error here." className="my-custom-class" />);

    const errorElement = screen.getByText("Error here.");
    expect(errorElement).toHaveClass(
      "text-red",
      "whitespace-pre-line",
      "font-bold",
      "my-custom-class",
    );
  });

  it("spreads additional props to the element", () => {
    render(<ErrorHint error="Error here." data-testid="error-hint" />);

    const errorElement = screen.getByTestId("error-hint");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("Error here.");
  });
});
