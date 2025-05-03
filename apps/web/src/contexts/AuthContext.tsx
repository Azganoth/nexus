"use client";

import { fetchApi } from "$/lib/api";
import { getAccessToken, storeAccessToken } from "$/lib/token";
import type { AuthPayload, PublicUser } from "@repo/shared/contracts";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthenticatedState {
  accessToken: string;
  user: PublicUser;
}

export interface AuthContextType {
  auth: AuthenticatedState | null;
  isAuthenticating: boolean;
  login: (data: AuthPayload) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthenticatedState | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const user = await fetchApi<PublicUser>("/users/me");
      const accessToken = getAccessToken();
      if (user && accessToken) {
        setAuth({ user, accessToken });
      }
    } catch {
      setAuth(null);
      storeAccessToken(null);
    }
  }, []);

  // On initial app load, try a silent refresh to log the user in
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { accessToken } = await fetchApi<AuthPayload>("/auth/refresh", {
          method: "POST",
        });
        storeAccessToken(accessToken);
        await fetchUser();
      } catch {
        // This is not an error, it just means the user isn't logged in (no valid refresh token cookie).
      } finally {
        setIsAuthenticating(false);
      }
    };

    initializeAuth();
  }, [fetchUser]);

  const login = ({ accessToken, user }: AuthPayload) => {
    storeAccessToken(accessToken);
    setAuth({ accessToken, user });
  };

  const logout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch (error) {
      // The important part is ensuring the user intent happens client-side.
      console.error(error);
    } finally {
      setAuth(null);
      storeAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, isAuthenticating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
