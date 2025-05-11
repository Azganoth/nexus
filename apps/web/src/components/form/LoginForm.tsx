"use client";

import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { LoadingButton } from "$/components/ui/LoadingButton";
import { useApiForm } from "$/hooks/useApiForm";
import { useAuth } from "$/hooks/useAuth";
import { unknownError } from "$/lib/utils";
import { apiClient } from "$/services/apiClient";
import type { Session } from "@repo/shared/contracts";
import { LOGIN_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";

const schema = LOGIN_SCHEMA;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema,
    mutationFn: (data) => apiClient.post<Session>("/auth/login", data),
    onSuccess: async (session) => {
      await login(session);
      router.push("/dashboard");
    },
    expectedErrors: ["INCORRECT_CREDENTIALS"],
    onUnexpectedError: unknownError,
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
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
