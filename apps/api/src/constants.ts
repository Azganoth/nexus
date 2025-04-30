import { env } from "$/config/env";

export const IS_DEV = env.NODE_ENV !== "production";
export const IS_PROD = env.NODE_ENV === "production";
export const IS_TEST = env.NODE_ENV === "test";

export const ALLOWED_ORIGINS = IS_DEV ? "*" : [env.APP_URL];

export const JWT_ACCESS_EXPIRES_IN = 15 * 60 * 1000;
export const JWT_REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

// Prisma selects
export const ID_SELECT = { id: true }; // Use when return won't be used
export const PUBLIC_USER_SELECT = { id: true, email: true, name: true };
