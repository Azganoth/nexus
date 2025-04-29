import { ApiError } from "$/utils/errors";
import type { NextFunction, Request, Response } from "express";

const unkownError = new ApiError(500, "SERVER_UNKNOWN_ERROR");

export const error =
  () => (err: unknown, _: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    let e;
    if (err instanceof ApiError) {
      e = err;
    } else {
      console.error(err);
      e = unkownError;
    }

    res.status(e.statusCode).json(e.toJSON());
  };

export const notFound = () => () => {
  throw new ApiError(404, "NOT_FOUND");
};
