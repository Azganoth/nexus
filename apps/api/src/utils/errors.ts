import { ERRORS, type ErrorCode } from "@repo/shared/constants";
import type { ErrorResponse, FailResponse } from "@repo/shared/contracts";

export abstract class HttpError extends Error {
  protected constructor(
    public readonly statusCode: number,
    message?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  abstract toJSON(): FailResponse | ErrorResponse;
}

export class ApiError extends HttpError {
  public readonly status = "error";

  constructor(
    statusCode: number,
    public readonly code: ErrorCode,
    message?: string,
  ) {
    super(statusCode, message ?? ERRORS[code]);
  }

  toJSON(): ErrorResponse {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
    };
  }
}

export class ValidationError extends HttpError {
  public readonly status = "fail";

  constructor(public readonly data: FailResponse["data"]) {
    super(422, "Validação Falhou");
  }

  toJSON(): FailResponse {
    return {
      status: this.status,
      data: this.data,
    };
  }
}
