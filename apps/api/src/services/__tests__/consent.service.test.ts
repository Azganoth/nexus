import {
  createRandomConsentLog,
  createRandomUser,
} from "$/__tests__/factories";
import { mockTransaction, selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import {
  getUserConsentLogs,
  getUserConsentStatus,
  logUserConsent,
  logUserConsentBatch,
} from "$/services/consent.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ConsentStatus } from "@repo/shared/contracts";

describe("Consent Service", () => {
  const mockUser = createRandomUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logUserConsent", () => {
    it("creates a consent log with granted action", async () => {
      const grantedConsentLog = createRandomConsentLog(mockUser.id, {
        action: "GRANT",
      });
      const grantedConsent = {
        type: grantedConsentLog.type,
        granted: true,
      };
      mockPrisma.consentLog.create.mockResolvedValue(grantedConsentLog);

      await logUserConsent(mockUser.id, grantedConsent);

      expect(mockPrisma.consentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(
            selectData(grantedConsentLog, { type: true, action: true }),
          ),
        }),
      );
    });

    it("creates a consent log with revoked action", async () => {
      const revokedConsentLog = createRandomConsentLog(mockUser.id, {
        action: "REVOKE",
      });
      const revokedConsent = {
        type: revokedConsentLog.type,
        granted: false,
      };
      mockPrisma.consentLog.create.mockResolvedValue(revokedConsentLog);

      await logUserConsent(mockUser.id, revokedConsent);

      expect(mockPrisma.consentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(
            selectData(revokedConsentLog, { type: true, action: true }),
          ),
        }),
      );
    });
  });

  describe("logUserConsentBatch", () => {
    it("logs multiple consents in a transaction", async () => {
      const consentBatch = [
        { type: "ANALYTICS_COOKIES" as const, granted: true },
        { type: "THIRD_PARTY_COOKIES" as const, granted: false },
        { type: "NECESSARY_COOKIES" as const, granted: true },
      ];
      const mockPrismaTx = mockTransaction(mockPrisma);

      await logUserConsentBatch(mockUser.id, consentBatch);

      expect(mockPrismaTx.consentLog.create).toHaveBeenCalledTimes(3);
    });

    it("handles empty batch", async () => {
      const mockPrismaTx = mockTransaction(mockPrisma);

      await logUserConsentBatch(mockUser.id, []);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrismaTx.consentLog.create).not.toHaveBeenCalled();
    });
  });

  describe("getUserConsentLogs", () => {
    it("returns user consent logs ordered by creation date", async () => {
      const consentLogs = [
        createRandomConsentLog(mockUser.id, {
          id: "log-1",
          createdAt: new Date("2025-01-01"),
        }),
        createRandomConsentLog(mockUser.id, {
          id: "log-2",
          createdAt: new Date("2025-01-02"),
        }),
        createRandomConsentLog(mockUser.id, {
          id: "log-3",
          createdAt: new Date("2025-01-03"),
        }),
      ];
      mockPrisma.consentLog.findMany.mockResolvedValue(consentLogs);

      const result = await getUserConsentLogs(mockUser.id);

      expect(mockPrisma.consentLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
          orderBy: { createdAt: "desc" },
        }),
      );
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("log-1"); // Most recent first (desc order)
    });

    it("returns empty array when user has no consent logs", async () => {
      mockPrisma.consentLog.findMany.mockResolvedValue([]);

      const result = await getUserConsentLogs(mockUser.id);

      expect(result).toEqual([]);
    });
  });

  describe("getUserConsentStatus", () => {
    it("returns correct consent status based on latest actions", async () => {
      const consentLogs = [
        createRandomConsentLog(mockUser.id, {
          type: "ANALYTICS_COOKIES",
          action: "GRANT",
          createdAt: new Date("2025-01-01"),
        }),
        createRandomConsentLog(mockUser.id, {
          type: "ANALYTICS_COOKIES",
          action: "REVOKE",
          createdAt: new Date("2025-01-02"),
        }),
        createRandomConsentLog(mockUser.id, {
          type: "THIRD_PARTY_COOKIES",
          action: "GRANT",
          createdAt: new Date("2025-01-03"),
        }),
        createRandomConsentLog(mockUser.id, {
          type: "NECESSARY_COOKIES",
          action: "GRANT",
          createdAt: new Date("2025-01-04"),
        }),
      ];
      const expectedStatus: ConsentStatus = {
        TERMS_OF_SERVICE: false,
        PRIVACY_POLICY: false,
        NECESSARY_COOKIES: true,
        ANALYTICS_COOKIES: true, // Latest action was GRANT (first in desc order)
        THIRD_PARTY_COOKIES: true,
      };
      mockPrisma.consentLog.findMany.mockResolvedValue(consentLogs);

      const result = await getUserConsentStatus(mockUser.id);

      expect(result).toEqual(expectedStatus);
    });

    it("returns all false when user has no consent logs", async () => {
      mockPrisma.consentLog.findMany.mockResolvedValue([]);

      const result = await getUserConsentStatus(mockUser.id);

      const expectedStatus: ConsentStatus = {
        TERMS_OF_SERVICE: false,
        PRIVACY_POLICY: false,
        NECESSARY_COOKIES: false,
        ANALYTICS_COOKIES: false,
        THIRD_PARTY_COOKIES: false,
      };

      expect(result).toEqual(expectedStatus);
    });

    it("handles multiple consent types correctly", async () => {
      const consentLogs = [
        createRandomConsentLog(mockUser.id, {
          type: "TERMS_OF_SERVICE",
          action: "GRANT",
          createdAt: new Date("2025-01-01"),
        }),
        createRandomConsentLog(mockUser.id, {
          type: "PRIVACY_POLICY",
          action: "GRANT",
          createdAt: new Date("2025-01-02"),
        }),
        createRandomConsentLog(mockUser.id, {
          type: "NECESSARY_COOKIES",
          action: "GRANT",
          createdAt: new Date("2025-01-03"),
        }),
        createRandomConsentLog(mockUser.id, {
          type: "ANALYTICS_COOKIES",
          action: "REVOKE",
          createdAt: new Date("2025-01-04"),
        }),
        createRandomConsentLog(mockUser.id, {
          type: "THIRD_PARTY_COOKIES",
          action: "GRANT",
          createdAt: new Date("2025-01-05"),
        }),
      ];
      const expectedStatus: ConsentStatus = {
        TERMS_OF_SERVICE: true,
        PRIVACY_POLICY: true,
        NECESSARY_COOKIES: true,
        ANALYTICS_COOKIES: false,
        THIRD_PARTY_COOKIES: true,
      };

      mockPrisma.consentLog.findMany.mockResolvedValue(consentLogs);

      const result = await getUserConsentStatus(mockUser.id);

      expect(result).toEqual(expectedStatus);
    });
  });
});
