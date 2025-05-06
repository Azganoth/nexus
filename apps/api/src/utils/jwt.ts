import { env } from "$/config/env";
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from "$/constants";
import type { UserRole } from "@repo/shared/contracts";
import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: string;
  userRole: UserRole;
}

export interface RefreshTokenPayload {
  userId: string;
}

export const signAccessToken = (userId: string, userRole: UserRole) => {
  return jwt.sign(
    { userId, userRole } satisfies AccessTokenPayload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    },
  );
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId } satisfies RefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    },
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const { userId, userRole } = jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
  ) as AccessTokenPayload;
  return { userId, userRole };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const { userId } = jwt.verify(
    token,
    env.JWT_REFRESH_SECRET,
  ) as RefreshTokenPayload;
  return { userId };
};
