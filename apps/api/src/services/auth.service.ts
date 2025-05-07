import {
  ID_SELECT,
  JWT_REFRESH_EXPIRES_IN,
  PASSWORD_RESET_EXPIRES_IN,
  PUBLIC_USER_SELECT,
} from "$/constants";
import { sendPasswordResetEmail } from "$/services/notification.service";
import { ApiError, ValidationError } from "$/utils/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "$/utils/jwt";
import type { PrismaTx } from "$/utils/types";
import { Prisma, prisma } from "@repo/database";
import type { UserRole } from "@repo/shared/contracts";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

const createTokens = async (
  userId: string,
  userRole: UserRole,
  client: PrismaTx = prisma,
) => {
  const accessToken = signAccessToken(userId, userRole);
  const refreshToken = signRefreshToken(userId);

  await client.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRES_IN),
    },
    select: ID_SELECT,
  });

  return { accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...PUBLIC_USER_SELECT, password: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "INCORRECT_CREDENTIALS");
  }

  const { accessToken, refreshToken } = await createTokens(user.id, user.role);
  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};

export const createUser = async (
  email: string,
  password: string,
  name: string,
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        // Enforce mandatory 1-1 with profile
        profile: {
          create: {
            username: email.split("@")[0],
            displayName: name,
            avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(/ +/g, "+")}`,
          },
        },
      },
      select: PUBLIC_USER_SELECT,
    });

    const { accessToken, refreshToken } = await createTokens(
      user.id,
      user.role,
    );
    return { accessToken, refreshToken, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ValidationError({
          email: ["O email já está em uso."],
        });
      }
    }

    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(401, "REFRESH_TOKEN_MISSING");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    console.log(err);
    throw new ApiError(401, "REFRESH_TOKEN_INVALID");
  }
  const { userId } = decoded;

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    select: { id: true, expiresAt: true },
  });

  if (!storedToken) {
    // It might have been stolen or used, as a precaution all refresh tokens
    // from the user will be deleted. Effectively logging out from all devices.
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    throw new ApiError(401, "REFRESH_TOKEN_INVALID");
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
      select: ID_SELECT,
    });
    throw new ApiError(401, "REFRESH_TOKEN_EXPIRED");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) {
    throw new ApiError(401, "REFRESH_TOKEN_INVALID");
  }

  // Enforce single use refresh token
  const { accessToken, refreshToken: newRefreshToken } =
    await prisma.$transaction(async (tx) => {
      tx.refreshToken.delete({ where: { id: storedToken.id } });
      return createTokens(user.id, user.role, tx);
    });

  return { accessToken, newRefreshToken };
};

export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) return;

  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
  if (!user) {
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_IN);
  await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    update: { token, expiresAt },
    create: { userId: user.id, token, expiresAt },
    select: ID_SELECT,
  });

  sendPasswordResetEmail(user.email, token);
};

export const changePassword = async (token: string, newPassword: string) => {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { id: true, expiresAt: true, userId: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new ApiError(400, "PASSWORD_RESET_TOKEN_INVALID");
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: newHashedPassword },
      select: ID_SELECT,
    }),
    // Enforce single use
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
      select: ID_SELECT,
    }),
  ]);
};

export const verifyPasswordResetToken = async (token: string) => {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { expiresAt: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new ApiError(400, "PASSWORD_RESET_TOKEN_INVALID");
  }

  return;
};
