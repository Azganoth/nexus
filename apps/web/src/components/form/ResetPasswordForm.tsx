"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { useApiForm } from "$/hooks/useApiForm";
import { fetchApi } from "$/lib/api";
import { toast } from "$/lib/toast";
import { RESET_PASSWORD_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";
import { z } from "zod";

const schema = RESET_PASSWORD_SCHEMA.omit({ token: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

interface Props {
  token: string;
}

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema,
    mutationFn: (data) => {
      const { password } = data;
      return fetchApi("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
    },
    onSuccess: () => {
      toast("Senha alterada com sucesso.", { variant: "success" });
      router.push("/login");
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <Input
          id="reset-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          id="reset-confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>
      <ErrorHint className="mt-6 text-center" message={errors.root?.message} />
      <LoadingButton
        className="bg-purple mt-2 w-full min-w-56 text-white"
        type="submit"
        isPending={isSubmitting}
      >
        Redefinir senha
      </LoadingButton>
    </form>
  );
}
