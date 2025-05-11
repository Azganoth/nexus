import { Modal } from "$/components/ui/Modal";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

function renderModal(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  const defaultProps = {
    title: "Test Modal",
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal Content</div>,
  };
  return render(<Modal {...defaultProps} {...props} />);
}

describe("Modal", () => {
  it("renders with title and children", () => {
    renderModal();

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("renders dialog with correct role and aria attributes", () => {
    renderModal();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();

    const onClose = jest.fn();
    renderModal({ onClose });
    const closeButton = screen.getByRole("button", { name: /fechar/i });

    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking the backdrop", async () => {
    const user = userEvent.setup();

    const onClose = jest.fn();
    renderModal({ onClose });
    const dialog = screen.getByRole("dialog");

    await user.click(dialog);

    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when clicking inside modal content", async () => {
    const user = userEvent.setup();

    const onClose = jest.fn();
    renderModal({ onClose });
    const content = screen.getByText("Modal Content");

    await user.click(content);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders with a unique title and description id", () => {
    renderModal();

    const dialog = screen.getByRole("dialog");
    const labelledby = dialog.getAttribute("aria-labelledby");
    const describedby = dialog.getAttribute("aria-describedby");
    expect(labelledby).toBeTruthy();
    expect(describedby).toBeTruthy();
    expect(screen.getByText("Test Modal")).toHaveAttribute("id", labelledby!);
    expect(screen.getByText("Modal Content").parentElement).toHaveAttribute(
      "id",
      describedby!,
    );
  });
});
