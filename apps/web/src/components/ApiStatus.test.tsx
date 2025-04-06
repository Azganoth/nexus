import { ApiStatus } from "@components/ApiStatus";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";

describe("ApiStatus", () => {
  it("displays API status correctly", async () => {
    jest.spyOn(window, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      } as Response),
    );

    render(<ApiStatus />);

    expect(screen.getByText("🔄 Checking...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("api-status")).toHaveTextContent(/Healthy/);
    });
  });
});
