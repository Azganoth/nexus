import { PUBLIC_USER_SELECT } from "$/constants";
import { ApiError, ValidationError } from "$/utils/errors";
import { prisma } from "@repo/database";
import type { UPDATE_USER_SCHEMA } from "@repo/shared/schemas";
import bcrypt from "bcrypt";
import type { z } from "zod/v4";

export const updateUser = async (
  userId: string,
  data: z.infer<typeof UPDATE_USER_SCHEMA>,
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_USER_SELECT,
  });

  return user;
};

export const deleteUser = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(404, "NOT_FOUND");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ValidationError({ password: ["A senha está incorreta."] });
  }

  // Hard delete.
  await prisma.user.delete({
    where: { id: userId },
  });
};
