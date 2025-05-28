import {
  AUTHENTICATED_USER_SELECT,
  JWT_REFRESH_EXPIRES_IN,
  PASSWORD_RESET_EXPIRES_IN,
  UNUSED_SELECT,
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
import type { Session, UserRole } from "@repo/shared/contracts";
import type { CONSENT_SCHEMA } from "@repo/shared/schemas";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import type { z } from "zod/v4";

export interface FullSession extends Session {
  refreshToken: string;
  refreshTokenExpires: Date;
}

const createTokens = async (
  userId: string,
  userRole: UserRole,
  client: PrismaTx = prisma,
) => {
  const accessToken = signAccessToken(userId, userRole);
  const refreshToken = signRefreshToken(userId);

  const refreshTokenExpires = new Date(Date.now() + JWT_REFRESH_EXPIRES_IN);
  await client.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: refreshTokenExpires,
    },
    select: UNUSED_SELECT,
  });

  return { accessToken, refreshToken, refreshTokenExpires };
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<FullSession> => {
  const storedUser = await prisma.user.findUnique({
    where: { email },
    select: { ...AUTHENTICATED_USER_SELECT, password: true },
  });
  if (!storedUser) {
    throw new ApiError(401, "INCORRECT_CREDENTIALS");
  }

  const { password: storedPassword, ...user } = storedUser;
  if (!(await bcrypt.compare(password, storedPassword))) {
    throw new ApiError(401, "INCORRECT_CREDENTIALS");
  }

  const tokens = await createTokens(user.id, user.role);
  return { ...tokens, user };
};

export const signupUser = async (
  email: string,
  password: string,
  name: string,
  requiredConsents: z.infer<typeof CONSENT_SCHEMA>[],
): Promise<FullSession> => {
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
        consentLogs: {
          create: requiredConsents.map(({ granted, ...consentInfo }) => ({
            ...consentInfo,
            action: granted ? "GRANT" : "REVOKE",
            version: "1.0",
          })),
        },
      },
      select: AUTHENTICATED_USER_SELECT,
    });

    const tokens = await createTokens(user.id, user.role);
    return { ...tokens, user };
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

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<FullSession> => {
  if (!refreshToken) {
    throw new ApiError(401, "REFRESH_TOKEN_MISSING");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
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
      select: UNUSED_SELECT,
    });
    throw new ApiError(401, "REFRESH_TOKEN_EXPIRED");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: AUTHENTICATED_USER_SELECT,
  });
  if (!user) {
    throw new ApiError(401, "REFRESH_TOKEN_INVALID");
  }

  // Enforce single use refresh token
  const tokens = await prisma.$transaction(async (tx) => {
    tx.refreshToken.delete({ where: { id: storedToken.id } });
    return createTokens(user.id, user.role, tx);
  });

  return { ...tokens, user };
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  if (!refreshToken) return;

  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const revalidateUser = async (
  refreshToken: string,
): Promise<Session | null> => {
  if (!refreshToken) {
    return null;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return null;
  }
  const { userId } = decoded;

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    select: { id: true, expiresAt: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: AUTHENTICATED_USER_SELECT,
  });
  if (!user) {
    return null;
  }

  const accessToken = signAccessToken(user.id, user.role);
  return { accessToken, user };
};

export const requestPasswordReset = async (email: string): Promise<void> => {
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
    select: UNUSED_SELECT,
  });

  sendPasswordResetEmail(user.email, token);
};

export const changePassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
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
      select: UNUSED_SELECT,
    }),
    // Enforce single use
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
      select: UNUSED_SELECT,
    }),
  ]);
};

export const verifyPasswordResetToken = async (
  token: string,
): Promise<void> => {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { expiresAt: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new ApiError(400, "PASSWORD_RESET_TOKEN_INVALID");
  }
};
