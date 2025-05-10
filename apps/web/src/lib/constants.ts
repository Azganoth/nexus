export const IS_SERVER = typeof window === "undefined";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is required");
}

export const WEB_URL = "https://nexusapp.fly.dev";
