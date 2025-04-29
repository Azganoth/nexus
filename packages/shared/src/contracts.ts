import type { ErrorCode } from "./constants";

type BaseApiResponse<T extends string> = {
  status: T;
};

export interface SuccessApiResponse<T> extends BaseApiResponse<"success"> {
  data: T;
  message?: string;
}

export interface FailApiResponse extends BaseApiResponse<"fail"> {
  code: ErrorCode;
  message: string;
  rootErrors?: string[];
  fieldErrors?: Record<string, string[]>;
}

export interface ErrorApiResponse extends BaseApiResponse<"error"> {
  code: ErrorCode;
  message: string;
}

export type ApiResponse<T = unknown> =
  | SuccessApiResponse<T>
  | FailApiResponse
  | ErrorApiResponse;

// Responses
export interface AccessTokenOutput {
  accessToken: string;
}

export interface AuthOutput extends AccessTokenOutput {
  user: PublicUser;
}

// Models
export interface PublicUser {
  id: string;
  email: string;
  name: string;
}
