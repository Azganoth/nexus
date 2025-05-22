import { mockEnv, mockS3Client } from "$/__tests__/mocks";
import { createAvatarUploadUrlsByUserId } from "$/services/avatar.service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { AVATAR_UPLOAD_SCHEMA } from "@repo/shared/schemas";
import type { z } from "zod/v4";

jest.mock("@aws-sdk/s3-request-presigner");

const mockGetSignedUrl = jest.mocked(getSignedUrl);

describe("Avatar Service", () => {
  const mockUserId = "user-1";
  const mockImageData: z.infer<typeof AVATAR_UPLOAD_SCHEMA> = {
    fileExt: "png",
    fileType: "image/png",
    fileSize: 12345,
    fileHash: "a".repeat(64),
  };
  const mockSignedUrl = "https://signed.upload.url";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates correct S3 key, signed URL, and public URL for png", async () => {
    mockGetSignedUrl.mockResolvedValue(mockSignedUrl);
    mockS3Client.send.mockImplementation(() =>
      Promise.reject(new Error("Not found")),
    );

    const result = await createAvatarUploadUrlsByUserId(
      mockUserId,
      mockImageData,
    );

    expect(result.uploadUrl).toBe(mockSignedUrl);
    expect(result.publicUrl).toBe(
      `${mockEnv.R2_PUBLIC_URL}/avatars/${mockUserId}/${mockImageData.fileHash}.png`,
    );
    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      mockS3Client,
      expect.any(PutObjectCommand),
      expect.objectContaining({ expiresIn: 3600 }),
    );
  });

  it("returns only publicUrl when file already exists (deduplication)", async () => {
    mockS3Client.send.mockImplementation(() => Promise.resolve({}));

    const result = await createAvatarUploadUrlsByUserId(
      mockUserId,
      mockImageData,
    );

    expect(result.uploadUrl).toBeUndefined();
    expect(result.publicUrl).toBe(
      `${mockEnv.R2_PUBLIC_URL}/avatars/${mockUserId}/${mockImageData.fileHash}.png`,
    );
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });
});
