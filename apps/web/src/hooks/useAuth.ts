import { apiClient } from "$/lib/apiClient";
import { storeAccessToken } from "$/lib/auth/client";
import type { Session } from "@repo/shared/contracts";
import { useState } from "react";
import { useUser } from "./useUser";

export function useAuth() {
  const { user, revalidateUser } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const login = async (session: Session) => {
    setIsAuthenticating(true);
    try {
      storeAccessToken(session.accessToken);
      await revalidateUser(); // Re-fetch user data
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setIsAuthenticating(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // The important part is ensuring the user intent happens client-side.
      console.error(error);
    } finally {
      storeAccessToken(null);
      await revalidateUser(); // Clear user data
      setIsAuthenticating(false);
    }
  };

  return {
    user,
    isAuthenticating,
    login,
    logout,
  };
}
