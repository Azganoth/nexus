import { resetAllDeepMocks } from "$/__tests__/helpers";
import { toThrowApiError } from "$/__tests__/matchers";
import {
  mockBcrypt,
  mockEnv,
  mockPrisma,
  resetMockEnv,
} from "$/__tests__/mocks";
import { beforeEach, expect, jest } from "@jest/globals";

jest.mock("$/config/env", () => ({
  env: mockEnv,
}));
jest.mock("@repo/database", () => ({
  ...(jest.requireActual("@repo/database") as object),
  prisma: mockPrisma,
}));
jest.mock("bcrypt", () => ({
  ...(jest.requireActual("bcrypt") as object),
  compare: mockBcrypt.compare,
  hash: mockBcrypt.hash,
}));

beforeEach(() => {
  resetMockEnv();
  resetAllDeepMocks();
});

expect.extend({
  toThrowApiError,
});
