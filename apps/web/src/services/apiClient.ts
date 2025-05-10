import { getAccessToken, storeAccessToken } from "$/lib/auth/client";
import { API_URL, IS_SERVER } from "$/lib/constants";
import { ApiError, ValidationError } from "$/services/errors";
import type {
  ApiResponse,
  AuthPayload,
  ErrorResponse,
  SuccessResponse,
} from "@repo/shared/contracts";

const processPayload = <T>(payload: ApiResponse<T>) => {
  if (payload.status === "success") {
    return payload.data;
  }

  if (payload.status === "fail") {
    throw new ValidationError(payload.data);
  }

  throw new ApiError(payload.code, payload.message);
};

// This shared promise acts as a lock to prevent multiple, simultaneous token refresh requests.
let browserRefreshResponse: Promise<
  SuccessResponse<AuthPayload> | ErrorResponse
> | null = null;
const browserRefreshIgnore = ["/auth/refresh", "/auth/login", "/auth/signup"];

const browserFetch = async <T>(endpoint: string, options: RequestInit) => {
  const headers = new Headers(options.headers || {});
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204 || response.status === 304) {
    return undefined as T;
  }

  let body = (await response.json()) as ApiResponse<T>;
  if (
    response.status === 401 &&
    !browserRefreshIgnore.includes(endpoint) &&
    body.status === "error" &&
    (body.code === "ACCESS_TOKEN_INVALID" || body.code === "NOT_LOGGED_IN")
  ) {
    // Ensure that only the first API call to fail will trigger the network request.
    if (!browserRefreshResponse) {
      browserRefreshResponse = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
        .then((res) => res.json())
        .finally(() => {
          browserRefreshResponse = null;
        });
    }

    const refreshBody = await browserRefreshResponse;
    if (refreshBody.status === "success") {
      const { accessToken } = refreshBody.data;
      if (!IS_SERVER) {
        storeAccessToken(accessToken);
      }

      // Retry original request with the new access token.
      headers.set("Authorization", `Bearer ${accessToken}`);
      const retryResponse = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      body = await retryResponse.json();
    } else {
      body = refreshBody;
    }
  }

  return processPayload<T>(body);
};

const serverFetch = async <T>(endpoint: string, options: RequestInit) => {
  const headers = new Headers(options.headers || {});
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (response.status === 204 || response.status === 304) {
    return undefined as T;
  }

  return processPayload<T>(await response.json());
};

type ApiClientOptions = Omit<RequestInit, "method" | "body">;

const baseFetch = IS_SERVER ? serverFetch : browserFetch;
export const apiClient = {
  get: <T>(url: string, options?: ApiClientOptions) =>
    baseFetch<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    baseFetch<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    baseFetch<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    baseFetch<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    baseFetch<T>(url, {
      ...options,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    }),

  raw: baseFetch,
};
