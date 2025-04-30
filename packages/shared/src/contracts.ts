import type { ErrorCode } from "./constants";

// Responses
type StatusResponse<T extends string> = {
  status: T;
};

export interface SuccessResponse<T> extends StatusResponse<"success"> {
  data: T;
}

export interface FailResponse extends StatusResponse<"fail"> {
  data: Record<string, string[] | undefined>;
}

export interface ErrorResponse extends StatusResponse<"error"> {
  code: ErrorCode;
  message: string;
}

export type ApiResponse<T = unknown> =
  | SuccessResponse<T>
  | FailResponse
  | ErrorResponse;

// Payloads
export interface AccessTokenPayload {
  accessToken: string;
}

export interface AuthPayload extends AccessTokenPayload {
  user: PublicUser;
}

// Models
export interface PublicUser {
  id: string;
  email: string;
  name: string;
}
