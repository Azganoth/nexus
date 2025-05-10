"use client";

import { storeAccessToken } from "$/lib/auth/client";
import { apiClient } from "$/services/apiClient";
import type { AuthPayload, PublicUser } from "@repo/shared/contracts";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AuthContextType {
  user: PublicUser | null;
  isAuthenticating: boolean;
  login: (data: AuthPayload) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: PublicUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState(initialUser ?? null);
  const [isAuthenticating, setIsAuthenticating] = useState(!initialUser);

  useEffect(() => {
    if (initialUser) {
      return;
    }

    // Try a silent refresh to log the user.
    const initializeAuth = async () => {
      try {
        const { accessToken, user } =
          await apiClient.post<AuthPayload>("/auth/refresh");
        storeAccessToken(accessToken);
        setUser(user);
      } catch {
        // This is not an error, it just means the user isn't logged in (no valid refresh token cookie).
      } finally {
        setIsAuthenticating(false);
      }
    };

    initializeAuth();
  }, [initialUser]);

  const login = ({ accessToken, user }: AuthPayload) => {
    storeAccessToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // The important part is ensuring the user intent happens client-side.
      console.error(error);
    } finally {
      setUser(null);
      storeAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticating, login, logout }}>
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
