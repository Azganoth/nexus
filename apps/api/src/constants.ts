import { env } from "$/config/env";
import type { StrictQuerySelect } from "$/utils/types";
import type {
  PublicLink,
  PublicProfile,
  PublicUser,
  Timestamp,
} from "@repo/shared/contracts";

export const IS_DEV = env.NODE_ENV !== "production";
export const IS_PROD = env.NODE_ENV === "production";
export const IS_TEST = env.NODE_ENV === "test";

export const ALLOWED_ORIGINS = IS_DEV ? "*" : [env.APP_URL];

export const JWT_ACCESS_EXPIRES_IN = 15 * 60 * 1000;
export const JWT_REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export const PASSWORD_RESET_EXPIRES_IN = 15 * 60 * 1000;

// Query selects
export const ID_SELECT = { id: true } satisfies StrictQuerySelect<{
  id: string | number;
}>; // Use when return won't be used
export const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
} satisfies StrictQuerySelect<PublicUser>;

const TIMESTAMP_SELECT = {
  createdAt: true,
  updatedAt: true,
} satisfies StrictQuerySelect<Timestamp>;
export const PUBLIC_LINK_SELECT = {
  id: true,
  title: true,
  url: true,
  displayOrder: true,
  isPublic: true,
  ...TIMESTAMP_SELECT,
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
  isPublic: true,
  ...TIMESTAMP_SELECT,
} satisfies StrictQuerySelect<PublicProfile>;
