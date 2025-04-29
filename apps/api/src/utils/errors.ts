import { ERRORS, type ErrorCode } from "@repo/shared/constants";
import type { ErrorApiResponse, FailApiResponse } from "@repo/shared/contracts";

type ApiErrorOptions = {
  message?: string;
  rootErrors?: FailApiResponse["rootErrors"];
  fieldErrors?: FailApiResponse["fieldErrors"];
};

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly status: (FailApiResponse | ErrorApiResponse)["status"];
  public readonly code: ErrorCode;
  public readonly rootErrors: FailApiResponse["rootErrors"];
  public readonly fieldErrors: FailApiResponse["fieldErrors"];

  constructor(
    statusCode: number,
    code: ErrorCode,
    { message, rootErrors, fieldErrors }: ApiErrorOptions = {},
  ) {
    super(message ?? ERRORS[code]);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.status = statusCode < 500 ? "fail" : "error";
    this.code = code;
    this.rootErrors = rootErrors;
    this.fieldErrors = fieldErrors;
  }

  toJSON(): FailApiResponse | ErrorApiResponse {
    return {
      status: this.status,
      message: this.message,
      code: this.code,
      rootErrors: this.rootErrors,
      fieldErrors: this.fieldErrors,
    };
  }
}
