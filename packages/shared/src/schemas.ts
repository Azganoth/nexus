import { z } from "zod";

const emailSchema = z.string().email("Por favor, insira um email válido");
const basePassword = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(32, "A senha deve ter no máximo 32 caracteres");

export const signupSchema = z
  .object({
    email: emailSchema,
    password: basePassword
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignupData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: basePassword,
});

export type LoginData = z.infer<typeof loginSchema>;
