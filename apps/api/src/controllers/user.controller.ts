import { composeResponse } from "$/utils/helpers";
import type { PublicUser } from "@repo/shared/contracts";
import type { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
  const { id, email, name } = req.user!;
  res.status(200).json(composeResponse<PublicUser>({ id, email, name }));
};
