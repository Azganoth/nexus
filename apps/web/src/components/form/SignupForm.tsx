"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { useAuth } from "$/contexts/AuthContext";
import { useApiForm } from "$/hooks/useApiForm";
import { fetchApi } from "$/lib/api";
import { unknownError } from "$/lib/helpers";
import type { AuthPayload } from "@repo/shared/contracts";
import { SIGNUP_SCHEMA } from "@repo/shared/schemas";
import { z } from "zod";

const schema = SIGNUP_SCHEMA.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema,
    mutationFn: (data) => {
      const { name, email, password } = data;
      return fetchApi<AuthPayload>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
    },
    onSuccess: (data) => {
      login(data);
      // router.push("/dashboard");
    },
    onUnexpectedError: unknownError,
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <Input
          id="signup-name"
          type="text"
          label="Nome"
          autoComplete="name"
          autoFocus
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="signup-email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          id="signup-password"
          type="password"
          label="Senha"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          id="signup-confirmPassword"
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
