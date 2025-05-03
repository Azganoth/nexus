import { HttpError } from "$/lib/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { ERRORS, type ErrorCode } from "@repo/shared/constants";
import {
  useForm,
  type FieldValues,
  type Path,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { z } from "zod";

interface UseApiFormProps<Data extends FieldValues, Output>
  extends UseFormProps<Data> {
  schema: z.Schema<Data>;
  mutationFn: (data: Data) => Promise<Output>;
  onSuccess?: (response: Output) => void;
  expectedErrors?: ErrorCode[];
  onUnexpectedError?: (error: unknown) => void;
}

export function useApiForm<Data extends FieldValues, Output>({
  schema,
  mutationFn,
  onSuccess,
  expectedErrors,
  onUnexpectedError,
  ...useFormProps
}: UseApiFormProps<Data, Output>) {
  const form = useForm<Data>({
    ...useFormProps,
    resolver: zodResolver(schema),
  });

  const { setError } = form;

  const handleSubmit: SubmitHandler<Data> = async (data) => {
    form.clearErrors();
    try {
      const response = await mutationFn(data);
      onSuccess?.(response);
    } catch (error) {
      if (error instanceof HttpError) {
        const { payload } = error;
        if (payload.status === "fail") {
          Object.entries(payload.data).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              setError(field as Path<Data>, {
                type: "server",
                message: messages[0], // Show only one error at a time for now
              });
            }
          });
          return;
        }

        if (expectedErrors?.includes(payload.code)) {
          setError("root", {
            type: "server",
            message: payload.message,
          });
          return;
        }
      }

      setError("root", {
        type: "unexpected",
        message: `${ERRORS.UNEXPECTED_ERROR} Tente novamente.`,
      });
      onUnexpectedError?.(error);
    }
  };

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
