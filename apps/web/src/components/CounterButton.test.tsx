import { CounterButton } from "@components/CounterButton";
import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

describe("CounterButton", () => {
  it("increments count on click", () => {
    render(<CounterButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Clicks: 0");

    fireEvent.click(button);
    expect(button).toHaveTextContent("Clicks: 1");
  });
});
