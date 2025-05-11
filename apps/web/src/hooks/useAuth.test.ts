import { createRandomAuthenticatedUser } from "$/__tests__/factories";
import { spyConsole } from "$/__tests__/helpers";
import { useAuth } from "$/hooks/useAuth";
import { storeAccessToken } from "$/lib/auth/client";
import { apiClient } from "$/services/apiClient";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

jest.mock("$/services/apiClient");
jest.mock("$/lib/auth/client");

const mockApiClient = jest.mocked(apiClient);
const mockStoreAccessToken = jest.mocked(storeAccessToken);

describe("useAuth", () => {
  const mockAccessToken = "this-is-an-access-token";
  const mockUser = createRandomAuthenticatedUser();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("updates the auth state correctly when login is called", async () => {
    const { result } = renderHook(() => useAuth());

    const loginData = {
      accessToken: mockAccessToken,
      user: mockUser,
    };

    await act(async () => {
      await result.current.login(loginData);
    });

    expect(mockStoreAccessToken).toHaveBeenCalledWith(mockAccessToken);
  });

  it("clears the auth state and calls the API when logout is called", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockApiClient.post).toHaveBeenCalledWith("/auth/logout");
    expect(mockStoreAccessToken).toHaveBeenCalledWith(null);
  });

  it("clears the auth state even if the logout API call fails", async () => {
    const networkError = new Error("Network failed");
    const consoleErrorSpy = spyConsole("error", [networkError]);
    mockApiClient.post.mockRejectedValue(networkError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockStoreAccessToken).toHaveBeenCalledWith(null);
    expect(consoleErrorSpy).toHaveBeenCalledWith(networkError);
  });
});
