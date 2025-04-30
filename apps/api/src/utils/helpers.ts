import { ValidationError } from "$/utils/errors";
import type { SuccessResponse } from "@repo/shared/contracts";
import type { ZodSchema } from "zod";

export const composeResponse = <T = unknown>(data: T): SuccessResponse<T> => ({
  status: "success",
  data,
});

export const validateSchema = async <T>(
  schema: ZodSchema<T>,
  data: unknown,
) => {
  const result = await schema.safeParseAsync(data);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.reduce(
        (data, issue) => {
          const path = issue.path.join(".");
          if (path) {
            (data[path] ??= []).push(issue.message);
          }
          return data;
        },
        {} as ValidationError["data"],
      ),
    );
  }

  return result.data;
};
