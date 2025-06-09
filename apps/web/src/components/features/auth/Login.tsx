"use client";

import { Button } from "$/components/ui/Button";
import { ErrorHint } from "$/components/ui/ErrorHint";
import { Input } from "$/components/ui/Input";
import { useAuth } from "$/contexts/AuthContext";
import { useApiForm } from "$/hooks/useApiForm";
import { apiClient } from "$/lib/apiClient";
import { unknownError } from "$/lib/utils";
import type { Session } from "@repo/shared/contracts";
import { LOGIN_SCHEMA } from "@repo/shared/schemas";
import { useRouter } from "next/navigation";

export function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useApiForm({
    schema: LOGIN_SCHEMA,
    mutationFn: (data) => apiClient.post<Session>("/auth/login", data),
    onSuccess: async (session) => {
      await login(session);
      router.push("/dashboard");
    },
    expectedErrors: ["INCORRECT_CREDENTIALS"],
    onUnexpectedError: unknownError,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      <div className="mt-12 space-y-4">
        <ErrorHint className="text-center" error={errors.root?.message} />
        <Button
          className="w-full min-w-56"
          type="submit"
          variant="accent"
          isLoading={isSubmitting}
        >
          Entrar
        </Button>
      </div>
    </form>
  );
}
