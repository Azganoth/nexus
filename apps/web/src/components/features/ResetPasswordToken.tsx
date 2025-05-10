import { apiClient } from "$/services/apiClient";
import { cache, use, type ReactNode } from "react";

const verifyToken = cache(async (token: string) =>
  apiClient.post("/auth/verify-reset-token", { token }),
);

interface Props {
  token: string;
  children: ReactNode;
}

export function TokenVerification({ token, children }: Props) {
  // Let next.js catch it to display in the custom error page.
  use(verifyToken(token));
  return children;
}
