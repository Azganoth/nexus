export const ERRORS = {
  // Authentication & Authorization Errors
  NOT_AUTHORIZED: "Acesso negado.",
  NOT_LOGGED_IN: "Usuário não está logado.",
  INCORRECT_CREDENTIALS: "Email e/ou senha incorretos.",
  ACCESS_TOKEN_INVALID: "Token de acesso inválido ou revogado.",
  REFRESH_TOKEN_MISSING: "Token de atualização não fornecido.",
  REFRESH_TOKEN_INVALID: "Token de atualização inválido ou expirado.",
  USER_FOR_TOKEN_NOT_FOUND: "O usuário associado a este token não existe mais.",

  // Routing Errors
  NOT_FOUND: "O recurso solicitado não foi encontrado.",

  // Server Errors
  SERVER_UNKNOWN_ERROR: "Ocorreu um erro inesperado.",
  SERVER_DB_UNHEALTHY: "Conexão com a base de dados falhou.",
} satisfies Record<string, string>;

export type ErrorCode = keyof typeof ERRORS;
