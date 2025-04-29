"use client";

import { Input } from "$/components/Input";
import { PromiseButton } from "$/components/PromiseButton";
import { signup } from "$/lib/api";
import { unknownError } from "$/lib/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { SIGNUP_SCHEMA } from "@repo/shared/schemas";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const signupSchema = SIGNUP_SCHEMA.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupData> = async (data) => {
    try {
      await signup(data.email, data.password);
    } catch (error) {
      unknownError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <Input
          id="signup-email"
          type="email"
          label="Email"
          autoComplete="email"
          autoFocus
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
      <PromiseButton
        className="bg-purple mt-8 w-full min-w-56 text-white"
        type="submit"
        isPending={isSubmitting}
      >
        Cadastrar
      </PromiseButton>
    </form>
  );
}
