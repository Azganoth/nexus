import type { PrismaTx, QuerySelect, QuerySelection } from "$/utils/types";
import { jest } from "@jest/globals";
import type { PrismaClient } from "@repo/database";
import {
  mockDeep,
  resetAllDeepMocks,
  spyConsole,
  type DeepMocked,
} from "@repo/shared/testUtils";
import type { Request, Response } from "express";

export const createMockHttp = (
  overrides: {
    req?: Partial<Request>;
    res?: Partial<Response>;
  } = {},
) => {
  const req = mockDeep<Request>();
  const res = mockDeep<Response>();
  const next = jest.fn();

  res.status.mockReturnThis();
  res.json.mockReturnThis();
  res.send.mockReturnThis();
  res.end.mockReturnThis();
  res.clearCookie.mockReturnThis();

  Object.assign(req, { ...overrides.req });
  Object.assign(res, { headersSent: false, ...overrides.res });

  return { req, res, next };
};

export const selectData = <
  T extends Record<string, unknown>,
  S extends QuerySelect<T>,
>(
  source: T,
  select: S,
) => {
  return Object.keys(select).reduce((result, key) => {
    const selectValue = select[key];
    const sourceValue = source[key];
    if (selectValue === true) {
      // @ts-expect-error Too generic
      result[key] = sourceValue;
    } else if (typeof selectValue === "object" && selectValue !== null) {
      if (Array.isArray(sourceValue)) {
        // @ts-expect-error Too generic
        result[key] = sourceValue.map((item) => selectData(item, selectValue));
      } else if (sourceValue !== null && typeof sourceValue === "object") {
        // @ts-expect-error Too generic
        result[key] = selectData(sourceValue, selectValue);
      }
    }
    return result;
  }, {} as Partial<T>) as QuerySelection<T, S>;
};

export const mockTransaction = (mockPrisma: DeepMocked<PrismaClient>) => {
  const mockPrismaTx = mockDeep<PrismaTx>();
  mockPrisma.$transaction.mockImplementation(async (callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockPrismaTx);
    }

    if (Array.isArray(callback)) {
      return Promise.all(callback);
    }
  });

  return mockPrismaTx;
};

// Re-export shared utilities for backward compatibility
export { spyConsole, resetAllDeepMocks };
