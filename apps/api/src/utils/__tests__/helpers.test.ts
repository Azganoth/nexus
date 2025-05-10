import { composeResponse, validateSchema } from "$/utils/helpers";
import { describe, expect, it } from "@jest/globals";
import { z } from "zod/v4";

describe("Helper Utils", () => {
  describe("composeResponse", () => {
    it("creates a standard success response object", () => {
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

    it("returns the parsed data for valid input", async () => {
      const validInput = { name: "John Doe", email: "john@example.com" };
      const result = await validateSchema(testSchema, validInput);

      expect(result).toEqual(validInput);
    });

    it("should throw ValidationError for invalid input", async () => {
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
