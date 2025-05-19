import "dotenv/config";
import { z } from "zod/v4";

// NOTE: Keep turbo 'env' updated.
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().optional().default(3001),
  DATABASE_URL: z.url(),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),

  APP_URL: z.url(),

  RESEND_API_KEY: z.string(),

  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error("Invalid environment variables", {
    cause: parsedEnv.error.issues,
  });
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends Omit<Env, "NODE_ENV" | "PORT"> {
      NODE_ENV?: string;
      PORT?: string;
    }
  }
}
