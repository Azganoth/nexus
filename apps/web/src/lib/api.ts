import { getAccessToken, storeAccessToken } from "$/lib/auth/token";
import { ApiError, ValidationError } from "$/lib/errors";
import type { ApiResponse, AuthPayload } from "@repo/shared/contracts";

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let retries = 0;

  const attemptFetchApi = async (): Promise<T> => {
    const token = getAccessToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (options.body) {
      headers.set("Content-Type", "application/json");
    }

    try {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      if (response.status === 204) {
        return undefined as T;
      }

      const body: ApiResponse<T> = await response.json();

      if (body.status === "success") {
        return body.data;
      }

      if (body.status === "fail") {
        throw new ValidationError(body.data);
      }

      throw new ApiError(body.code, body.message);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "ACCESS_TOKEN_INVALID" &&
        retries < 1
      ) {
        retries++;

        try {
          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });

          const refreshBody: ApiResponse<AuthPayload> =
            await refreshResponse.json();

          if (refreshBody.status === "success") {
            storeAccessToken(refreshBody.data.accessToken);
            return attemptFetchApi();
          }
        } catch {
          // Fall through and throw the original error.
        }
      }

      throw error;
    }
  };

  return attemptFetchApi();
}
