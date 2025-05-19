import { createAvatarUploadUrlsByUserId } from "$/services/avatar.service";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { AVATAR_UPLOAD_SCHEMA } from "@repo/shared/schemas";
import { randomUUID } from "crypto";
import type { z } from "zod/v4";

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("crypto");

const mockGetSignedUrl = jest.mocked(getSignedUrl);
const mockRandomUUID = jest.mocked(randomUUID);

describe("Avatar Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRandomUUID.mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
    mockGetSignedUrl.mockResolvedValue("https://signed.upload.url");
  });

  it("generates correct S3 key, signed URL, and public URL for png", async () => {
    const userId = "user-1";
    const data: z.infer<typeof AVATAR_UPLOAD_SCHEMA> = {
      fileExt: "png",
      fileType: "image/png",
      fileSize: 12345,
    };
    const result = await createAvatarUploadUrlsByUserId(userId, data);

    expect(result.uploadUrl).toBe("https://signed.upload.url");
    expect(result.publicUrl).toContain(
      `/avatars/${userId}/123e4567-e89b-12d3-a456-426614174000.png`,
    );
    expect(mockGetSignedUrl).toHaveBeenCalled();
  });

  it("converts jpg extension to jpeg in key", async () => {
    const userId = "user-2";
    const data: z.infer<typeof AVATAR_UPLOAD_SCHEMA> = {
      fileExt: "jpg",
      fileType: "image/jpeg",
      fileSize: 54321,
    };
    await createAvatarUploadUrlsByUserId(userId, data);

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.any(S3Client),
      expect.any(PutObjectCommand),
      expect.objectContaining({ expiresIn: 3600 }),
    );
  });
});
