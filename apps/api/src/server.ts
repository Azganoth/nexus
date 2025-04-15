import { prisma } from "@repo/database";
import { IS_DEV } from "@src/constants";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import express, { type Express } from "express";
import morgan from "morgan";

export const createServer = (): Express => {
  const server = express();
  server
    .disable("x-powered-by")
    .use(morgan(IS_DEV ? "dev" : "combined"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
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
