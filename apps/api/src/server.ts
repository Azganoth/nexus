import { ALLOWED_ORIGINS, IS_DEV } from "$/constants";
import { error, notFound } from "$/middlewares/error.middleware";
import { securityHeaders } from "$/middlewares/security.middleware";
import router from "$/router";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

export const createServer = (): Express => {
  const server = express();
  server
    .use(morgan(IS_DEV ? "dev" : "combined"))
    .use(securityHeaders())
    .use(cors({ origin: ALLOWED_ORIGINS, credentials: true }))
    .use(
      rateLimit({
        windowMs: 5 * 60 * 1000,
        limit: 200,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => IS_DEV && req.ip === "::1",
      }),
    )
    .use(compression())
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cookieParser())
    .use(router)
    .use(notFound())
    .use(error());

  return server;
};
