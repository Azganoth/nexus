import { ApiError } from "$/utils/errors";
import { describe, expect, it } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";

describe("ApiError", () => {
  it("should correctly construct with a code and an options payload", () => {
    const error = new ApiError(422, "VALIDATION_INVALID_INPUT", {
      message: "Mensagem customizada.",
      rootErrors: ["Erro global."],
      fieldErrors: { email: ["É invalido."] },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe("VALIDATION_INVALID_INPUT");
    expect(error.message).toBe("Mensagem customizada.");
    expect(error.rootErrors).toEqual(["Erro global."]);
    expect(error.fieldErrors).toEqual({ email: ["É invalido."] });
  });

  it("should use the default message from ERRORS if no message is provided", () => {
    const error = new ApiError(404, "NOT_FOUND");
    expect(error.message).toBe(ERRORS.NOT_FOUND);
  });

  describe("status property", () => {
    it("should have status 'fail' for status codes less than 500", () => {
      const clientError = new ApiError(404, "NOT_FOUND");
      expect(clientError.status).toBe("fail");
    });

    it("should have status 'error' for status codes 500 or greater", () => {
      const serverError = new ApiError(500, "SERVER_UNKNOWN_ERROR");
      expect(serverError.status).toBe("error");
    });
  });

  describe("toJSON method", () => {
    it("should return a correctly formatted object with all properties", () => {
      const options = {
        rootErrors: ["Global error."],
        fieldErrors: { email: ["É invalido."] },
      };
      const error = new ApiError(422, "VALIDATION_INVALID_INPUT", options);

      const json = error.toJSON();

      expect(json).toEqual({
        status: "fail",
        code: "VALIDATION_INVALID_INPUT",
        message: ERRORS.VALIDATION_INVALID_INPUT,
        rootErrors: options.rootErrors,
        fieldErrors: options.fieldErrors,
      });
    });

    it("should return undefined for optional properties that are not set", () => {
      const error = new ApiError(503, "SERVER_UNKNOWN_ERROR");
      const json = error.toJSON();

      expect(json).toEqual({
        status: "error",
        code: "SERVER_UNKNOWN_ERROR",
        message: ERRORS.SERVER_UNKNOWN_ERROR,
      });
    });
  });
});
