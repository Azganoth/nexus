import { LoadingButton } from "$/components/ui/LoadingButton";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("LoadingButton", () => {
  const user = userEvent.setup();

  it("should render children and be enabled by default", () => {
    render(<LoadingButton>Click Me</LoadingButton>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("should call the onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    render(<LoadingButton onClick={handleClick}>Submit</LoadingButton>);

    const button = screen.getByRole("button", { name: /submit/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe("Pending State", () => {
    it("should display a spinner and not the children when isPending is true", () => {
      render(<LoadingButton isPending>Submitting...</LoadingButton>);

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
        <LoadingButton isPending onClick={handleClick}>
          Click
        </LoadingButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when the disabled prop is true", () => {
      render(<LoadingButton disabled>Disabled</LoadingButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should be disabled if either isPending or disabled is true", () => {
      const { rerender } = render(
        <LoadingButton isPending disabled={false}>
          Test
        </LoadingButton>,
      );
      expect(screen.getByRole("button")).toBeDisabled();

      rerender(
        <LoadingButton isPending={false} disabled>
          Test
        </LoadingButton>,
      );
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("should merge custom class names correctly", () => {
    const customClass = "my-special-button";
    render(
      <LoadingButton className={customClass}>Styled Button</LoadingButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn", customClass);
  });
});
