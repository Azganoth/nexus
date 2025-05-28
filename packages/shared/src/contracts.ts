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
export interface Session {
  accessToken: string;
  user: AuthenticatedUser;
}

// Models
export interface AuthenticatedUser extends Timestamps {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = "USER" | "ADMIN";

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  links: PublicLink[];
}

export interface PublicLink {
  id: number;
  title: string;
  url: string;
  displayOrder: number;
}

export interface AuthenticatedProfile
  extends Omit<PublicProfile, "links">,
    Timestamps {
  links: AuthenticatedLink[];
  isPublic: boolean;
}

export interface AuthenticatedLink extends PublicLink, Timestamps {
  isPublic: boolean;
}

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarUploadUrls {
  uploadUrl?: string;
  publicUrl: string;
}

export interface UserDataExport {
  user: AuthenticatedUser;
  profile: Omit<AuthenticatedProfile, "links"> | null;
  links: AuthenticatedLink[] | null;
  exportDate: Date;
}

export type ConsentType =
  | "TERMS_OF_SERVICE"
  | "PRIVACY_POLICY"
  | "NECESSARY_COOKIES"
  | "ANALYTICS_COOKIES"
  | "THIRD_PARTY_COOKIES";

export type ConsentAction = "GRANT" | "REVOKE";

export interface Consent {
  id: string;
  type: ConsentType;
  action: ConsentAction;
  ipAddress: string | null;
  userAgent: string | null;
  version: string;
  createdAt: Date;
}

export type ConsentStatus = Record<ConsentType, boolean>;
