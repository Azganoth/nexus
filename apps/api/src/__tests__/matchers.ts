import { ApiError } from "$/utils/errors";
import type { ErrorCode } from "@repo/shared/constants";
import type { MatcherFunction } from "expect";

type ExpectedErrorOptions = {
  message?: string | RegExp;
  rootErrors?: ApiError["rootErrors"];
  fieldErrors?: ApiError["fieldErrors"];
};

export const toThrowApiError: MatcherFunction<
  [statusCode: number, code: ErrorCode, options?: ExpectedErrorOptions]
> = async function (
  received,
  expectedStatusCode,
  expectedCode,
  expectedOptions,
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

  const { statusCode, code, message, rootErrors, fieldErrors } = received;
  const {
    message: expectedMessage,
    rootErrors: expectedRootErrors,
    fieldErrors: expectedFieldErrors,
  } = expectedOptions ?? {};

  if (statusCode !== expectedStatusCode) {
    return {
      pass: false,
      message: () =>
        `${matcherHint(".toThrowApiError")}

Expected status code: ${printExpected(expectedStatusCode)}
Received status code: ${printReceived(statusCode)}`,
    };
  }

  if (code !== expectedCode) {
    return {
      pass: false,
      message: () =>
        `${matcherHint(".toThrowApiError")}

Expected error code: ${printExpected(expectedCode)}
Received error code: ${printReceived(code)}`,
    };
  }

  if (expectedMessage) {
    const messageMatches =
      expectedMessage instanceof RegExp
        ? expectedMessage.test(message)
        : expectedMessage === message;

    if (!messageMatches) {
      return {
        pass: false,
        message: () =>
          `${matcherHint(".toThrowApiError")}

Expected message: ${printExpected(expectedMessage)}
Received message: ${printReceived(message)}`,
      };
    }
  }

  if (expectedRootErrors) {
    if (!this.equals(rootErrors, expectedRootErrors)) {
      return {
        pass: false,
        message: () =>
          `${matcherHint(".toThrowApiError")}

Expected errors:
  ${printExpected(expectedRootErrors)}
Received errors:
  ${printReceived(rootErrors)}`,
      };
    }
  }

  if (expectedFieldErrors) {
    if (!this.equals(fieldErrors, expectedFieldErrors)) {
      return {
        pass: false,
        message: () =>
          `${matcherHint(".toThrowApiError")}
Expected field errors:
  ${printExpected(expectedFieldErrors)}
Received field errors:
  ${printReceived(fieldErrors)}`,
      };
    }
  }

  return {
    pass: true,
    message: () =>
      `${matcherHint(".not.toThrowApiError")}

Function threw an ApiError with status code ${printReceived(statusCode)} and a matching message, which was not expected.`,
  };
};

declare module "expect" {
  interface AsymmetricMatchers {
    toThrowApiError(
      statusCode: number,
      code: ErrorCode,
      options?: ExpectedErrorOptions,
    ): void;
  }
  interface Matchers<R> {
    toThrowApiError(
      statusCode: number,
      code: ErrorCode,
      options?: ExpectedErrorOptions,
    ): R;
  }
}
