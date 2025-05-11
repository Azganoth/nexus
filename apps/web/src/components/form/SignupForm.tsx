"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { useApiForm } from "$/hooks/useApiForm";
import { useAuth } from "$/hooks/useAuth";
import { unknownError } from "$/lib/utils";
import { apiClient } from "$/services/apiClient";
import type { Session } from "@repo/shared/contracts";
import { SIGNUP_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";

const schema = SIGNUP_SCHEMA.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export function SignupForm() {
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
    onUnexpectedError: unknownError,
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
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
      </div>
      <ErrorHint className="mt-6 text-center" message={errors.root?.message} />
      <LoadingButton
        className="bg-purple mt-2 w-full min-w-56 text-white"
        type="submit"
        isPending={isSubmitting}
      >
        Cadastrar
      </LoadingButton>
    </form>
  );
}
