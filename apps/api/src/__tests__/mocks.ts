import { mockDeep, type DeepMocked } from "$/__tests__/helpers";
import type { Env } from "$/config/env";
import type { PrismaClient } from "@repo/database";
import type bcrypt from "bcrypt";

// Env
const mockDefaultEnv: Env = {
  NODE_ENV: "test",
  PORT: 3001,
  DATABASE_URL: "postgresql://user:password@localhost:5432/testdb",
  JWT_ACCESS_SECRET: "mock-access-secret",
  JWT_REFRESH_SECRET: "mock-refresh-secret",
  APP_URL: "http://localhost:3000",
};

export const mockEnv = { ...mockDefaultEnv };

export const resetMockEnv = () => {
  Object.assign(mockEnv, mockDefaultEnv);
};

// Dependencies
export const mockPrisma: DeepMocked<PrismaClient> = mockDeep();
export const mockBcrypt = mockDeep<typeof bcrypt>();
