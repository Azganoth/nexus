import { ApiError, ValidationError } from "$/lib/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { ERRORS, type ErrorCode } from "@repo/shared/constants";
import { useCallback } from "react";
import {
  useForm,
  type Path,
  type Resolver,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { z } from "zod/v4";

interface UseApiFormProps<Schema extends z.ZodObject, Output>
  extends Omit<UseFormProps<z.infer<Schema>>, "resolver"> {
  schema: Schema;
  mutationFn: (data: z.infer<Schema>) => Promise<Output>;
  onSuccess?: (response: Output) => void | Promise<void>;
  expectedErrors?: ErrorCode[];
  onUnexpectedError?: (error: unknown) => void;
}

export function useApiForm<Schema extends z.ZodObject, Output>({
  schema,
  mutationFn,
  onSuccess,
  expectedErrors,
  onUnexpectedError,
  ...useFormProps
}: UseApiFormProps<Schema, Output>) {
  type Data = z.infer<Schema>;

  const form = useForm<Data>({
    ...useFormProps,
    resolver: zodResolver(schema) as Resolver<Data>,
  });

  const { clearErrors, setError } = form;

  const handleDataSubmit = useCallback<SubmitHandler<Data>>(async (data) => {
    clearErrors();
    try {
      const response = await mutationFn(data);
      await onSuccess?.(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        Object.entries(error.data).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            setError(field as Path<Data>, {
              type: "server",
              message: messages[0], // Show only one error at a time for now
            });
          }
        });
        return;
      }

      if (error instanceof ApiError && expectedErrors?.includes(error.code)) {
        setError("root", {
          type: "server",
          message: error.message,
        });
        return;
      }

      setError("root", {
        type: "unexpected",
        message: `${ERRORS.UNEXPECTED_ERROR} Tente novamente.`,
      });
      onUnexpectedError?.(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...form,
    submitData: handleDataSubmit,
    handleSubmit: form.handleSubmit(handleDataSubmit),
  };
}
