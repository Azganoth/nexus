import {
  createTestErrorResponse,
  createTestFailResponse,
  createTestSuccessResponse,
} from "$/__tests__/factories";
import { spyFetch } from "$/__tests__/helpers";
import { fetchApi } from "$/lib/api";
import { API_URL } from "$/lib/constants";
import { ApiError, ValidationError } from "$/lib/errors";
import { getAccessToken, storeAccessToken } from "$/lib/token";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

jest.mock("$/lib/token");
jest.mock("$/lib/constants", () => ({
  API_URL: "http://test.mock.com",
}));

const mockGetAccessToken = jest.mocked(getAccessToken);
const mockStoreAccessToken = jest.mocked(storeAccessToken);

describe("fetchApi", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should make a successful request and return the data property", async () => {
    const successData = { message: "Sucesso!" };
    const successResponse = createTestSuccessResponse(successData);
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);

    const result = await fetchApi<{ message: string }>("/test");

    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/test`, {
      headers: new Headers({}),
      credentials: "include",
    });
    expect(result).toEqual(successData);
  });

  it("should make a successful request and return the nothing for status 204", async () => {
    const _204Response = new Response(null, { status: 204 });
    const fetchSpy = spyFetch().mockResolvedValue(_204Response);

    const result = await fetchApi<void>("/test");

    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/test`, {
      headers: new Headers({}),
      credentials: "include",
    });
    expect(result).toBeUndefined();
  });

  it("should include the Authorization header if a token exists", async () => {
    const successResponse = createTestSuccessResponse({});
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);
    mockGetAccessToken.mockReturnValue("this-is-a-secret-token");

    await fetchApi("/secure-endpoint");

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
    const successResponse = createTestSuccessResponse({});
    const fetchSpy = spyFetch().mockResolvedValue(successResponse);

    await fetchApi("/post-endpoint", {
      method: "POST",
      body: JSON.stringify({ name: "test" }),
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: new Headers({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("should throw ApiError for non-successful responses", async () => {
    const failResponse = createTestFailResponse({});
    spyFetch().mockResolvedValue(failResponse);

    await expect(fetchApi("/fail")).rejects.toBeInstanceOf(ValidationError);
  });

  describe("Automatic Token Refresh Logic", () => {
    beforeEach(() => {
      mockGetAccessToken.mockReturnValue("expired-token");
    });

    it("should refresh the token and retry the request successfully", async () => {
      const accessToken = "this-is-a-fresh-token";
      const successData = { data: "Conteúdo protegido." };
      const invalidResponse = createTestErrorResponse("ACCESS_TOKEN_INVALID");
      const refreshResponse = createTestSuccessResponse({ accessToken });
      const successResponse = createTestSuccessResponse(successData);

      // 1st call fails, 2nd call (refresh) succeeds, 3rd call (retry) succeeds
      const fetchSpy = spyFetch()
        .mockResolvedValueOnce(invalidResponse)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await fetchApi("/protected-resource");

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_URL}/auth/refresh`,
        expect.anything(),
      );
      expect(mockStoreAccessToken).toHaveBeenCalledWith(accessToken);
      expect(result).toEqual(successData);
    });

    it("should throw the original error if token refresh fails", async () => {
      const invalidResponse = createTestErrorResponse("ACCESS_TOKEN_INVALID");
      const refreshFailedResponse = createTestErrorResponse(
        "REFRESH_TOKEN_INVALID",
      );

      // 1st call fails, 2nd call (refresh) also fails
      const fetchSpy = spyFetch()
        .mockResolvedValueOnce(invalidResponse)
        .mockResolvedValueOnce(refreshFailedResponse);

      await expect(fetchApi("/protected-resource")).rejects.toBeInstanceOf(
        ApiError,
      );

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(mockStoreAccessToken).not.toHaveBeenCalled();
    });

    it("should not enter a retry loop if the token is always invalid", async () => {
      const invalidResponse = createTestErrorResponse("ACCESS_TOKEN_INVALID");
      const fetchSpy = spyFetch().mockResolvedValue(invalidResponse);

      await expect(fetchApi("/protected-resource")).rejects.toBeInstanceOf(
        ApiError,
      );

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
