import { Button } from "$/components/ui/Button";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("Button", () => {
  const user = userEvent.setup();

  it("renders children and is enabled by default", () => {
    render(<Button>Click Me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("calls the onClick handler when clicked", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    const button = screen.getByRole("button", { name: /submit/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe("Pending State", () => {
    it("displays a spinner and not the children when isPending is true", () => {
      render(<Button isLoading>Submitting...</Button>);

      expect(screen.queryByText("Submitting...")).not.toBeInTheDocument();

      const button = screen.getByRole("button");
      const spinner = button.querySelector(
        ".icon-\\[svg-spinners--180-ring\\]",
      );
      expect(spinner).toBeInTheDocument();
    });

    it("is disabled when isPending is true", async () => {
      const handleClick = jest.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Click
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("is disabled when the disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("is disabled if either isPending or disabled is true", () => {
      const { rerender } = render(
        <Button isLoading disabled={false}>
          Test
        </Button>,
      );
      expect(screen.getByRole("button")).toBeDisabled();

      rerender(
        <Button isLoading={false} disabled>
          Test
        </Button>,
      );
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("merges custom class names correctly", () => {
    const customClass = "my-special-button";
    render(<Button className={customClass}>Styled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn", customClass);
  });
});
