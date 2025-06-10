"use client";

import { Button } from "$/components/ui/Button";
import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { toast } from "$/components/ui/Toast";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/lib/apiClient";
import { RESET_PASSWORD_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";

const schema = RESET_PASSWORD_SCHEMA.omit({ token: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

interface ResetPasswordProps {
  token: string;
}

export function ResetPassword({ token }: ResetPasswordProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema,
    mutationFn: (data) => {
      const { password } = data;
      return apiClient.post("/auth/reset-password", { token, password });
    },
    onSuccess: () => {
      toast.success("Senha alterada com sucesso.");
      router.push("/login");
    },
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <div className="mt-12 space-y-4">
        <ErrorHint className="text-center" error={errors.root?.message} />
        <Button
          className="w-full"
          type="submit"
          variant="accent"
          isLoading={isSubmitting}
        >
          Redefinir senha
        </Button>
      </div>
    </form>
  );
}
