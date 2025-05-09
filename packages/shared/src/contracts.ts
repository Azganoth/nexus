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
export interface AuthPayload {
  accessToken: string;
  user: PublicUser;
}

// Models
export type UserRole = "USER" | "ADMIN";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Timestamp {
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicProfile extends Timestamp {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string | null;
  links: PublicLink[];
  seoTitle: string | null;
  seoDescription: string | null;
  isPublic: boolean;
}

export interface PublicLink extends Timestamp {
  id: number;
  title: string;
  url: string;
  displayOrder: number;
  isPublic: boolean;
}
