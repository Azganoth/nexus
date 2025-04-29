import { apiHealth, dbHealth } from "$/controllers/health.controller";
import { Router } from "express";

export const healthRouter: Router = Router();

healthRouter.get("/live", apiHealth);
healthRouter.get("/ready", dbHealth);
