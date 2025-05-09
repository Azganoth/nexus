import { API_URL } from "$/lib/constants";
import type { AuthPayload } from "@repo/shared/contracts";
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

  return (await response.json()).data as AuthPayload;
});
