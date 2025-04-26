import { Input } from "$/components/Input";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";

describe("Input", () => {
  const user = userEvent.setup();

  it("renders label when provided", () => {
    render(<Input label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("handles controlled value changes", async () => {
    const handleChange = jest.fn();
    render(<Input value="test" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "new");

    expect(handleChange).toHaveBeenCalled();
  });

  it("focuses input when container clicked", async () => {
    render(<Input />);

    const container = screen.getByTestId("input-container");
    const input = screen.getByRole("textbox");
    await user.click(container);

    expect(input).toHaveFocus();
  });

  it("shows error message when provided", () => {
    render(<Input error="Invalid value" />);

    expect(screen.getByText("Invalid value")).toBeInTheDocument();
    expect(screen.getByRole("textbox").parentElement).toHaveClass(
      "outline-red",
    );
  });

  it("forwards ref correctly", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("associates label with input for accessibility", () => {
    render(<Input label="Test" id="test-input" />);

    expect(screen.getByLabelText("Test").id).toBe("test-input");
  });
});
