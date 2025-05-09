import { deleteUser, updateUser } from "$/services/user.service";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { PublicUser } from "@repo/shared/contracts";
import { DELETE_USER_SCHEMA, UPDATE_USER_SCHEMA } from "@repo/shared/schemas";
import type { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
  const { id, email, name, role } = req.user!;
  res.status(200).json(composeResponse<PublicUser>({ id, email, name, role }));
};

export const updateMe = async (req: Request, res: Response) => {
  const data = await validateSchema(UPDATE_USER_SCHEMA, req.body);
  const updatedUser = await updateUser(req.user!.id, data);

  res.status(200).json(composeResponse<PublicUser>(updatedUser));
};

export const deleteMe = async (req: Request, res: Response) => {
  const { password } = await validateSchema(DELETE_USER_SCHEMA, req.body);
  await deleteUser(req.user!.id, password);

  res.status(204).end();
};
