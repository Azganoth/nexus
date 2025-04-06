import { Visitors } from "@components/Visitors";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";

describe("Visitors", () => {
  it("displays visitor count correctly", async () => {
    jest.spyOn(window, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ visits: 42 }),
      } as Response),
    );

    render(<Visitors />);

    expect(screen.getByText(/visitors!/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("42 visitors!")).toBeInTheDocument();
    });

    expect(window.fetch).toHaveBeenCalledWith("/api/visit", {
      method: "POST",
    });
  });
});
