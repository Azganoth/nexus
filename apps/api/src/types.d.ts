import type { PublicUser } from "@repo/shared/contracts";

declare module "express" {
  interface Request {
    user?: PublicUser;
  }
}
