import "$/__tests__/matchers";
import {
  mockEnv,
  mockPrisma,
  mockResendClass,
  resetMockEnv,
} from "$/__tests__/mocks";
import { beforeEach, jest } from "@jest/globals";
import { resetAllDeepMocks } from "@repo/shared/testUtils";

jest.mock("$/config/env", () => ({
  env: mockEnv,
}));
jest.mock("@repo/database", () => ({
  ...(jest.requireActual("@repo/database") as object),
  prisma: mockPrisma,
}));
jest.mock("resend", () => ({
  ...(jest.requireActual("resend") as object),
  Resend: mockResendClass,
}));

beforeEach(() => {
  resetMockEnv();
  resetAllDeepMocks();
});
