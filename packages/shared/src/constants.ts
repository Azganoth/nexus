export const ERRORS = {
  // General Errors
  NOT_FOUND: "Recurso não encontrado.",
  TOO_MANY_REQUESTS: "Limite de solicitações excedido.",

  // Authentication & Authorization Errors
  NOT_AUTHORIZED: "Permissão insuficiente.",
  NOT_LOGGED_IN: "Autenticação necessária.",
  INCORRECT_CREDENTIALS: "Email e/ou senha incorretos.",

  ACCESS_TOKEN_INVALID: "Token de acesso inválido.",
  REFRESH_TOKEN_MISSING: "Token de atualização ausente.",
  REFRESH_TOKEN_INVALID: "Token de atualização inválido.",
  REFRESH_TOKEN_EXPIRED: "Token de atualização expirado.",

  // Server Errors
  SERVER_UNKNOWN_ERROR: "Ocorreu um erro interno no servidor.",
  SERVER_UNAVAILABLE: "Serviço indisponível.",

  // Generic Errors
  UNEXPECTED_ERROR: "Ocorreu um erro inesperado.",
} satisfies Record<string, string>;

export type ErrorCode = keyof typeof ERRORS;
