"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { useAuth } from "$/contexts/AuthContext";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/lib/apiClient";
import type { Session } from "@repo/shared/contracts";
import { SIGNUP_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";

const schema = SIGNUP_SCHEMA.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export function Signup() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema,
    mutationFn: (data) => {
      const { name, email, password } = data;
      return apiClient.post<Session>("/auth/signup", {
        name,
        email,
        password,
      });
    },
    onSuccess: async (session) => {
      await login(session);
      router.push("/dashboard");
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="text"
        label="Nome"
        autoComplete="name"
        autoFocus
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        type="email"
        label="Email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        type="password"
        label="Senha"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        type="password"
        label="Confirme a senha"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <div className="mt-12 space-y-4">
        <ErrorHint className="text-center" error={errors.root?.message} />
        <LoadingButton
          className="bg-purple w-full min-w-56 text-white"
          type="submit"
          isPending={isSubmitting}
        >
          Cadastrar
        </LoadingButton>
      </div>
    </form>
  );
}
