import { env } from "$/config/env";
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from "$/constants";
import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
}

export const signAccessToken = (userId: string) => {
  return jwt.sign({ userId } satisfies TokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign({ userId } satisfies TokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};
