import "$/lib/envGuard";

export const IS_SERVER = typeof window === "undefined";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const WEB_URL = "https://nexusapp.fly.dev";

export const AUTO_SAVE_DELAY = 1000;
