import { Input } from "$/components/ui/Input";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Label" />);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Input />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(screen.queryByLabelText(/./)).not.toBeInTheDocument();
  });

  it("applies custom className to root", () => {
    render(<Input label="Label" className="custom-class" />);

    const root = screen.getByTestId("input-wrapper");
    expect(root).toHaveClass("custom-class");
  });

  it("forwards props to input", () => {
    render(<Input label="Label" required disabled />);

    const input = screen.getByLabelText("Label");
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it("calls onChange when value changes", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Input label="Label" value="" onChange={handleChange} />);

    const input = screen.getByLabelText("Label");
    await user.type(input, "hello");

    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it("calls onBlur when input loses focus", async () => {
    const user = userEvent.setup();

    const handleBlur = jest.fn();
    render(<Input label="Label" onBlur={handleBlur} />);
    const container = screen.getByTestId("input-container");

    const input = screen.getByLabelText("Label");
    expect(input).not.toHaveFocus();

    await user.click(container);
    expect(input).toHaveFocus();
    await user.click(document.body);

    expect(handleBlur).toHaveBeenCalled();
    expect(input).not.toHaveFocus();
  });

  it("calls onFocus when input receives focus", async () => {
    const user = userEvent.setup();

    const handleFocus = jest.fn();
    render(<Input label="Label" onFocus={handleFocus} />);

    const input = screen.getByLabelText("Label");
    await user.click(input);

    expect(input).toHaveFocus();
    expect(handleFocus).toHaveBeenCalled();
  });

  it("calls onFocus when user clicks the container", async () => {
    const user = userEvent.setup();

    const handleFocus = jest.fn();
    render(<Input label="Label" onFocus={handleFocus} />);

    const container = screen.getByTestId("input-container");
    const input = screen.getByLabelText("Label");
    expect(input).not.toHaveFocus();

    await user.click(container);

    expect(handleFocus).toHaveBeenCalled();
    expect(input).toHaveFocus();
  });

  describe("Id Handling", () => {
    it("generates a unique id if none is provided", () => {
      render(<Input label="Label" />);

      const input = screen.getByLabelText("Label");
      expect(input).toHaveAttribute("id");
      const label = screen.getByText("Label");
      expect(label).toHaveAttribute("for", input.id);
    });

    it("uses provided id", () => {
      render(<Input id="custom-id" label="Label" />);

      const input = screen.getByLabelText("Label");
      expect(input).toHaveAttribute("id", "custom-id");
      const label = screen.getByText("Label");
      expect(label).toHaveAttribute("for", "custom-id");
    });

    it("multiple inputs without id have unique ids", () => {
      render(
        <>
          <Input label="First" />
          <Input label="Second" />
        </>,
      );

      const inputs = screen.getAllByRole("textbox");
      expect(inputs[0].id).not.toBe(inputs[1].id);
    });
  });

  describe("Error Handling and Accessibility", () => {
    it("displays error message when provided", () => {
      render(<Input label="Label" error="Error message" />);

      const container = screen.getByTestId("input-container");
      expect(container).toHaveClass("outline-red");

      const error = screen.getByText("Error message");
      expect(error).toBeInTheDocument();
      expect(error).toHaveAttribute("aria-live", "polite");
    });

    it("sets aria-invalid when error is present", () => {
      render(<Input label="Label" error="Error" />);

      const input = screen.getByLabelText("Label");
      const error = screen.getByText("Error");

      expect(input).toHaveAttribute("aria-describedby", error.id);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error message with input via aria-describedby", () => {
      render(<Input label="Label" error="Error" />);

      const input = screen.getByLabelText("Label");
      const error = screen.getByText("Error");

      expect(input).toHaveAttribute("aria-describedby", error.id);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid when no error is present", () => {
      render(<Input label="Label" />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      const container = screen.getByTestId("input-container");
      expect(container).not.toHaveClass("outline-red");

      const input = screen.getByLabelText("Label");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });
  });
});
