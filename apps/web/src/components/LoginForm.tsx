"use client";

import { Input } from "@components/Input";
import { PromiseButton } from "@components/PromiseButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@lib/api";
import { unknownError } from "@lib/helpers";
import { loginSchema, type LoginData } from "@repo/shared/schemas";
import { useForm, type SubmitHandler } from "react-hook-form";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      unknownError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>
      <PromiseButton
        className="bg-purple mt-8 w-full min-w-56 text-white"
        type="submit"
        isPending={isSubmitting}
      >
        Entrar
      </PromiseButton>
    </form>
  );
}
