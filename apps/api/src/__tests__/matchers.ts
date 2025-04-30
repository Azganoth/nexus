import { ApiError, ValidationError } from "$/utils/errors";
import type { ErrorCode } from "@repo/shared/constants";
import type { MatcherFunction } from "expect";

export const toThrowApiError: MatcherFunction<
  [
    expectedStatusCode: number,
    expectedCode?: ErrorCode,
    expectedMessage?: string | RegExp,
  ]
> = async function (
  received,
  expectedStatusCode,
  expectedCode,
  expectedMessage,
) {
  const { printReceived, printExpected, matcherHint } = this.utils;

  if (!(received instanceof ApiError)) {
    return {
      pass: false,
      message: () =>
        `${matcherHint(".toThrowApiError")}

Expected the function to throw an instance of ApiError, but it threw:
  ${printReceived(received)}`,
    };
  }

  if (received.statusCode !== expectedStatusCode) {
    return {
      pass: false,
      message: () =>
        `${matcherHint(".toThrowApiError")}

Expected status code: ${printExpected(expectedStatusCode)}
Received status code: ${printReceived(received.statusCode)}`,
    };
  }

  if (expectedCode && received.code !== expectedCode) {
    return {
      pass: false,
      message: () => `${matcherHint(".toThrowApiError")}

Expected error code: ${printExpected(expectedCode)}
Received error code: ${printReceived(received.code)}`,
    };
  }

  if (expectedMessage) {
    const messageMatches =
      expectedMessage instanceof RegExp
        ? expectedMessage.test(received.message)
        : expectedMessage === received.message;
    if (!messageMatches) {
      return {
        pass: false,
        message: () =>
          `matcherHint(".toThrowApiError")}

Expected error message:
  ${printExpected(expectedMessage)}
Received error message:
  ${printReceived(received.message)}`,
      };
    }
  }

  return {
    pass: true,
    message: () =>
      `${matcherHint(".not.toThrowApiError")}

Function threw the expected ApiError, which was not intended.`,
  };
};

export const toThrowValidationError: MatcherFunction<
  [expectedData?: Record<string, string[]>]
> = async function (received, expectedData) {
  const { printReceived, printExpected, matcherHint } = this.utils;

  if (!(received instanceof ValidationError)) {
    return {
      pass: false,
      message: () =>
        `${matcherHint(".toThrowValidationError")}

Expected the function to throw an instance of ValidationError, but it threw:
  ${printReceived(received)}`,
    };
  }

  if (expectedData) {
    if (!this.equals(received.data, expectedData)) {
      return {
        pass: false,
        message: () =>
          `${matcherHint(".toThrowHttpError")}

Expected error data:\n  ${printExpected(expectedData)}
Received error data:\n  ${printReceived(received.data)}`,
      };
    }
  }

  return {
    pass: true,
    message: () =>
      `${matcherHint(".not.toThrowValidationError")}

Function threw the expected ValidationError, which was not intended.`,
  };
};

declare module "expect" {
  interface AsymmetricMatchers {
    toThrowApiError(
      statusCode: number,
      expectedCode: ErrorCode,
      expectedMessage?: string | RegExp,
    ): void;
    toThrowValidationError(data?: Record<string, string[]>): void;
  }
  interface Matchers<R> {
    toThrowApiError(
      statusCode: number,
      expectedCode: ErrorCode,
      expectedMessage?: string | RegExp,
    ): R;
    toThrowValidationError(data?: Record<string, string[]>): R;
  }
}
