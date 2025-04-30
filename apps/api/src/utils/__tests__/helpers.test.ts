import { composeResponse, validateSchema } from "$/utils/helpers";
import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

describe("Helper Utils", () => {
  describe("composeResponse", () => {
    it("should create a standard success response object", () => {
      const data = { id: 1, name: "Test" };
      const response = composeResponse(data);

      expect(response).toEqual({
        status: "success",
        data: data,
      });
    });
  });

  describe("validateSchema", () => {
    const testSchema = z.object({
      name: z.string().min(1, "Nome é obrigatório."),
      email: z.string().email("Email inválido."),
    });

    it("should return the parsed data for valid input", async () => {
      const validInput = { name: "John Doe", email: "john@example.com" };
      const result = await validateSchema(testSchema, validInput);

      expect(result).toEqual(validInput);
    });

    it("should throw a 422 ApiError for invalid input", async () => {
      const invalidInput = { name: "", email: "not-an-email" };

      await expect(
        validateSchema(testSchema, invalidInput),
      ).rejects.toThrowValidationError({
        name: ["Nome é obrigatório."],
        email: ["Email inválido."],
      });
    });
  });
});
