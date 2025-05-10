import { env } from "$/config/env";
import type { StrictQuerySelect } from "$/utils/types";
import type {
  AuthenticatedLink,
  AuthenticatedProfile,
  AuthenticatedUser,
  PublicLink,
  PublicProfile,
  Timestamps,
} from "@repo/shared/contracts";

export const IS_DEV = env.NODE_ENV !== "production";
export const IS_PROD = env.NODE_ENV === "production";
export const IS_TEST = env.NODE_ENV === "test";

export const ALLOWED_ORIGINS = IS_DEV
  ? [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3002",
    ]
  : [env.APP_URL];

export const JWT_ACCESS_EXPIRES_IN = 60 * 60 * 1000;
export const JWT_REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export const PASSWORD_RESET_EXPIRES_IN = 15 * 60 * 1000;

// Query selects
export const UNUSED_SELECT = { id: true } satisfies StrictQuerySelect<{
  id: string | number;
}>; // Use when return won't be used

const TIMESTAMP_SELECT = {
  createdAt: true,
  updatedAt: true,
} satisfies StrictQuerySelect<Timestamps>;

export const AUTHENTICATED_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies StrictQuerySelect<AuthenticatedUser>;

export const PUBLIC_LINK_SELECT = {
  id: true,
  title: true,
  url: true,
  displayOrder: true,
} satisfies StrictQuerySelect<PublicLink>;
export const PUBLIC_PROFILE_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  links: PUBLIC_LINK_SELECT,
  seoTitle: true,
  seoDescription: true,
} satisfies StrictQuerySelect<PublicProfile>;

export const AUTHENTICATED_LINK_SELECT = {
  ...PUBLIC_LINK_SELECT,
  isPublic: true,
  ...TIMESTAMP_SELECT,
} satisfies StrictQuerySelect<AuthenticatedLink>;
export const AUTHENTICATED_PROFILE_SELECT = {
  ...PUBLIC_PROFILE_SELECT,
  links: AUTHENTICATED_LINK_SELECT,
  isPublic: true,
  ...TIMESTAMP_SELECT,
} satisfies StrictQuerySelect<AuthenticatedProfile>;
