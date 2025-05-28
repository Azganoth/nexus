import type { ConsentType } from "@repo/shared/contracts";

// Cookie consents that need local storage
export type CookieConsentType = Exclude<
  ConsentType,
  "TERMS_OF_SERVICE" | "PRIVACY_POLICY"
>;
export type LocalConsentStatus = Record<CookieConsentType, boolean>;

const CONSENT_STORAGE_KEY = "cookie_consents";
export const DEFAULT_COOKIE_CONSENT_STATUS: LocalConsentStatus = {
  NECESSARY_COOKIES: true,
  ANALYTICS_COOKIES: true,
  THIRD_PARTY_COOKIES: true,
};

export const getStoredConsents = (): LocalConsentStatus | undefined => {
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  try {
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore invalid JSON
  }
};

export const setStoredConsents = (consents: LocalConsentStatus): void => {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consents));
};

export const clearStoredConsents = (): void => {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
};
