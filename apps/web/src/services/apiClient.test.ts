import { createTestApiResponse } from "$/__tests__/factories";
import { spyFetch } from "$/__tests__/helpers";
import { getAccessToken, storeAccessToken } from "$/lib/auth/client";
import { apiClient } from "$/services/apiClient";
import { ApiError, ValidationError } from "$/services/errors";
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
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should make a successful request and return the data property", async () => {
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

  it("should make a successful request and return the nothing for status 204", async () => {
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

  it("should include the Authorization header if a token exists", async () => {
    const successResponse = createSuccessReponse({});
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);
    mockGetAccessToken.mockReturnValue("this-is-a-secret-token");

    await apiClient.get("/secure-endpoint");

    expect(mockGetAccessToken).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: new Headers({
          Authorization: "Bearer this-is-a-secret-token",
        }),
      }),
    );
  });

  it("should include Content-Type header if a body is provided", async () => {
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

  it("should throw ValidationError for non-successful validation responses", async () => {
    const failResponse = createTestApiResponse(422, {
      status: "fail",
      data: {},
    });
    spyFetch().mockResolvedValue(failResponse);

    await expect(apiClient.get("/fail")).rejects.toBeInstanceOf(
      ValidationError,
    );
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

    it("should successfully refresh the token and retry the request", async () => {
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

    it("should only trigger one refresh request for multiple concurrent failed requests", async () => {
      const accessToken = "this-is-a-fresh-token";
      const successPayload1 = { data: "resource 1" };
      const successPayload2 = { data: "resource 2" };
      const invalidResponse1 = createInvalidAccessResponse();
      const invalidResponse2 = createInvalidAccessResponse();
      const refreshResponse = createSuccessReponse({ accessToken });
      const successResponse1 = createSuccessReponse(successPayload1);
      const successResponse2 = createSuccessReponse(successPayload2);

      const fetchSpy = spyFetch()
        .mockResolvedValueOnce(invalidResponse1)
        .mockResolvedValueOnce(invalidResponse2)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(successResponse1)
        .mockResolvedValueOnce(successResponse2);

      const [result1, result2] = await Promise.all([
        apiClient.get("/resource1"),
        apiClient.get("/resource2"),
      ]);

      // Expect 5 total calls: 2 initial failures, 1 refresh, 2 retries
      expect(fetchSpy).toHaveBeenCalledTimes(5);

      const refreshCall = fetchSpy.mock.calls.find(
        (call) => call[0] === "/api/auth/refresh",
      );

      // Verify that the refresh endpoint was called exactly once
      expect(refreshCall).not.toBeUndefined();
      const refreshCalls = fetchSpy.mock.calls.filter(
        (call) => call[0] === "/api/auth/refresh",
      );
      expect(refreshCalls).toHaveLength(1);

      expect(mockStoreAccessToken).toHaveBeenCalledWith(accessToken);
      expect(result1).toEqual(successPayload1);
      expect(result2).toEqual(successPayload2);
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

    it("should not enter a retry loop if the token is always invalid", async () => {
      const invalidResponse1 = createInvalidAccessResponse();
      const invalidResponse2 = createInvalidAccessResponse();
      const fetchSpy = spyFetch()
        .mockResolvedValueOnce(invalidResponse1)
        .mockResolvedValueOnce(invalidResponse2);

      await expect(apiClient.get("/protected-resource")).rejects.toBeInstanceOf(
        ApiError,
      );

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
