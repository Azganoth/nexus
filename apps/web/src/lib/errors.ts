import type { ErrorResponse, FailResponse } from "@repo/shared/contracts";

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorResponse["code"],
    public readonly message: ErrorResponse["message"],
  ) {
    super(message);
  }
}

export class ValidationError extends Error {
  constructor(public readonly data: FailResponse["data"]) {
    super("Validação Falhou");
  }
}
