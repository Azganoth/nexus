import { z } from "zod";

export const LOGIN_SCHEMA = z.object({
  email: z
    .string({ required_error: "O email é obrigatório." })
    .nonempty("O email é obrigatório."),
  password: z
    .string({ required_error: "A senha é obrigatória." })
    .nonempty("A senha é obrigatória."),
});

export const SIGNUP_SCHEMA = z.object({
  email: z
    .string({ required_error: "O email é obrigatório." })
    .email("O email deve ser um endereço válido."),
  password: z
    .string({ required_error: "A senha é obrigatória." })
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(32, "A senha não pode exceder 32 caracteres.")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número."),
  name: z
    .string({ required_error: "O nome é obrigatório." })
    .nonempty("O nome é obrigatório.")
    .max(60, "O nome não pode exceder 60 caracteres."),
});
