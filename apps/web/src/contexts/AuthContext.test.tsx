import { createTestPublicUser } from "$/__tests__/factories";
import { spyConsole } from "$/__tests__/helpers";
import { AuthProvider, useAuth } from "$/contexts/AuthContext";
import { getAccessToken, storeAccessToken } from "$/lib/auth/client";
import { fetchApi } from "$/services/apiClient";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("$/lib/api");
jest.mock("$/lib/auth/token");

const mockFetchApi = jest.mocked(fetchApi);
const mockStoreAccessToken = jest.mocked(storeAccessToken);
const mockGetAccessToken = jest.mocked(getAccessToken);

describe("AuthContext", () => {
  const mockAccessToken = "this-is-an-access-token";
  const mockUser = createTestPublicUser();

  const renderAuthHook = () => {
    return renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should initially be in an authenticating state with no user", () => {
    // Ignore 'act' warning
    spyConsole("error", "any");

    const { result } = renderAuthHook();

    expect(result.current.isAuthenticating).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("should authenticate the user on initial load if the refresh token is valid", async () => {
    mockGetAccessToken.mockReturnValue(mockAccessToken);
    // @ts-expect-error Fetch api uses generics.
    mockFetchApi.mockImplementation(() => ({
      accessToken: mockAccessToken,
      user: mockUser,
    }));

    const { result } = renderAuthHook();

    await waitFor(() => expect(result.current.isAuthenticating).toBe(false));

    expect(result.current.user).toEqual(mockUser);
    expect(mockStoreAccessToken).toHaveBeenCalledWith(mockAccessToken);
  });

  it("should remain logged out if the refresh token is invalid", async () => {
    const { result } = renderAuthHook();

    await waitFor(() => expect(result.current.isAuthenticating).toBe(false));

    expect(result.current.user).toBeNull();
  });

  it("should update the auth state correctly when login is called", async () => {
    const { result } = renderAuthHook();

    await waitFor(() => expect(result.current.isAuthenticating).toBe(false));

    const loginData = {
      accessToken: mockAccessToken,
      user: mockUser,
    };

    act(() => {
      result.current.login(loginData);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(mockStoreAccessToken).toHaveBeenCalledWith(mockAccessToken);
  });

  it("should clear the auth state and call the API when logout is called", async () => {
    const { result } = renderAuthHook();

    act(() => {
      result.current.login({ accessToken: mockAccessToken, user: mockUser });
    });

    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchApi).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
    expect(result.current.user).toBeNull();
    expect(mockStoreAccessToken).toHaveBeenCalledWith(null);
  });

  it("should clear the auth state even if the logout API call fails", async () => {
    const networkError = new Error("Network failed");
    const consoleErrorSpy = spyConsole("error", [networkError]);
    mockFetchApi.mockRejectedValue(networkError);
    const { result } = renderAuthHook();

    act(() => {
      result.current.login({ accessToken: mockAccessToken, user: mockUser });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(mockStoreAccessToken).toHaveBeenCalledWith(null);
    expect(consoleErrorSpy).toHaveBeenCalledWith(networkError);
  });

  it("should throw an error if useAuth is used outside of AuthProvider", () => {
    const consoleErrorSpy = spyConsole("error", "any");

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow(/useAuth must be used within an AuthProvider/);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
