import { createTestPublicUser } from "$/__tests__/factories";
import { spyConsole } from "$/__tests__/helpers";
import { AuthProvider, useAuth } from "$/contexts/AuthContext";
import { fetchApi } from "$/lib/api";
import { getAccessToken, storeAccessToken } from "$/lib/token";
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
jest.mock("$/lib/token");

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
    expect(result.current.auth).toBeNull();
  });

  it("should authenticate the user on initial load if the refresh token is valid", async () => {
    mockGetAccessToken.mockReturnValue(mockAccessToken);
    // @ts-expect-error Fetch api uses generics.
    mockFetchApi.mockImplementation((url: string) => {
      if (url.endsWith("/auth/refresh")) {
        return Promise.resolve({ accessToken: mockAccessToken });
      }
      if (url.endsWith("/users/me")) {
        return Promise.resolve(mockUser);
      }
      return Promise.reject(new Error("Unhandled API call"));
    });

    const { result } = renderAuthHook();

    await waitFor(() => expect(result.current.isAuthenticating).toBe(false));

    expect(result.current.auth).not.toBeNull();
    expect(result.current.auth?.user).toEqual(mockUser);
    expect(result.current.auth?.accessToken).toBe(mockAccessToken);
    expect(mockStoreAccessToken).toHaveBeenCalledWith(mockAccessToken);
  });

  it("should remain logged out if the refresh token is invalid", async () => {
    const { result } = renderAuthHook();

    await waitFor(() => expect(result.current.isAuthenticating).toBe(false));

    expect(result.current.auth).toBeNull();
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

    expect(result.current.auth?.accessToken).toBe(mockAccessToken);
    expect(result.current.auth?.user).toEqual(mockUser);
    expect(mockStoreAccessToken).toHaveBeenCalledWith(mockAccessToken);
  });

  it("should clear the auth state and call the API when logout is called", async () => {
    const { result } = renderAuthHook();

    act(() => {
      result.current.login({ accessToken: mockAccessToken, user: mockUser });
    });

    expect(result.current.auth).not.toBeNull();

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchApi).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
    expect(result.current.auth).toBeNull();
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

    expect(result.current.auth).toBeNull();
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
