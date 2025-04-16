import { DEV_API_URL, PROD_API_URL } from "@repo/shared/constants";

export const API_URL =
  process.env.NODE_ENV !== "production" ? DEV_API_URL : PROD_API_URL;
