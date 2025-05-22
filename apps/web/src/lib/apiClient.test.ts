import { createTestApiResponse } from "$/__tests__/factories";
import { spyFetch } from "$/__tests__/helpers";
import { apiClient } from "$/lib/apiClient";
import { getAccessToken, storeAccessToken } from "$/lib/auth/client";
import { ApiError, ValidationError } from "$/lib/errors";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ERRORS } from "@repo/shared/constants";

jest.mock("$/lib/auth/client");

const mockGetAccessToken = jest.mocked(getAccessToken);
const mockStoreAccessToken = jest.mocked(storeAccessToken);

describe("apiClient", () => {
  const createSuccessReponse = (data: unknown) =>
    createTestApiResponse(200, { status: "success", data });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("makes a GET request successfully", async () => {
    const successPayload = { message: "Sucesso!" };
    const successResponse = createSuccessReponse(successPayload);
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);

    const result = await apiClient.get<{ message: string }>("/test");

    expect(fetchSpy).toHaveBeenCalledWith("/api/test", {
      method: "GET",
      headers: new Headers({}),
      credentials: "include",
    });
    expect(result).toEqual(successPayload);
  });

  it("makes a POST request successfully", async () => {
    const successPayload = { message: "Sucesso!" };
    const successResponse = createSuccessReponse(successPayload);
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);

    const result = await apiClient.post("/post-endpoint", { name: "test" });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: new Headers({ "Content-Type": "application/json" }),
      }),
    );
    expect(result).toEqual(successPayload);
  });

  it("makes a PATCH request successfully", async () => {
    const successPayload = { message: "Sucesso!" };
    const successResponse = createSuccessReponse(successPayload);
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);

    const result = await apiClient.patch("/patch-endpoint", { name: "test" });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: new Headers({ "Content-Type": "application/json" }),
      }),
    );
    expect(result).toEqual(successPayload);
  });

  it("makes a DELETE request successfully", async () => {
    const _204Response = new Response(null, { status: 204 });
    const fetchSpy = spyFetch().mockResolvedValue(_204Response);

    const result = await apiClient.delete<void>("/test");

    expect(fetchSpy).toHaveBeenCalledWith("/api/test", {
      method: "DELETE",
      headers: new Headers({}),
      credentials: "include",
    });
    expect(result).toBeUndefined();
  });

  it("includes Content-Type header if a body is provided", async () => {
    const successResponse = createSuccessReponse({});
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);

    await apiClient.post("/post-endpoint", { name: "test" });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: new Headers({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("should throw ValidationError for validation responses", async () => {
    const failResponse = createTestApiResponse(422, {
      status: "fail",
      data: {},
    });
    spyFetch().mockResolvedValue(failResponse);

    await expect(apiClient.get("/fail")).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("should throw ApiError for API responses", async () => {
    const errorResponse = createTestApiResponse(400, {
      status: "error",
      code: "TOO_MANY_REQUESTS",
      message: ERRORS.TOO_MANY_REQUESTS,
    });
    spyFetch().mockResolvedValue(errorResponse);

    await expect(apiClient.get("/fail")).rejects.toBeInstanceOf(ApiError);
  });

  describe("Automatic Token Refresh Logic", () => {
    const createInvalidAccessResponse = () =>
      createTestApiResponse(401, {
        status: "error",
        code: "ACCESS_TOKEN_INVALID",
        message: ERRORS.ACCESS_TOKEN_INVALID,
      });
    const createInvalidRefreshResponse = () =>
      createTestApiResponse(401, {
        status: "error",
        code: "REFRESH_TOKEN_INVALID",
        message: ERRORS.REFRESH_TOKEN_INVALID,
      });

    beforeEach(() => {
      mockGetAccessToken.mockReturnValue("expired-token");
    });

    it("refreshes the token and retries the request", async () => {
      const accessToken = "this-is-a-fresh-token";
      const successPayload = { data: "Conteúdo protegido." };
      const refreshResponse = createSuccessReponse({ accessToken });
      const successResponse = createSuccessReponse(successPayload);

      // 1st call fails, 2nd call (refresh) succeeds, 3rd call (retry) succeeds
      const fetchSpy = spyFetch()
        .mockResolvedValueOnce(createInvalidAccessResponse())
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await apiClient.get("/protected-resource");

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(fetchSpy).toHaveBeenNthCalledWith(
        2,
        "/api/auth/refresh",
        expect.anything(),
      );
      expect(mockStoreAccessToken).toHaveBeenCalledWith(accessToken);
      expect(result).toEqual(successPayload);
    });

    it("should throw the original error if token refresh fails", async () => {
      const invalidAccessResponse = createInvalidAccessResponse();
      const invalidRefreshResponse = createInvalidRefreshResponse();
      const fetchSpy = spyFetch()
        .mockResolvedValueOnce(invalidAccessResponse)
        .mockResolvedValueOnce(invalidRefreshResponse);

      await expect(apiClient.get("/protected-resource")).rejects.toBeInstanceOf(
        ApiError,
      );

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(mockStoreAccessToken).not.toHaveBeenCalled();
    });
  });
});
