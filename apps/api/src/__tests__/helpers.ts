import type { QuerySelect, QuerySelection } from "$/utils/types";
import { jest } from "@jest/globals";
import type { Request, Response } from "express";

export const spyConsole = (
  method: "error" | "warn" | "log",
  expectedArgs?: "any" | unknown[],
) => {
  const defaultConsole = console[method];
  return jest.spyOn(console, method).mockImplementation((...args) => {
    const shouldSilence =
      expectedArgs &&
      (expectedArgs === "any" ||
        expectedArgs.some((silencer) => silencer === args[0]));

    if (!shouldSilence) {
      defaultConsole(...args);
    }
  });
};

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

// Custom deep mock
const deepMocks: jest.Mock[] = [];
const deepMockProtectedProps = new Set<PropertyKey>(["then", Symbol.iterator]);

export type DeepMocked<T extends object> = jest.MockedObject<T>;

const createDeepMockProxy = <T extends object>(initialTarget: T) => {
  const cache = new Map<PropertyKey, unknown>();

  const handler: ProxyHandler<T> = {
    get: (target, prop, receiver) => {
      if (cache.has(prop)) {
        return cache.get(prop);
      }

      if (deepMockProtectedProps.has(prop)) {
        return Reflect.get(target, prop, receiver);
      }

      const existingValue = Reflect.get(initialTarget, prop, receiver);
      if (typeof existingValue !== "undefined") {
        return existingValue;
      }

      const mockFn = jest.fn();
      deepMocks.push(mockFn); // Keep track for resetting

      const value = prop === "calls" ? mockFn : createDeepMockProxy(mockFn);
      cache.set(prop, value);
      return value;
    },

    set: (target, prop, value, receiver) => {
      cache.set(prop, value);
      return Reflect.set(target, prop, value, receiver);
    },

    has: (target, prop) => cache.has(prop) || Reflect.has(target, prop),

    ownKeys: (target) => [
      ...new Set(
        [...Reflect.ownKeys(target), ...cache.keys()].filter(
          (key) => typeof key === "string" || typeof key === "symbol",
        ),
      ),
    ],
  };

  const proxy = new Proxy<T>(initialTarget, handler) as DeepMocked<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (proxy as any)._isMockObject = true;
  return proxy;
};

export const mockDeep = <T extends object>() => {
  return createDeepMockProxy<T>({} as T);
};

export const resetAllDeepMocks = () => {
  for (const mockFn of deepMocks) {
    mockFn.mockClear();
    mockFn.mockReset();
  }
  deepMocks.length = 0;
};
