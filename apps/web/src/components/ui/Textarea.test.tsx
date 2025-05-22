import { Textarea } from "$/components/ui/Textarea";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Textarea", () => {
  it("renders with label", () => {
    render(<Textarea label="Label" />);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Textarea />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(screen.queryByLabelText(/./)).not.toBeInTheDocument();
  });

  it("applies custom className to root", () => {
    render(<Textarea label="Label" className="custom-class" />);

    const root = screen.getByTestId("textarea-wrapper");
    expect(root).toHaveClass("custom-class");
  });

  it("forwards props to textarea", () => {
    render(<Textarea label="Label" required disabled />);

    const textarea = screen.getByLabelText("Label");
    expect(textarea).toBeRequired();
    expect(textarea).toBeDisabled();
  });

  it("calls onChange when value changes", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Textarea label="Label" value="" onChange={handleChange} />);

    const textarea = screen.getByLabelText("Label");
    await user.type(textarea, "hello");

    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it("calls onBlur when textarea loses focus", async () => {
    const user = userEvent.setup();

    const handleBlur = jest.fn();
    render(<Textarea label="Label" onBlur={handleBlur} />);
    const container = screen.getByTestId("textarea-container");

    const textarea = screen.getByLabelText("Label");
    expect(textarea).not.toHaveFocus();

    await user.click(container);
    expect(textarea).toHaveFocus();
    await user.click(document.body);

    expect(handleBlur).toHaveBeenCalled();
    expect(textarea).not.toHaveFocus();
  });

  it("calls onFocus when textarea receives focus", async () => {
    const user = userEvent.setup();

    const handleFocus = jest.fn();
    render(<Textarea label="Label" onFocus={handleFocus} />);

    const textarea = screen.getByLabelText("Label");
    await user.click(textarea);

    expect(textarea).toHaveFocus();
    expect(handleFocus).toHaveBeenCalled();
  });

  it("calls onFocus when user clicks the container", async () => {
    const user = userEvent.setup();

    const handleFocus = jest.fn();
    render(<Textarea label="Label" onFocus={handleFocus} />);
    const container = screen.getByTestId("textarea-container");

    const textarea = screen.getByLabelText("Label");
    expect(textarea).not.toHaveFocus();

    await user.click(container);

    expect(handleFocus).toHaveBeenCalled();
    expect(textarea).toHaveFocus();
  });

  describe("Id Handling", () => {
    it("generates a unique id if none is provided", () => {
      render(<Textarea label="Label" />);

      const textarea = screen.getByLabelText("Label");
      expect(textarea).toHaveAttribute("id");
      const label = screen.getByText("Label");
      expect(label).toHaveAttribute("for", textarea.id);
    });

    it("uses provided id", () => {
      render(<Textarea id="custom-id" label="Label" />);

      const textarea = screen.getByLabelText("Label");
      expect(textarea).toHaveAttribute("id", "custom-id");
      const label = screen.getByText("Label");
      expect(label).toHaveAttribute("for", "custom-id");
    });

    it("multiple textareas without id have unique ids", () => {
      render(
        <>
          <Textarea label="First" />
          <Textarea label="Second" />
        </>,
      );

      const textareas = screen.getAllByRole("textbox");
      expect(textareas[0].id).not.toBe(textareas[1].id);
    });
  });

  describe("Error Handling and Accessibility", () => {
    it("displays error message when provided", () => {
      render(<Textarea label="Label" error="Error message" />);

      const container = screen.getByTestId("textarea-container");
      expect(container).toHaveClass("outline-red");

      const error = screen.getByText("Error message");
      expect(error).toBeInTheDocument();
      expect(error).toHaveAttribute("aria-live", "polite");
    });

    it("sets aria-invalid when error is present", () => {
      render(<Textarea label="Label" error="Error" />);

      const textarea = screen.getByLabelText("Label");
      const error = screen.getByText("Error");

      expect(textarea).toHaveAttribute("aria-describedby", `${error.id}-error`);
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error message with textarea via aria-describedby", () => {
      render(<Textarea label="Label" error="Error" />);

      const textarea = screen.getByLabelText("Label");
      const error = screen.getByText("Error");

      expect(textarea).toHaveAttribute("aria-describedby", `${error.id}-error`);
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid when no error is present", () => {
      render(<Textarea label="Label" />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      const container = screen.getByTestId("textarea-container");
      expect(container).not.toHaveClass("outline-red");

      const textarea = screen.getByLabelText("Label");
      expect(textarea).toHaveAttribute("aria-invalid", "false");
    });
  });
});
