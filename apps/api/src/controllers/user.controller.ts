import {
  deleteUser,
  exportUserData,
  updateUser,
} from "$/services/user.service";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { AuthenticatedUser, UserDataExport } from "@repo/shared/contracts";
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

export const exportMyData = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userData = await exportUserData(userId);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="nexus-data-export-${new Date().toISOString().split("T")[0]}.json"`,
  );

  res.status(200).json(composeResponse<UserDataExport>(userData));
};
