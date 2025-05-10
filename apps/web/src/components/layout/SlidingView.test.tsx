import { SlidingView } from "$/components/layout/SlidingView";
import { describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { act } from "react";

Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
  configurable: true,
  value: 500,
});

describe("SlidingView", () => {
  const views = {
    view1: (
      <div>
        <h1>View 1</h1>
        <input type="text" placeholder="Input 1" />
      </div>
    ),
    view2: (
      <div>
        <h2>View 2</h2>
        <button>Button 2</button>
      </div>
    ),
    view3: <div>View 3</div>,
  };

  it("renders all views but only shows the current one", () => {
    render(<SlidingView views={views} currentView="view1" />);

    const view1 = screen.getByTestId("view-1");
    const view2 = screen.getByTestId("view-2");
    const view3 = screen.getByTestId("view-3");

    expect(view1).not.toHaveClass("opacity-0");
    expect(view1).not.toHaveAttribute("inert");

    expect(view2).toHaveClass("opacity-0");
    expect(view2).toHaveAttribute("inert");

    expect(view3).toHaveClass("opacity-0");
    expect(view3).toHaveAttribute("inert");
  });

  it("switches the active view when currentView prop changes", () => {
    const { rerender } = render(
      <SlidingView views={views} currentView="view1" />,
    );

    const view1 = screen.getByTestId("view-1");
    const view2 = screen.getByTestId("view-2");

    expect(view1).not.toHaveAttribute("inert");
    expect(view2).toHaveAttribute("inert");

    rerender(<SlidingView views={views} currentView="view2" />);

    expect(view1).toHaveAttribute("inert");
    expect(view2).not.toHaveAttribute("inert");
  });

  it("auto-focuses the first focusable element in the new view if autoFocus is true", async () => {
    const { rerender } = render(
      <SlidingView views={views} currentView="view1" autoFocus />,
    );

    const input1 = screen.getByPlaceholderText("Input 1");
    await waitFor(() => expect(input1).toHaveFocus());

    rerender(<SlidingView views={views} currentView="view2" autoFocus />);

    const button2 = screen.getByRole("button", { name: "Button 2" });
    await waitFor(() => expect(button2).toHaveFocus());
  });

  it("should not auto-focus if autoFocus prop is not set", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SlidingView views={views} currentView="view1" />,
    );

    await act(async () => {
      await user.click(document.body);
    });
    expect(document.body).toHaveFocus();

    rerender(<SlidingView views={views} currentView="view2" />);

    const button2 = screen.getByRole("button", { name: "Button 2" });
    expect(button2).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });
});
