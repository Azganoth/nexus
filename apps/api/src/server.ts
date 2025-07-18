import { ALLOWED_ORIGINS, IS_DEV, IS_TEST } from "$/constants";
import { error, notFound } from "$/middlewares/error.middleware";
import {
  defaultLimiter,
  securityHeaders,
} from "$/middlewares/security.middleware";
import router from "$/router";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import morgan from "morgan";

export const createServer = (): Express => {
  const server = express();

  server.set("trust proxy", 1); // Trust Fly.io proxy

  server
    .use(
      morgan(IS_DEV ? "dev" : "combined", {
        skip: () => IS_TEST,
      }),
    )
    .use(securityHeaders)
    .use(cors({ origin: ALLOWED_ORIGINS, credentials: true }))
    .use(defaultLimiter)
    .use(compression())
    .use(urlencoded({ extended: true, limit: "10mb" }))
    .use(json({ limit: "10mb" }))
    .use(cookieParser())
    .use(router)
    .use(notFound())
    .use(error());

  return server;
};
