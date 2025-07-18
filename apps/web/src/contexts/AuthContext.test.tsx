import { createRandomAuthenticatedUser } from "$/__tests__/factories";
import { AuthProvider, useAuth } from "$/contexts/AuthContext";
import { apiClient } from "$/lib/apiClient";
import { storeAccessToken } from "$/lib/auth/client";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { spyConsole } from "@repo/shared/testUtils";
import { act, renderHook } from "@testing-library/react";
import React from "react";

jest.mock("$/lib/apiClient");
jest.mock("$/lib/auth/client");

const mockApiClient = jest.mocked(apiClient);
const mockStoreAccessToken = jest.mocked(storeAccessToken);

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

describe("AuthContext/useAuth", () => {
  const mockAccessToken = "this-is-an-access-token";
  const mockUser = createRandomAuthenticatedUser();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("updates the auth state correctly when login is called", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

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
    const { result } = renderHook(() => useAuth(), { wrapper });

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

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockStoreAccessToken).toHaveBeenCalledWith(null);
    expect(consoleErrorSpy).toHaveBeenCalledWith(networkError);
  });
});
