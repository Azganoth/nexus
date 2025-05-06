import { ERRORS, type ErrorCode } from "@repo/shared/constants";
import type { ApiResponse, PublicUser } from "@repo/shared/contracts";

export const createTestPublicUser = (
  overrides?: Partial<PublicUser>,
): PublicUser => ({
  id: "dc8d7c75-b500-4500-bb21-b0cc2a4ead41",
  email: "test@example.com",
  name: "Test Example",
  role: "USER",
  ...overrides,
});

// Responses
const statusToStatusCode: Record<ApiResponse["status"], number> = {
  success: 200,
  fail: 400,
  error: 500,
};
export const createTestResponse = (
  response: ApiResponse,
  status = statusToStatusCode[response.status],
) => new Response(JSON.stringify(response), { status });

export const createTestSuccessResponse = (data: unknown) =>
  createTestResponse({ status: "success", data });

export const createTestFailResponse = (data: Record<string, string[]>) =>
  createTestResponse({ status: "fail", data });

export const createTestErrorResponse = (code: ErrorCode, message?: string) =>
  createTestResponse({
    status: "error",
    code,
    message: message ?? ERRORS[code],
  });
