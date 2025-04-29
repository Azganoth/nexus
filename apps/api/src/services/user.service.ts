import { PUBLIC_USER_SELECT } from "$/constants";
import { prisma } from "@repo/database";

export const getUserById = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });
};
