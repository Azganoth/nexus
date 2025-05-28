import {
  getConsentLogs,
  getConsentStatus,
  logConsent,
  logConsentBatch,
} from "$/controllers/consent.controller";
import { authenticate } from "$/middlewares/auth.middleware";
import { Router } from "express";

export const consentRouter: Router = Router();

consentRouter.post("/log", authenticate, logConsent);
consentRouter.post("/log/batch", authenticate, logConsentBatch);
consentRouter.get("/logs", authenticate, getConsentLogs);
consentRouter.get("/status", authenticate, getConsentStatus);
