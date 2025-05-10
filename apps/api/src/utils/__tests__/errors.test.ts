import { ApiError, HttpError, ValidationError } from "$/utils/errors";
import { describe, expect, it } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";

describe("Error Classes", () => {
  describe("ApiError", () => {
    it("correctly constructs with a custom message", () => {
      const customMessage = "Você não está autorizado a realizar esta ação.";
      const error = new ApiError(403, "NOT_AUTHORIZED", customMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe("ApiError");

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("NOT_AUTHORIZED");
      expect(error.status).toBe("error");
      expect(error.message).toBe(customMessage);
    });

    it("uses the default message from ERRORS if no message is provided", () => {
      const error = new ApiError(404, "NOT_FOUND");

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe(ERRORS.NOT_FOUND);
    });

    describe("toJSON", () => {
      it("returns a correctly formatted ErrorResponse object", () => {
        const error = new ApiError(500, "SERVER_UNKNOWN_ERROR");
        const jsonResponse = error.toJSON();

        expect(jsonResponse).toEqual({
          status: "error",
          code: "SERVER_UNKNOWN_ERROR",
          message: ERRORS.SERVER_UNKNOWN_ERROR,
        });
      });
    });
  });

  describe("ValidationError", () => {
    const mockValidationData = {
      email: ["Por favor, informe um email válido."],
      password: ["A senha deve ter no mínimo 8 caracteres."],
    };

    it("correctly constructs with a data payload", () => {
      const error = new ValidationError(mockValidationData);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe("ValidationError");

      expect(error.statusCode).toBe(422);
      expect(error.status).toBe("fail");
      expect(error.data).toEqual(mockValidationData);
      expect(error.message).toBe("Validação Falhou");
    });

    describe("toJSON", () => {
      it("returns a correctly formatted FailResponse object", () => {
        const error = new ValidationError(mockValidationData);
        const jsonResponse = error.toJSON();

        expect(jsonResponse).toEqual({
          status: "fail",
          data: mockValidationData,
        });
      });
    });
  });
});
