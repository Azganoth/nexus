import {
  ID_SELECT,
  JWT_REFRESH_EXPIRES_IN,
  PUBLIC_USER_SELECT,
} from "$/constants";
import { ApiError } from "$/utils/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "$/utils/jwt";
import { Prisma, prisma } from "@repo/database";
import bcrypt from "bcrypt";

const createTokens = async (userId: string) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await prisma.refreshToken.create({
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

  return {
    ...(await createTokens(user.id)),
    user: { id: user.id, email: user.email, name: user.name },
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

    return { ...(await createTokens(user.id)), user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ApiError(422, "VALIDATION_INVALID_INPUT", {
          fieldErrors: {
            email: ["O email já está em uso."],
          },
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
  } catch {
    throw new ApiError(401, "REFRESH_TOKEN_INVALID");
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    select: { id: true, expiresAt: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
        select: ID_SELECT,
      });
    }
    throw new ApiError(401, "REFRESH_TOKEN_INVALID");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true },
  });
  if (!user) {
    throw new ApiError(401, "USER_FOR_TOKEN_NOT_FOUND");
  }

  const accessToken = signAccessToken(user.id);

  return { accessToken };
};

export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) return;

  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};
