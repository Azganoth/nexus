import { getAccessToken, storeAccessToken } from "$/lib/auth/token";
import { ApiError, ValidationError } from "$/lib/errors";
import type { ApiResponse, AuthPayload } from "@repo/shared/contracts";

// This shared promise acts as a lock to prevent multiple, simultaneous token refresh requests.
let refreshResponse: Promise<ApiResponse<AuthPayload>> | null = null;

export async function fetchApi<T>(
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

  if (response.status === 204) {
    return undefined as T;
  }

  let body: ApiResponse<T> = await response.json();
  if (
    response.status === 401 &&
    body.status === "error" &&
    body.code === "ACCESS_TOKEN_INVALID" &&
    endpoint !== "/auth/refresh"
  ) {
    try {
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
      }
    } catch (error) {
      console.error("Error during token refresh:", error);
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
