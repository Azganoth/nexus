import { getAccessToken, storeAccessToken } from "$/lib/auth/client";
import { ApiError, ValidationError } from "$/services/errors";
import type {
  ApiResponse,
  AuthPayload,
  ErrorResponse,
  SuccessResponse,
} from "@repo/shared/contracts";

// This shared promise acts as a lock to prevent multiple, simultaneous token refresh requests.
let refreshResponse: Promise<
  SuccessResponse<AuthPayload> | ErrorResponse
> | null = null;

async function baseFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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
    endpoint !== "/auth/refresh" &&
    body.status === "error" &&
    body.code === "ACCESS_TOKEN_INVALID"
  ) {
    // Ensure that only the first API call to fail will trigger the network request.
    if (!refreshResponse) {
      refreshResponse = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
        .then((res) => res.json())
        .finally(() => {
          refreshResponse = null;
        });
    }

    const refreshBody = await refreshResponse;
    if (refreshBody.status === "success") {
      const newAccessToken = refreshBody.data.accessToken;
      storeAccessToken(newAccessToken);

      // Retry original request with the new access token.
      headers.set("Authorization", `Bearer ${newAccessToken}`);
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

  if (body.status === "success") {
    return body.data;
  }

  if (body.status === "fail") {
    throw new ValidationError(body.data);
  }

  throw new ApiError(body.code, body.message);
}

type ApiClientOptions = Omit<RequestInit, "method" | "body">;

export const apiClient = {
  get<T>(url: string, options?: ApiClientOptions) {
    return baseFetch<T>(url, { ...options, method: "GET" });
  },

  post<T>(url: string, body?: unknown, options?: ApiClientOptions) {
    return baseFetch<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown, options?: ApiClientOptions) {
    return baseFetch<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(url: string, body?: unknown, options?: ApiClientOptions) {
    return baseFetch<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string, body?: unknown, options?: ApiClientOptions) {
    return baseFetch<T>(url, {
      ...options,
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  raw: baseFetch,
};
