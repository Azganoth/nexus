import { Switch } from "$/components/ui/Switch";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Switch", () => {
  it("renders with default state", () => {
    render(<Switch />);

    const switchButton = screen.getByRole("switch");
    expect(switchButton).toBeInTheDocument();
    expect(switchButton).toHaveAttribute("aria-checked", "false");
  });

  it("renders with checked state", () => {
    render(<Switch checked={true} />);

    const switchButton = screen.getByRole("switch");
    expect(switchButton).toHaveAttribute("aria-checked", "true");
  });

  it("renders with defaultChecked state", () => {
    render(<Switch defaultChecked={true} />);

    const switchButton = screen.getByRole("switch");
    expect(switchButton).toHaveAttribute("aria-checked", "true");
  });

  it("applies custom className", () => {
    render(<Switch className="custom-class" />);

    const switchButton = screen.getByRole("switch");
    expect(switchButton).toHaveClass("custom-class");
  });

  it("forwards props to button", () => {
    render(<Switch disabled aria-label="Toggle switch" />);

    const switchButton = screen.getByRole("switch");
    expect(switchButton).toBeDisabled();
    expect(switchButton).toHaveAttribute("aria-label", "Toggle switch");
  });

  it("calls onChange when clicked", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Switch onChange={handleChange} />);

    const switchButton = screen.getByRole("switch");
    await user.click(switchButton);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with correct value when toggled", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Switch checked={false} onChange={handleChange} />);

    const switchButton = screen.getByRole("switch");
    await user.click(switchButton);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Switch disabled onChange={handleChange} />);

    const switchButton = screen.getByRole("switch");
    await user.click(switchButton);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("handles keyboard navigation with space key", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Switch onChange={handleChange} />);

    const switchButton = screen.getByRole("switch");
    switchButton.focus();
    await user.keyboard(" ");

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("handles keyboard navigation with enter key", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Switch onChange={handleChange} />);

    const switchButton = screen.getByRole("switch");
    switchButton.focus();
    await user.keyboard("{Enter}");

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("prevents default behavior for space and enter keys", async () => {
    const user = userEvent.setup();

    const handleChange = jest.fn();
    render(<Switch onChange={handleChange} />);

    const switchButton = screen.getByRole("switch");
    switchButton.focus();

    await user.keyboard(" ");
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.keyboard("{Enter}");
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  describe("Id Handling", () => {
    it("generates a unique id if none is provided", () => {
      render(<Switch />);

      const switchButton = screen.getByRole("switch");
      expect(switchButton).toHaveAttribute("id");
    });

    it("uses provided id", () => {
      render(<Switch id="custom-id" />);

      const switchButton = screen.getByRole("switch");
      expect(switchButton).toHaveAttribute("id", "custom-id");
    });

    it("multiple switches without id have unique ids", () => {
      render(
        <>
          <Switch />
          <Switch />
        </>,
      );

      const switches = screen.getAllByRole("switch");
      expect(switches[0].id).not.toBe(switches[1].id);
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("works as controlled component", async () => {
      const user = userEvent.setup();

      const handleChange = jest.fn();
      const { rerender } = render(
        <Switch checked={false} onChange={handleChange} />,
      );

      const switchButton = screen.getByRole("switch");
      expect(switchButton).toHaveAttribute("aria-checked", "false");

      await user.click(switchButton);

      expect(handleChange).toHaveBeenCalledWith(true);
      expect(switchButton).toHaveAttribute("aria-checked", "false");

      rerender(<Switch checked={true} onChange={handleChange} />);
      expect(switchButton).toHaveAttribute("aria-checked", "true");
    });

    it("works as uncontrolled component", async () => {
      const user = userEvent.setup();

      const handleChange = jest.fn();
      render(<Switch defaultChecked={false} onChange={handleChange} />);

      const switchButton = screen.getByRole("switch");
      expect(switchButton).toHaveAttribute("aria-checked", "false");

      await user.click(switchButton);

      expect(handleChange).toHaveBeenCalledWith(true);
      expect(switchButton).toHaveAttribute("aria-checked", "true");
    });

    it("prioritizes controlled state over defaultChecked", () => {
      render(<Switch checked={false} defaultChecked={true} />);

      const switchButton = screen.getByRole("switch");
      expect(switchButton).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("Accessibility", () => {
    it("has correct role and aria attributes", () => {
      render(<Switch />);

      const switchButton = screen.getByRole("switch");
      expect(switchButton).toHaveAttribute("role", "switch");
      expect(switchButton).toHaveAttribute("aria-checked", "false");
      expect(switchButton).toHaveAttribute("aria-disabled", "false");
    });

    it("sets aria-disabled when disabled", () => {
      render(<Switch disabled />);

      const switchButton = screen.getByRole("switch");
      expect(switchButton).toHaveAttribute("aria-disabled", "true");
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();

      const handleChange = jest.fn();
      render(<Switch onChange={handleChange} />);

      const switchButton = screen.getByRole("switch");
      switchButton.focus();
      expect(switchButton).toHaveFocus();

      await user.keyboard(" ");
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("maintains focus after keyboard interaction", async () => {
      const user = userEvent.setup();

      render(<Switch />);

      const switchButton = screen.getByRole("switch");
      switchButton.focus();
      await user.keyboard(" ");

      expect(switchButton).toHaveFocus();
    });
  });
});
