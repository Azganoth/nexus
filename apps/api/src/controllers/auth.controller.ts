import { IS_PROD, JWT_REFRESH_EXPIRES_IN } from "$/constants";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "$/services/auth.service";
import { composeResponse, validateSchema } from "$/utils/helpers";
import type { AccessTokenOutput, AuthOutput } from "@repo/shared/contracts";
import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from "@repo/shared/schemas";
import type { Request, Response } from "express";

const setRefreshToken = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    expires: new Date(Date.now() + JWT_REFRESH_EXPIRES_IN),
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = await validateSchema(LOGIN_SCHEMA, req.body);

  const { accessToken, refreshToken, user } = await loginUser(email, password);
  setRefreshToken(res, refreshToken);

  res
    .status(200)
    .json(
      composeResponse<AuthOutput>({ accessToken, user }, "Login efetuado."),
    );
};

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = await validateSchema(
    SIGNUP_SCHEMA,
    req.body,
  );

  const { accessToken, refreshToken, user } = await createUser(
    email,
    password,
    name,
  );
  setRefreshToken(res, refreshToken);

  res
    .status(201)
    .json(composeResponse<AuthOutput>({ accessToken, user }, "Conta criada."));
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  await logoutUser(refreshToken);
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
  const refreshToken = req.cookies.refreshToken;
  const { accessToken } = await refreshAccessToken(refreshToken);
  res
    .status(200)
    .json(
      composeResponse<AccessTokenOutput>(
        { accessToken },
        "Token de acesso atualizado.",
      ),
    );
};
