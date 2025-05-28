import { CONSENT_SELECT, UNUSED_SELECT } from "$/constants";
import type { PrismaTx } from "$/utils/types";
import { prisma } from "@repo/database";
import type {
  Consent,
  ConsentAction,
  ConsentStatus,
  ConsentType,
} from "@repo/shared/contracts";
import type { CONSENT_SCHEMA } from "@repo/shared/schemas";
import type { z } from "zod/v4";

export const logUserConsent = async (
  userId: string,
  data: z.infer<typeof CONSENT_SCHEMA>,
  client: PrismaTx = prisma,
): Promise<void> => {
  await client.consentLog.create({
    data: {
      userId,
      type: data.type,
      action: data.granted ? "GRANT" : "REVOKE",
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
    select: UNUSED_SELECT,
  });
};

export const logUserConsentBatch = async (
  userId: string,
  data: z.infer<typeof CONSENT_SCHEMA>[],
): Promise<void> => {
  await prisma.$transaction(async (tx) =>
    Promise.all(data.map((consent) => logUserConsent(userId, consent, tx))),
  );
};

export const getUserConsentLogs = async (
  userId: string,
): Promise<Consent[]> => {
  const logs = await prisma.consentLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: CONSENT_SELECT,
  });

  return logs;
};

export const getUserConsentStatus = async (
  userId: string,
): Promise<ConsentStatus> => {
  const logs = await getUserConsentLogs(userId);

  const status: ConsentStatus = {
    TERMS_OF_SERVICE: false,
    PRIVACY_POLICY: false,
    NECESSARY_COOKIES: false,
    ANALYTICS_COOKIES: false,
    THIRD_PARTY_COOKIES: false,
  };

  // Get the latest action for each consent type
  const latestActions = new Map<ConsentType, ConsentAction>();
  logs.forEach((log) => {
    if (!latestActions.has(log.type)) {
      latestActions.set(log.type, log.action);
    }
  });

  latestActions.forEach((action, type) => {
    status[type] = action === "GRANT";
  });

  return status;
};
