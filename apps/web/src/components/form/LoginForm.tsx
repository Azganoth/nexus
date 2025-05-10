"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { useApiForm } from "$/hooks/useApiForm";
import { unknownError } from "$/lib/utils";
import { apiClient } from "$/services/apiClient";
import type { Session } from "@repo/shared/contracts";
import { LOGIN_SCHEMA } from "@repo/shared/schemas";

const schema = LOGIN_SCHEMA;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema,
    mutationFn: (data) => apiClient.post<Session>("/auth/login", data),
    onSuccess: (payload) => {
      console.log("Logged in: ", payload);
      // router.push("/dashboard");
    },
    expectedErrors: ["INCORRECT_CREDENTIALS"],
    onUnexpectedError: unknownError,
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <Input
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          id="login-password"
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>
      <ErrorHint className="mt-6 text-center" message={errors.root?.message} />
      <LoadingButton
        className="bg-purple mt-2 w-full min-w-56 text-white"
        type="submit"
        isPending={isSubmitting}
      >
        Entrar
      </LoadingButton>
    </form>
  );
}
