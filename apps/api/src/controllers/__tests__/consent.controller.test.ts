import {
  createRandomConsentLog,
  createRandomUser,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { AUTHENTICATED_USER_SELECT, CONSENT_SELECT } from "$/constants";
import { createServer } from "$/server";
import {
  getUserConsentLogs,
  getUserConsentStatus,
  logUserConsent,
  logUserConsentBatch,
} from "$/services/consent.service";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";
import type { ConsentStatus } from "@repo/shared/contracts";
import type { Express } from "express";
import supertest from "supertest";

jest.mock("$/services/consent.service");

const mockLogConsent = jest.mocked(logUserConsent);
const mockLogConsentBatch = jest.mocked(logUserConsentBatch);
const mockGetConsentLogs = jest.mocked(getUserConsentLogs);
const mockGetConsentStatus = jest.mocked(getUserConsentStatus);

describe("Consent Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockAuthenticatedUser = selectData(mockUser, AUTHENTICATED_USER_SELECT);
  const mockAccessToken = signAccessToken(mockUser.id, mockUser.role);

  const mockTestOptionals = {
    ipAddress: expect.stringMatching(/^::ffff:127\.0\.0\.1$/),
    userAgent: undefined, // User-Agent is undefined in test environment
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("POST /consents/log", () => {
    it("logs a single consent and returns 204", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      const consent = { type: "ANALYTICS_COOKIES" as const, granted: true };

      const response = await supertest(app)
        .post("/consents/log")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(consent);

      expect(response.status).toBe(204);
      expect(mockLogConsent).toHaveBeenCalledWith(mockUser.id, {
        ...consent,
        ...mockTestOptionals,
      });
    });

    it("should return 401 if unauthenticated", async () => {
      const consent = { type: "ANALYTICS_COOKIES", granted: true };

      const response = await supertest(app).post("/consents/log").send(consent);

      expect(response.status).toBe(401);
    });

    it("should return 422 for invalid consent type", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const invalidConsent = {
        type: "INVALID_TYPE",
        granted: true,
      };

      const response = await supertest(app)
        .post("/consents/log")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(invalidConsent);

      expect(response.status).toBe(422);
    });

    it("should return 422 for missing required fields", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const invalidConsent = {
        type: "ANALYTICS_COOKIES",
        // missing granted field
      };

      const response = await supertest(app)
        .post("/consents/log")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(invalidConsent);

      expect(response.status).toBe(422);
    });
  });

  describe("POST /consents/log/batch", () => {
    it("logs multiple consents and returns 204", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const consentBatch = [
        { type: "ANALYTICS_COOKIES" as const, granted: true },
        { type: "THIRD_PARTY_COOKIES" as const, granted: false },
        { type: "NECESSARY_COOKIES" as const, granted: true },
      ];

      const response = await supertest(app)
        .post("/consents/log/batch")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(consentBatch);

      expect(response.status).toBe(204);
      expect(mockLogConsentBatch).toHaveBeenCalledWith(
        mockUser.id,
        consentBatch.map((consent) => ({
          ...consent,
          ...mockTestOptionals,
        })),
      );
    });

    it("should return 401 if unauthenticated", async () => {
      const consentBatch = [{ type: "ANALYTICS_COOKIES", granted: true }];

      const response = await supertest(app)
        .post("/consents/log/batch")
        .send(consentBatch);

      expect(response.status).toBe(401);
    });

    it("handles empty batch array", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const response = await supertest(app)
        .post("/consents/log/batch")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send([]);

      expect(response.status).toBe(204);
      expect(mockLogConsentBatch).toHaveBeenCalledWith(mockUser.id, []);
    });

    it("should return 422 for invalid batch data", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const invalidConsentBatch = [
        { type: "ANALYTICS_COOKIES", granted: true },
        { type: "INVALID_TYPE", granted: false }, // Invalid type
      ];

      const response = await supertest(app)
        .post("/consents/log/batch")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(invalidConsentBatch);

      expect(response.status).toBe(422);
    });
  });

  describe("GET /consents/logs", () => {
    it("should return 401 if unauthenticated", async () => {
      const response = await supertest(app).get("/consents/logs");

      expect(response.status).toBe(401);
    });

    it("returns user consent logs", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      const consentLog = createRandomConsentLog(mockUser.id);
      const consentLogs = [consentLog];
      mockGetConsentLogs.mockResolvedValue(consentLogs);

      const response = await supertest(app)
        .get("/consents/logs")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        ...selectData(consentLog, CONSENT_SELECT),
        createdAt: consentLog.createdAt.toISOString(),
      });
      expect(mockGetConsentLogs).toHaveBeenCalledWith(mockUser.id);
    });

    it("returns empty array when user has no consent logs", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      mockGetConsentLogs.mockResolvedValue([]);

      const response = await supertest(app)
        .get("/consents/logs")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /consents/status", () => {
    it("returns user consent status", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      const consentStatus: ConsentStatus = {
        TERMS_OF_SERVICE: true,
        PRIVACY_POLICY: true,
        NECESSARY_COOKIES: true,
        ANALYTICS_COOKIES: false,
        THIRD_PARTY_COOKIES: true,
      };
      mockGetConsentStatus.mockResolvedValue(consentStatus);

      const response = await supertest(app)
        .get("/consents/status")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(consentStatus);
      expect(mockGetConsentStatus).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return 401 if unauthenticated", async () => {
      const response = await supertest(app).get("/consents/status");

      expect(response.status).toBe(401);
    });

    it("returns all false status when user has no consent logs", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const emptyStatus: ConsentStatus = {
        TERMS_OF_SERVICE: false,
        PRIVACY_POLICY: false,
        NECESSARY_COOKIES: false,
        ANALYTICS_COOKIES: false,
        THIRD_PARTY_COOKIES: false,
      };

      mockGetConsentStatus.mockResolvedValue(emptyStatus);

      const response = await supertest(app)
        .get("/consents/status")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(emptyStatus);
    });
  });
});
