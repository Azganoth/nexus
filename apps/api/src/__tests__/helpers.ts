import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";

export const createMockHttp = (
  overrides: {
    req?: Partial<Request>;
    res?: Partial<Response>;
  } = {},
): {
  req: DeepMocked<Request>;
  res: DeepMocked<Response>;
  next: jest.Mock<NextFunction>;
  nextStatic: NextFunction;
} => {
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

  return { req, res, next, nextStatic: next };
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

export const mockDeep = <T extends object>(): DeepMocked<T> => {
  return createDeepMockProxy<T>({} as T);
};

export const resetAllDeepMocks = () => {
  for (const mockFn of deepMocks) {
    mockFn.mockClear();
    mockFn.mockReset();
  }
  deepMocks.length = 0;
};
