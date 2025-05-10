import { deleteUser, updateUser } from "$/services/user.service";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { AuthenticatedUser } from "@repo/shared/contracts";
import { DELETE_USER_SCHEMA, UPDATE_USER_SCHEMA } from "@repo/shared/schemas";
import type { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
  const user = req.user!;
  res.status(200).json(composeResponse<AuthenticatedUser>(user));
};

export const updateMe = async (req: Request, res: Response) => {
  const data = await validateSchema(UPDATE_USER_SCHEMA, req.body);
  const updatedUser = await updateUser(req.user!.id, data);

  res.status(200).json(composeResponse<AuthenticatedUser>(updatedUser));
};

export const deleteMe = async (req: Request, res: Response) => {
  const { password } = await validateSchema(DELETE_USER_SCHEMA, req.body);
  await deleteUser(req.user!.id, password);

  res.status(204).end();
};
