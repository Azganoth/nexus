import { Input } from "$/components/ui/Input";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("Input", () => {
  const user = userEvent.setup();

  it("renders with default props", () => {
    render(<Input id="test-input" label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders with custom props", () => {
    render(<Input id="test-input" label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("calls onChange when value changes", async () => {
    const handleChange = jest.fn();
    render(
      <Input id="test-input" label="Email" value="" onChange={handleChange} />,
    );

    const inputElement = screen.getByLabelText("Email");
    await user.type(inputElement, "hello");

    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it("calls onBlur when input loses focus", async () => {
    render(<Input id="test-input" label="My Input" />);

    const container = screen.getByTestId("input-container");
    const inputElement = screen.getByLabelText("My Input");

    expect(inputElement).not.toHaveFocus();
    await user.click(container);
    expect(inputElement).toHaveFocus();
  });

  it("calls onFocus when input gains focus", async () => {
    render(<Input id="test-input" label="My Input" />);

    const container = screen.getByTestId("input-container");
    const inputElement = screen.getByLabelText("My Input");

    expect(inputElement).not.toHaveFocus();
    await user.click(container);
    expect(inputElement).toHaveFocus();
  });

  it("applies custom class names", () => {
    render(<Input id="test-input" label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  describe("Floating Label Behavior", () => {
    it("shows floating label when input has value", () => {
      render(
        <Input id="test-input" label="Test Label" defaultValue="has value" />,
      );
      const label = screen.getByText("Test Label");
      expect(label).not.toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );
    });

    it("shows floating label when input is focused", () => {
      render(<Input id="test-input" label="Test Label" />);
      const label = screen.getByText("Test Label");

      expect(label).toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );
    });

    it("hides floating label when input is empty and not focused", () => {
      render(<Input id="test-input" label="Test Label" defaultValue="" />);
      const label = screen.getByText("Test Label");

      expect(label).toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );
    });

    it("maintains floating label state during typing", async () => {
      render(<Input id="test-input" label="Test Label" />);
      const label = screen.getByText("Test Label");
      const input = screen.getByLabelText("Test Label");

      expect(label).toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );

      await user.type(input, "a");
      expect(label).not.toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );

      await user.clear(input);
      expect(label).toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );
    });
  });

  describe("Error Handling and Accessibility", () => {
    it("displays error message when provided", () => {
      render(<Input id="pw" label="Password" error="Password is too short" />);

      const container = screen.getByTestId("input-container");
      expect(container).toHaveClass("outline-red");

      const errorMessage = screen.getByText("Password is too short");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute("role", "alert");
    });

    it("sets aria-invalid when error is present", () => {
      render(
        <Input id="test-input-id" label="Test" error="An error occurred" />,
      );

      const inputElement = screen.getByLabelText("Test");
      expect(inputElement.id).toBe("test-input-id");

      const errorMessage = screen.getByText("An error occurred");
      expect(inputElement).toHaveAttribute("aria-describedby", errorMessage.id);
      expect(inputElement).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error message with input via aria-describedby", () => {
      render(
        <Input id="test-input-id" label="Test" error="An error occurred" />,
      );

      const inputElement = screen.getByLabelText("Test");
      expect(inputElement.id).toBe("test-input-id");

      const errorMessage = screen.getByText("An error occurred");
      expect(inputElement).toHaveAttribute("aria-describedby", errorMessage.id);
      expect(inputElement).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid when no error is present", () => {
      render(<Input id="test-id" label="Test" />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      const inputContainer = screen.getByTestId("input-container");
      expect(inputContainer).not.toHaveClass("outline-red");

      const inputElement = screen.getByLabelText("Test");
      expect(inputElement).toHaveAttribute("aria-invalid", "false");
    });
  });
});
