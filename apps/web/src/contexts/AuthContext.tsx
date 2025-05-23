"use client";

import { useUser } from "$//hooks/useUser";
import { apiClient } from "$//lib/apiClient";
import { storeAccessToken } from "$//lib/auth/client";
import type { AuthenticatedUser, Session } from "@repo/shared/contracts";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  user: AuthenticatedUser | undefined;
  isAuthenticating: boolean;
  login: (session: Session) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading, revalidateUser } = useUser();

  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    setIsAuthenticating(isUserLoading);
  }, [isUserLoading]);

  const login = async (session: Session) => {
    setIsAuthenticating(true);
    try {
      storeAccessToken(session.accessToken);
      await revalidateUser();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setIsAuthenticating(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      storeAccessToken(null);
      setIsAuthenticating(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticating,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
