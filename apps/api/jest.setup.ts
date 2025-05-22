import "$/__tests__/matchers";
import {
  mockEnv,
  mockPrisma,
  mockResend,
  mockS3Client,
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
  Resend: jest.fn(() => mockResend),
}));
jest.mock("@aws-sdk/client-s3", () => ({
  ...(jest.requireActual("@aws-sdk/client-s3") as object),
  S3Client: jest.fn(() => mockS3Client),
}));

beforeEach(() => {
  resetMockEnv();
  resetAllDeepMocks();
});
