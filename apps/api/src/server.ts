import { prisma } from "@repo/database";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import express, { type Express } from "express";
import morgan from "morgan";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
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

  return app;
};
