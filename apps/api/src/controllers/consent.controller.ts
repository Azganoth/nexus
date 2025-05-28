import {
  getUserConsentLogs,
  getUserConsentStatus,
  logUserConsent,
  logUserConsentBatch,
} from "$/services/consent.service";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { Consent, ConsentStatus } from "@repo/shared/contracts";
import { CONSENT_SCHEMA } from "@repo/shared/schemas";
import type { Request, Response } from "express";
import { z } from "zod/v4";

export const logConsent = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = await validateSchema(CONSENT_SCHEMA, req.body);

  await logUserConsent(userId, {
    ...data,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(204).end();
};

const batchConsentSchema = z.array(CONSENT_SCHEMA);

export const logConsentBatch = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = await validateSchema(batchConsentSchema, req.body);

  await logUserConsentBatch(
    userId,
    data.map((consent) => ({
      ...consent,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })),
  );

  res.status(204).end();
};

export const getConsentLogs = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const logs = await getUserConsentLogs(userId);

  res.status(200).json(composeResponse<Consent[]>(logs));
};

export const getConsentStatus = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const status = await getUserConsentStatus(userId);

  res.status(200).json(composeResponse<ConsentStatus>(status));
};
