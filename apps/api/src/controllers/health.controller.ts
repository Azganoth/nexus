import { ApiError } from "$/utils/errors";
import { prisma, Prisma } from "@repo/database";
import type { Request, Response } from "express";

export const apiHealth = (_: Request, res: Response) => {
  res.status(204).end();
};

export const dbHealth = async (_: Request, res: Response) => {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    res.status(204).end();
  } catch {
    throw new ApiError(503, "SERVER_UNAVAILABLE");
  }
};
