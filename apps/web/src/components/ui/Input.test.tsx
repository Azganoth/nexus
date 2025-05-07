import { Input } from "$/components/ui/Input";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";

describe("Input", () => {
  const user = userEvent.setup();

  it("should render the label when provided", () => {
    render(<Input id="test-input" label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("should handle controlled value changes and call onChange", async () => {
    const handleChange = jest.fn();
    render(
      <Input id="test-input" label="Email" value="" onChange={handleChange} />,
    );

    const inputElement = screen.getByLabelText("Email");
    await user.type(inputElement, "hello");

    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it("should forward its ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input id="test-input" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("should focus the input when the container is clicked", async () => {
    render(<Input id="test-input" label="My Input" />);

    const container = screen.getByTestId("input-container");
    const inputElement = screen.getByLabelText("My Input");

    expect(inputElement).not.toHaveFocus();
    await user.click(container);
    expect(inputElement).toHaveFocus();
  });

  describe("Floating Label Behavior", () => {
    it("should apply floating label styles when the input is empty", () => {
      render(<Input id="test-input" label="Test Label" defaultValue="" />);
      const label = screen.getByText("Test Label");
      expect(label).toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );
    });

    it("should not apply floating label styles when the input has a value", () => {
      render(
        <Input id="test-input" label="Test Label" defaultValue="has value" />,
      );
      const label = screen.getByText("Test Label");
      expect(label).not.toHaveClass(
        "peer-not-focus:peer-not-placeholder-shown:translate-y-4",
      );
    });

    it("should toggle floating label based on user input", async () => {
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
    it("should display an error message and apply error styles when an error is provided", () => {
      render(<Input id="pw" label="Password" error="Password is too short" />);

      const container = screen.getByTestId("input-container");
      expect(container).toHaveClass("outline-red");

      const errorMessage = screen.getByText("Password is too short");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute("role", "alert");
    });

    it("should associate the label and error message with the input for accessibility", () => {
      render(
        <Input id="test-input-id" label="Test" error="An error occurred" />,
      );

      const inputElement = screen.getByLabelText("Test");
      expect(inputElement.id).toBe("test-input-id");

      const errorMessage = screen.getByText("An error occurred");
      expect(inputElement).toHaveAttribute("aria-describedby", errorMessage.id);
      expect(inputElement).toHaveAttribute("aria-invalid", "true");
    });

    it("should not render error elements or styles when no error is provided", () => {
      render(<Input id="test-id" label="Test" />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      const inputContainer = screen.getByTestId("input-container");
      expect(inputContainer).not.toHaveClass("outline-red");

      const inputElement = screen.getByLabelText("Test");
      expect(inputElement).toHaveAttribute("aria-invalid", "false");
    });
  });
});
