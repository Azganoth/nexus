import { ValidationError } from "$/utils/errors";
import type { SuccessResponse } from "@repo/shared/contracts";
import type z from "zod/v4";

export const composeResponse = <T = unknown>(data: T): SuccessResponse<T> => ({
  status: "success",
  data,
});

export const validateSchema = async <T>(
  schema: z.ZodType<T>,
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
