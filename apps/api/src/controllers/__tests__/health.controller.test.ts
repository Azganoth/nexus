import { mockPrisma } from "$/__tests__/mocks";
import { createServer } from "$/server";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";
import type { Express } from "express";
import supertest from "supertest";

describe("Health Check Controller", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("GET /health/live", () => {
    it("returns 200 and a success message indicating the API is running", async () => {
      const response = await supertest(app).get("/health/live");

      expect(response.status).toBe(204);
    });
  });

  describe("GET /health/ready", () => {
    it("returns 200 when the database connection is healthy", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const response = await supertest(app).get("/health/ready");

      expect(response.status).toBe(204);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it("should return 503 when the database connection fails", async () => {
      const dbError = new Error("Conexão com a base de dados falhou.");
      mockPrisma.$queryRaw.mockRejectedValue(dbError);

      const response = await supertest(app).get("/health/ready");

      expect(response.status).toBe(503);
      expect(response.body.status).toBe("error");
      expect(response.body.code).toBe("SERVER_UNAVAILABLE");
      expect(response.body.message).toBe(ERRORS.SERVER_UNAVAILABLE);
    });
  });
});
