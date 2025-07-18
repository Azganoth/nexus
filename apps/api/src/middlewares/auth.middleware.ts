import { AUTHENTICATED_USER_SELECT } from "$/constants";
import { ApiError } from "$/utils/errors";
import { verifyAccessToken } from "$/utils/jwt";
import { prisma } from "@repo/database";
import type { UserRole } from "@repo/shared/contracts";
import type { NextFunction, Request, Response } from "express";

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;
  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "NOT_LOGGED_IN");
  }
  const accessToken = authorization.split(" ")[1];

  let decoded;
  try {
    decoded = verifyAccessToken(accessToken);
  } catch {
    throw new ApiError(401, "ACCESS_TOKEN_INVALID");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: AUTHENTICATED_USER_SELECT,
  });
  if (!user) {
    throw new ApiError(401, "ACCESS_TOKEN_INVALID");
  }

  req.user = user;
  next();
};

export const authorize =
  (allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ApiError(403, "NOT_AUTHORIZED");
    }

    next();
  };
