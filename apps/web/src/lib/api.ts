import { API_URL } from "$/lib/constants";
import { HttpError } from "$/lib/errors";
import { getAccessToken, storeAccessToken } from "$/lib/token";
import type { AccessTokenPayload, ApiResponse } from "@repo/shared/contracts";

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
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      const body: ApiResponse<T> = await response.json();

      if (body.status === "success") {
        return body.data;
      }

      throw new HttpError(body);
    } catch (error) {
      if (
        error instanceof HttpError &&
        error.payload.status === "error" &&
        error.payload.code === "ACCESS_TOKEN_INVALID" &&
        retries < 1
      ) {
        retries++;

        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          const refreshBody: ApiResponse<AccessTokenPayload> =
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

// Profile
export interface Profile {
  name: string;
  avatarUrl: string;
  bio?: string;
  links: { title: string; url: string }[];
  seoTitle?: string;
  seoDescription?: string;
}

export const getProfile = async (username: string): Promise<Profile> => {
  console.log("profile:", { username });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (username) {
        case "isa":
          resolve({
            name: "Isa Silveira",
            avatarUrl: "",
            bio: "Designer multidisciplinar com paixão por ilustração digital e branding. Transformando ideias em identidades visuais. Trabalho freelance aberto!",
            links: [
              {
                title: "Portfólio Behance",
                url: "https://behance.net/isa.silveira",
              },
              { title: "Instagram", url: "https://instagram.com/isa.design" },
              { title: "Website", url: "http://isasilveira.com.br" },
            ],
          });
          break;
        case "private":
          reject(new Error("Private"));
          break;
        default:
          reject(new Error("Missing"));
          break;
      }
    }, 2500);
  });
};
