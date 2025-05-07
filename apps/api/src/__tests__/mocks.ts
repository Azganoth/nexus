import { mockDeep } from "$/__tests__/helpers";
import type { Env } from "$/config/env";
import { jest } from "@jest/globals";
import type { PrismaClient } from "@repo/database";
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
};

export const mockEnv = { ...mockDefaultEnv };

export const resetMockEnv = () => {
  Object.assign(mockEnv, mockDefaultEnv);
};

// Dependencies
export const mockPrisma = mockDeep<PrismaClient>();
export const mockResend = mockDeep<Resend>();
export const mockResendClass = jest.fn().mockImplementation(() => mockResend);
