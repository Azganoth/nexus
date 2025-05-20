import { z } from "zod/v4";

export const LOGIN_SCHEMA = z.object({
  email: z.string().trim().min(1, "O email é obrigatório."),
  password: z.string().trim().min(1, "A senha é obrigatória."),
});

const unknownEmail = z.email("O email deve ser um endereço válido.").trim();

const newPassword = z
  .string()
  .trim()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(32, "A senha não pode exceder 32 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número.");

const displayName = z
  .string()
  .trim()
  .min(1, "O nome é obrigatório.")
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
  token: z.string().trim().min(1, "O token é obrigatório."),
  password: newPassword,
});

export const UPDATE_PROFILE_SCHEMA = z.object({
  username: z
    .string()
    .trim()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres.")
    .max(40, "O nome de usuário não pode exceder 40 caracteres.")
    .optional(),
  displayName: displayName.optional(),
  bio: z
    .string()
    .trim()
    .max(255, "A bio não pode exceder 255 caracteres.")
    .optional(),
  isPublic: z.boolean().optional(),
  seoTitle: z
    .string()
    .trim()
    .max(60, "O título de SEO não pode exceder 60 caracteres.")
    .optional(),
  seoDescription: z
    .string()
    .trim()
    .max(255, "A descrição de SEO não pode exceder 255 caracteres.")
    .optional(),
  avatarUrl: z.url().optional(),
});

export const CREATE_LINK_SCHEMA = z.object({
  title: z
    .string()
    .trim()
    .min(1, "O título é obrigatório.")
    .max(60, "O título não pode exceder 60 caracteres."),
  url: z.string().trim().url("A URL deve ser um endereço válido."),
});

export const UPDATE_LINK_SCHEMA = CREATE_LINK_SCHEMA.partial().extend({
  isPublic: z.boolean().optional(),
});

export const UPDATE_LINK_ORDER_SCHEMA = z.object({
  orderedIds: z
    .array(z.number().int().positive())
    .min(1, "A lista de IDs é obrigatória."),
});

export const UPDATE_USER_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .max(60, "O nome não pode exceder 60 caracteres.")
    .optional(),
});

export const DELETE_USER_SCHEMA = z.object({
  password: z.string().trim().min(1, "A senha é obrigatória."),
});

export const AVATAR_UPLOAD_SCHEMA = z.object({
  fileType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024, "O arquivo deve ter no máximo 5MB."),
  fileExt: z.enum(["png", "jpg", "jpeg", "webp"]),
  fileHash: z
    .string()
    .length(64, "Hash inválido.")
    .regex(/^[a-f0-9]{64}$/, "Hash inválido."),
});
