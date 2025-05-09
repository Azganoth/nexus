import { z } from "zod";

export const LOGIN_SCHEMA = z.object({
  email: z
    .string({ required_error: "O email é obrigatório." })
    .nonempty("O email é obrigatório."),
  password: z
    .string({ required_error: "A senha é obrigatória." })
    .nonempty("A senha é obrigatória."),
});

const unknownEmail = z
  .string({ required_error: "O email é obrigatório." })
  .email("O email deve ser um endereço válido.");

const newPassword = z
  .string({ required_error: "A senha é obrigatória." })
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(32, "A senha não pode exceder 32 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número.");

const displayName = z
  .string({ required_error: "O nome é obrigatório." })
  .nonempty("O nome é obrigatório.")
  .max(60, "O nome não pode exceder 60 caracteres.");

export const SIGNUP_SCHEMA = z.object({
  email: unknownEmail,
  password: newPassword,
  name: displayName,
});

export const FORGOT_PASSWORD_SCHEMA = z.object({
  email: unknownEmail,
});

export const RESET_PASSWORD_SCHEMA = z.object({
  token: z
    .string({ required_error: "O token é obrigatório." })
    .nonempty("O token é obrigatório."),
  password: newPassword,
});

export const UPDATE_PROFILE_SCHEMA = z.object({
  displayName: displayName.optional(),
  bio: z.string().max(255, "A bio não pode exceder 255 caracteres.").optional(),
  isPublic: z.boolean().optional(),
  seoTitle: z
    .string()
    .max(60, "O título de SEO não pode exceder 60 caracteres.")
    .optional(),
  seoDescription: z
    .string()
    .max(255, "A descrição de SEO não pode exceder 255 caracteres.")
    .optional(),
});

export const CREATE_LINK_SCHEMA = z.object({
  title: z
    .string()
    .nonempty("O título é obrigatório.")
    .max(60, "O título não pode exceder 60 caracteres."),
  url: z.string().url("A URL deve ser um endereço válido."),
});

export const UPDATE_LINK_SCHEMA = CREATE_LINK_SCHEMA.partial();

export const UPDATE_LINK_ORDER_SCHEMA = z.object({
  orderedIds: z
    .array(z.number().int().positive(), {
      required_error: "O array de IDs é obrigatório.",
    })
    .nonempty("É necessário fornecer ao menos um ID."),
});

export const UPDATE_USER_SCHEMA = z.object({
  name: z.string().max(60, "O nome não pode exceder 60 caracteres.").optional(),
});

export const DELETE_USER_SCHEMA = z.object({
  password: z
    .string({ required_error: "A senha é obrigatória." })
    .nonempty("A senha é obrigatória."),
});
