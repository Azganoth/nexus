import { IS_PROD } from "$/constants";
import {
  changePassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
  revalidateUser,
  signupUser,
  verifyPasswordResetToken,
} from "$/services/auth.service";
import { ApiError } from "$/utils/errors";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { AuthPayload } from "@repo/shared/contracts";
import {
  FORGOT_PASSWORD_SCHEMA,
  LOGIN_SCHEMA,
  RESET_PASSWORD_SCHEMA,
  SIGNUP_SCHEMA,
} from "@repo/shared/schemas";
import type { Request, Response } from "express";

const setRefreshToken = (
  res: Response,
  refreshToken: string,
  refreshTokenExpires: Date,
) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    expires: refreshTokenExpires,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = await validateSchema(LOGIN_SCHEMA, req.body);

  const { accessToken, refreshToken, refreshTokenExpires, user } =
    await loginUser(email, password);
  setRefreshToken(res, refreshToken, refreshTokenExpires);

  res.status(200).json(composeResponse<AuthPayload>({ accessToken, user }));
};

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = await validateSchema(
    SIGNUP_SCHEMA,
    req.body,
  );

  const { accessToken, refreshToken, refreshTokenExpires, user } =
    await signupUser(email, password, name);
  setRefreshToken(res, refreshToken, refreshTokenExpires);

  res.status(201).json(composeResponse<AuthPayload>({ accessToken, user }));
};

export const logout = async (req: Request, res: Response) => {
  await logoutUser(req.cookies.refreshToken);

  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
    })
    .status(204)
    .end();
};

export const refreshAccess = async (req: Request, res: Response) => {
  const { accessToken, refreshToken, refreshTokenExpires, user } =
    await refreshAccessToken(req.cookies.refreshToken);
  setRefreshToken(res, refreshToken, refreshTokenExpires);

  res.status(200).json(composeResponse<AuthPayload>({ accessToken, user }));
};

export const revalidateSession = async (req: Request, res: Response) => {
  const payload = await revalidateUser(req.cookies.refreshToken);
  if (!payload) {
    throw new ApiError(401, "NOT_LOGGED_IN");
  }

  res.status(200).json(composeResponse<AuthPayload>(payload));
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = await validateSchema(FORGOT_PASSWORD_SCHEMA, req.body);
  await requestPasswordReset(email);

  res.status(204).end();
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = await validateSchema(
    RESET_PASSWORD_SCHEMA,
    req.body,
  );
  await changePassword(token, password);

  res.status(204).end();
};

export const verifyResetToken = async (req: Request, res: Response) => {
  const { token } = await validateSchema(
    RESET_PASSWORD_SCHEMA.pick({ token: true }),
    req.body,
  );
  await verifyPasswordResetToken(token);

  res.status(204).end();
};
