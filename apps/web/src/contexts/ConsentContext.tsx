"use client";

import { useAuth } from "$/contexts/AuthContext";
import { apiClient } from "$/lib/apiClient";
import {
  clearStoredConsents,
  DEFAULT_COOKIE_CONSENT_STATUS,
  getStoredConsents,
  setStoredConsents,
  type LocalConsentStatus,
} from "$/lib/consent";
import type { ConsentStatus } from "@repo/shared/contracts";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ConsentContextValue {
  consents: LocalConsentStatus | undefined;
  isLoading: boolean;
  updateConsents: (updates: Partial<LocalConsentStatus>) => Promise<void>;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(
  undefined,
);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticating } = useAuth();

  const [consents, setConsents] =
    useState<ConsentContextValue["consents"]>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const updateConsents = useCallback<ConsentContextValue["updateConsents"]>(
    async (updates) => {
      const currentConsents = consents || DEFAULT_COOKIE_CONSENT_STATUS;
      const updatedConsents = { ...currentConsents, ...updates };

      try {
        if (user) {
          // Send only the updated cookie consents to API
          const consentLogs = Object.entries(updates).map(
            ([type, granted]) => ({ type, granted }),
          );

          if (consentLogs.length === 1) {
            await apiClient.post("/consents/log", consentLogs[0]);
          } else {
            await apiClient.post("/consents/log/batch", consentLogs);
          }
          clearStoredConsents();
        } else {
          setStoredConsents(updatedConsents);
        }
      } catch (error) {
        console.error("Failed to update consents:", error);
      }

      setConsents(updatedConsents);
    },
    [consents, user],
  );

  const updateConsentsRef = useRef(updateConsents);
  updateConsentsRef.current = updateConsents;

  useEffect(() => {
    if (isAuthenticating) {
      return;
    }

    const fetchConsents = async () => {
      if (user) {
        try {
          const { NECESSARY_COOKIES, ANALYTICS_COOKIES, THIRD_PARTY_COOKIES } =
            await apiClient.get<ConsentStatus>("/consents/status");

          // If user has made a decision (NECESSARY_COOKIES is true), use server data
          if (NECESSARY_COOKIES) {
            setConsents({
              NECESSARY_COOKIES,
              ANALYTICS_COOKIES,
              THIRD_PARTY_COOKIES,
            });
          } else {
            // Sync any stored consents to server
            const storedConsents = getStoredConsents();
            if (storedConsents) {
              await updateConsentsRef.current(storedConsents);
            }
          }
        } catch (error) {
          console.error("Failed to fetch consents:", error);
          setConsents(getStoredConsents());
        }
      } else {
        setConsents(getStoredConsents());
      }
      setIsLoading(false);
    };

    fetchConsents();
  }, [user, isAuthenticating]);

  return (
    <ConsentContext.Provider value={{ consents, isLoading, updateConsents }}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsentContext = () => {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsentContext must be used within a ConsentProvider");
  }

  return ctx;
};
