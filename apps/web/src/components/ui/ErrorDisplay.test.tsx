import { ErrorDisplay } from "$/components/ui/ErrorDisplay";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("ErrorDisplay", () => {
  it("renders the error message", () => {
    const title = "Um erro ocorreu";
    render(<ErrorDisplay title={title} />);

    const titleElement = screen.getByRole("heading", {
      name: title,
    });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass("text-xl");

    expect(screen.queryByText(/alguma mensagem/i)).not.toBeInTheDocument();
  });

  it("renders nothing when no error is provided", () => {
    const title = "Um erro ocorreu";
    render(<ErrorDisplay title={title} />);

    const titleElement = screen.getByRole("heading", {
      name: title,
    });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass("text-xl");

    expect(screen.queryByText(/alguma mensagem/i)).not.toBeInTheDocument();
  });

  it("applies custom class names", () => {
    const title = "Um erro ocorreu";
    render(<ErrorDisplay title={title} />);

    const titleElement = screen.getByRole("heading", {
      name: title,
    });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass("text-xl");

    expect(screen.queryByText(/alguma mensagem/i)).not.toBeInTheDocument();
  });

  it("renders both title and message when both are provided", () => {
    const title = "Not Found";
    const message = "This page does not exist.";
    render(<ErrorDisplay title={title} message={message} />);

    const titleElement = screen.getByRole("heading", { name: title });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass("text-3xl");

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("renders a link to go back to the initial page", () => {
    render(<ErrorDisplay title="Error" />);

    const link = screen.getByRole("link", { name: /voltar a página inicial/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
