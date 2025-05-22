import { apiClient } from "$/lib/apiClient";
import { cache, use, type ReactNode } from "react";

const verifyToken = cache((token: string) =>
  apiClient.post("/auth/verify-reset-token", { token }),
);

interface TokenVerificationProps {
  token: string;
  children: ReactNode;
}

export function TokenVerification({ token, children }: TokenVerificationProps) {
  // Let next.js catch it to display in the custom error page.
  use(verifyToken(token));
  return children;
}
