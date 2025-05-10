import { createMockHttp, spyConsole } from "$/__tests__/helpers";
import { error as errorMiddleware } from "$/middlewares/error.middleware";
import { ApiError, ValidationError } from "$/utils/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";

describe("Error Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles ApiError correctly", async () => {
    const { req, res, next } = createMockHttp();
    const apiError = new ApiError(404, "NOT_FOUND");
    const consoleErrorSpy = spyConsole("error", [apiError]);
    const handler = errorMiddleware();

    handler(apiError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      code: "NOT_FOUND",
      message: ERRORS.NOT_FOUND,
    });
    expect(next).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("handles ValidationError correctly", async () => {
    const { req, res, next } = createMockHttp();
    const validationError = new ValidationError({ email: ["Email usado."] });
    const consoleErrorSpy = spyConsole("error", [validationError]);
    const handler = errorMiddleware();

    handler(validationError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      data: validationError.data,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("handles unknown errors correctly", async () => {
    const { req, res, next } = createMockHttp();
    const unknownError = new Error("An unknown error occurred");
    const consoleErrorSpy = spyConsole("error", [unknownError]);
    const handler = errorMiddleware();

    handler(unknownError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
      }),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(unknownError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next(err) if headers have already been sent", () => {
    const { req, res, next } = createMockHttp({
      res: { headersSent: true },
    });
    const error = new ApiError(500, "SERVER_UNKNOWN_ERROR");
    const handler = errorMiddleware();

    handler(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
