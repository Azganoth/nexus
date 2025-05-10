import { ErrorHint } from "$/components/ui/ErrorHint";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("ErrorHint", () => {
  it("renders nothing visible when no message is provided", () => {
    const { container } = render(<ErrorHint />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("renders the message and applies accessibility roles when a message is provided", () => {
    render(<ErrorHint message="Error here." />);

    const alertElement = screen.getByText("Error here.");
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveAttribute("role", "alert");
  });

  it("correctly constructs the element id for accessibility", () => {
    render(<ErrorHint id="test-input" message="Error here." />);

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toHaveAttribute("id", "test-input-error");
  });

  it("does not have an id if the id prop is not provided", () => {
    render(<ErrorHint message="Error here." />);

    const alertElement = screen.getByRole("alert");
    expect(alertElement).not.toHaveAttribute("id");
  });

  it("merges custom class names correctly", () => {
    const { container } = render(<ErrorHint className="my-custom-class" />);
    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
