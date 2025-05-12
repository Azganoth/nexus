import { createRandomAuthenticatedUser } from "$/__tests__/factories";
import { renderHookWithSWR } from "$/__tests__/helpers";
import { useUser } from "$/hooks/useUser";
import { apiClient } from "$/services/apiClient";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, waitFor } from "@testing-library/react";

jest.mock("$/services/apiClient");

const mockApiClient = jest.mocked(apiClient);

describe("useUser", () => {
  const mockUser = createRandomAuthenticatedUser();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("fetches user data successfully", async () => {
    mockApiClient.get.mockResolvedValue(mockUser);

    const { result } = renderHookWithSWR(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith("/users/me");
    expect(result.current.isUserLoading).toBe(false);
    expect(result.current.userError).toBeUndefined();
  });

  it("handles loading state correctly", () => {
    mockApiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHookWithSWR(() => useUser());

    expect(result.current.isUserLoading).toBe(true);
    expect(result.current.user).toBeUndefined();
  });

  it("handles error state correctly", async () => {
    const error = new Error("Failed to fetch user");
    mockApiClient.get.mockRejectedValue(error);

    const { result } = renderHookWithSWR(() => useUser());

    await waitFor(() => {
      expect(result.current.userError).toBeDefined();
    });

    expect(result.current.user).toBeUndefined();
    expect(result.current.isUserLoading).toBe(false);
  });

  it("updates user data successfully", async () => {
    const updatedUser = { ...mockUser, name: "Updated Name" };
    mockApiClient.get.mockResolvedValue(mockUser);
    mockApiClient.patch.mockResolvedValue(updatedUser);

    const { result } = renderHookWithSWR(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.updateUser({ name: "Updated Name" });
    });

    expect(mockApiClient.patch).toHaveBeenCalledWith("/users/me", {
      name: "Updated Name",
    });
  });

  it("does not update if no user data exists", async () => {
    mockApiClient.get.mockResolvedValue(undefined);

    const { result } = renderHookWithSWR(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toBeUndefined();
    });

    await act(async () => {
      await result.current.updateUser({ name: "Updated Name" });
    });

    expect(mockApiClient.patch).not.toHaveBeenCalled();
  });

  it("handles update errors gracefully", async () => {
    const error = new Error("Update failed");
    mockApiClient.get.mockResolvedValue(mockUser);
    mockApiClient.patch.mockRejectedValue(error);

    const { result } = renderHookWithSWR(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await expect(
      act(async () => {
        await result.current.updateUser({ name: "Updated Name" });
      }),
    ).rejects.toThrow("Update failed");
  });

  it("revalidates user data when called", async () => {
    mockApiClient.get.mockResolvedValue(mockUser);

    const { result } = renderHookWithSWR(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Clear the mock to verify revalidation
    mockApiClient.get.mockClear();

    await act(async () => {
      await result.current.revalidateUser();
    });

    expect(mockApiClient.get).toHaveBeenCalledWith("/users/me");
  });

  it("returns correct initial state", () => {
    mockApiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHookWithSWR(() => useUser());

    expect(result.current.user).toBeUndefined();
    expect(result.current.isUserLoading).toBe(true);
    expect(result.current.userError).toBeUndefined();
    expect(typeof result.current.updateUser).toBe("function");
    expect(typeof result.current.revalidateUser).toBe("function");
  });
});
