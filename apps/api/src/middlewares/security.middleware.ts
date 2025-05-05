import { IS_DEV, IS_PROD } from "$/constants";
import { ERRORS } from "@repo/shared/constants";
import type { ErrorResponse } from "@repo/shared/contracts";
import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

const headers = {
  "Cross-Origin-Resource-Policy": "cross-origin",
  "X-Content-Type-Options": "nosniff",
  ...(IS_PROD && {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  }),
};

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.app.disable("x-powered-by");
  res.set(headers);
  next();
};

const limiterResponse: ErrorResponse = {
  status: "error",
  code: "TOO_MANY_REQUESTS",
  message: ERRORS["TOO_MANY_REQUESTS"],
};

export const defaultLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: limiterResponse,
  skip: (req) => IS_DEV && req.ip === "::1",
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: limiterResponse,
  skip: (req) => IS_DEV && req.ip === "::1",
});
