import type { Env } from "$/config/env";
import type { S3Client } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@repo/database";
import { mockDeep } from "@repo/shared/testUtils";
import type { Resend } from "resend";

// Env
const mockDefaultEnv: Env = {
  NODE_ENV: "test",
  PORT: 3001,
  DATABASE_URL: "postgresql://user:password@localhost:5432/testdb",
  JWT_ACCESS_SECRET: "mock-access-secret",
  JWT_REFRESH_SECRET: "mock-refresh-secret",
  APP_URL: "http://localhost:3000",
  RESEND_API_KEY: "mock-resend-secret",
  R2_ACCOUNT_ID: "test-account",
  R2_ACCESS_KEY_ID: "test-access-key",
  R2_SECRET_ACCESS_KEY: "test-secret-key",
  R2_BUCKET_NAME: "test-bucket",
  R2_PUBLIC_URL: "https://test-bucket.r2.dev",
};

export const mockEnv = { ...mockDefaultEnv };

export const resetMockEnv = () => {
  Object.assign(mockEnv, mockDefaultEnv);
};

// Dependencies
export const mockPrisma = mockDeep<PrismaClient>();
export const mockResend = mockDeep<Resend>();
export const mockS3Client = mockDeep<S3Client>();
