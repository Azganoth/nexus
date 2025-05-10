import { API_URL } from "$/lib/constants";
import type { ApiResponse, Session } from "@repo/shared/contracts";
import { cookies } from "next/headers";
import { cache } from "react";

export const getAuth = cache(async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/session`, {
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
    },
  });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<Session>;
  if (payload.status !== "success") {
    return null;
  }

  return payload.data;
});
