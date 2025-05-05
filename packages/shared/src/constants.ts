export const ERRORS = {
  // Generic
  UNEXPECTED_ERROR: "Ocorreu um erro inesperado.",

  // Authentication & Authorization Errors
  NOT_AUTHORIZED: "Acesso negado.",
  NOT_LOGGED_IN: "Usuário não está logado.",
  INCORRECT_CREDENTIALS: "Email e/ou senha incorretos.",
  ACCESS_TOKEN_INVALID: "Token de acesso inválido ou revogado.",
  REFRESH_TOKEN_MISSING: "Token de atualização ausente.",
  REFRESH_TOKEN_INVALID: "Token de atualização inválido.",
  REFRESH_TOKEN_EXPIRED: "Token de atualização expirado.",

  // Routing Errors
  NOT_FOUND: "O recurso solicitado não foi encontrado.",
  TOO_MANY_REQUESTS: "Limite de solicitações excedido.",

  // Server Errors
  SERVER_UNKNOWN_ERROR: "Ocorreu um erro inesperado.",
  SERVER_DB_UNHEALTHY: "Conexão com a base de dados falhou.",
} satisfies Record<string, string>;

export type ErrorCode = keyof typeof ERRORS;
