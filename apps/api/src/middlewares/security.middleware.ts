import { IS_PROD } from "$/constants";
import type { NextFunction, Request, Response } from "express";

const headers = {
  "Cross-Origin-Resource-Policy": "cross-origin",
  "X-Content-Type-Options": "nosniff",
  ...(IS_PROD && {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  }),
};

export const securityHeaders =
  () => (req: Request, res: Response, next: NextFunction) => {
    req.app.disable("x-powered-by");
    res.set(headers);
    next();
  };
