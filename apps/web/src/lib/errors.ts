import type { ErrorResponse, FailResponse } from "@repo/shared/contracts";

export class HttpError extends Error {
  constructor(public readonly payload: FailResponse | ErrorResponse) {
    super();
    this.name = "HttpError";
  }
}
