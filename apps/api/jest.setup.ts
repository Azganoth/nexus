import { resetAllDeepMocks } from "$/__tests__/helpers";
import "$/__tests__/matchers";
import { mockEnv, mockPrisma, resetMockEnv } from "$/__tests__/mocks";
import { beforeEach, jest } from "@jest/globals";

jest.mock("$/config/env", () => ({
  env: mockEnv,
}));
jest.mock("@repo/database", () => ({
  ...(jest.requireActual("@repo/database") as object),
  prisma: mockPrisma,
}));

beforeEach(() => {
  resetMockEnv();
  resetAllDeepMocks();
});
