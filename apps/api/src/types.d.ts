import type { AuthenticatedUser } from "@repo/shared/contracts";

declare module "express" {
  interface Request {
    user?: AuthenticatedUser;
  }
}
