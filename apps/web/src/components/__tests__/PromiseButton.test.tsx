import { PromiseButton } from "$/components/PromiseButton";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("PromiseButton", () => {
  const user = userEvent.setup();

  it("should render children and be enabled by default", () => {
    render(<PromiseButton>Click Me</PromiseButton>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("should call the onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    render(<PromiseButton onClick={handleClick}>Submit</PromiseButton>);

    const button = screen.getByRole("button", { name: /submit/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe("Pending State", () => {
    it("should display a spinner and not the children when isPending is true", () => {
      render(<PromiseButton isPending>Submitting...</PromiseButton>);

      expect(screen.queryByText("Submitting...")).not.toBeInTheDocument();

      const button = screen.getByRole("button");
      const spinner = button.querySelector(
        ".icon-\\[svg-spinners--180-ring\\]",
      );
      expect(spinner).toBeInTheDocument();
    });

    it("should be disabled when isPending is true", async () => {
      const handleClick = jest.fn();
      render(
        <PromiseButton isPending onClick={handleClick}>
          Click
        </PromiseButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when the disabled prop is true", () => {
      render(<PromiseButton disabled>Disabled</PromiseButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should be disabled if either isPending or disabled is true", () => {
      const { rerender } = render(
        <PromiseButton isPending disabled={false}>
          Test
        </PromiseButton>,
      );
      expect(screen.getByRole("button")).toBeDisabled();

      rerender(
        <PromiseButton isPending={false} disabled>
          Test
        </PromiseButton>,
      );
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("should merge custom class names correctly", () => {
    const customClass = "my-special-button";
    render(
      <PromiseButton className={customClass}>Styled Button</PromiseButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn", customClass);
  });
});
