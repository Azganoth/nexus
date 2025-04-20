import { DEV_API_PORT, PROD_WEB_URL } from "@repo/shared/constants";

export const IS_DEV = process.env.NODE_ENV !== "production";
export const PORT = process.env.PORT ?? DEV_API_PORT;

export const ALLOWED_ORIGINS = IS_DEV ? "*" : [PROD_WEB_URL];
