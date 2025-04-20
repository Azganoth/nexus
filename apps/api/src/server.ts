import { prisma } from "@repo/database";
import { ALLOWED_ORIGINS, IS_DEV } from "@src/constants";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import cors from "cors";
import express, { type Express, type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

const security =
  (headers: Record<string, string>): RequestHandler =>
  (req, res, next) => {
    req.app.disable("x-powered-by");
    res.set(headers);
    next();
  };

export const createServer = (): Express => {
  const server = express();
  server
    .use(morgan(IS_DEV ? "dev" : "combined"))
    .use(
      security({
        "Cross-Origin-Resource-Policy": "cross-origin",
        "X-Content-Type-Options": "nosniff",
        ...(!IS_DEV && {
          "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
        }),
      }),
    )
    .use(cors({ origin: ALLOWED_ORIGINS }))
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
    .get("/message/:name", (req, res) => {
      res.json({ message: `hello ${req.params.name}` });
    })
    .get("/status", (_, res) => {
      res.json({ ok: true });
    })
    .post("/visit", async (_, res) => {
      const data = await prisma.visitorCount.update({
        where: { id: "singleton" },
        data: {
          count: { increment: 1 },
        },
      });
      res.json({ visits: data.count });
    });

  return server;
};
