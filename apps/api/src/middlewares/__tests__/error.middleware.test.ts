import { createMockHttp } from "$/__tests__/helpers";
import { error as errorMiddleware } from "$/middlewares/error.middleware";
import { ApiError } from "$/utils/errors";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";

describe("Error Middleware", () => {
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle an ApiError correctly", () => {
    const { req, res, next, nextStatic } = createMockHttp();
    const apiError = new ApiError(404, "NOT_FOUND");
    const handler = errorMiddleware();

    handler(apiError, req, res, nextStatic);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "NOT_FOUND",
      message: ERRORS.NOT_FOUND,
    });
    expect(next).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle a generic Error correctly", () => {
    const { req, res, next, nextStatic } = createMockHttp();
    const genericError = new Error("Something broke!");
    const handler = errorMiddleware();

    handler(genericError, req, res, nextStatic);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
      }),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(genericError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next(err) if headers have already been sent", () => {
    const { req, res, next, nextStatic } = createMockHttp({
      res: { headersSent: true },
    });
    const error = new ApiError(500, "SERVER_UNKNOWN_ERROR");
    const handler = errorMiddleware();

    handler(error, req, res, nextStatic);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
