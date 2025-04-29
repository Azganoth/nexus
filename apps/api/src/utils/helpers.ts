import { ApiError } from "$/utils/errors";
import type { SuccessApiResponse } from "@repo/shared/contracts";
import type { ZodError, ZodSchema } from "zod";

export const composeResponse = <T = unknown>(
  data: T,
  message?: string,
): SuccessApiResponse<T> => ({
  status: "success",
  data,
  message,
});

const processZodError = <T>(error: ZodError<T>) => {
  const rootErrors: ApiError["rootErrors"] = [];
  const fieldErrors: ApiError["fieldErrors"] = {};

  error.issues.forEach((issue) => {
    if (issue.path.length === 0) {
      rootErrors.push(issue.message);
    } else {
      (fieldErrors[issue.path.join(".")] ??= []).push(issue.message);
    }
  });

  return { rootErrors, fieldErrors };
};

export const validateSchema = async <T>(
  schema: ZodSchema<T>,
  data: unknown,
) => {
  const result = await schema.safeParseAsync(data);
  if (!result.success) {
    throw new ApiError(
      422,
      "VALIDATION_INVALID_INPUT",
      processZodError(result.error),
    );
  }

  return result.data;
};
