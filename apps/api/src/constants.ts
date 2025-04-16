import { DEV_API_PORT } from "@repo/shared/constants";

export const IS_DEV = process.env.NODE_ENV !== "production";
export const PORT = process.env.PORT ?? DEV_API_PORT;
