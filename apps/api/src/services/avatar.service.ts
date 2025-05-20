import { env } from "$/config/env";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AvatarUploadUrls } from "@repo/shared/contracts";
import { AVATAR_UPLOAD_SCHEMA } from "@repo/shared/schemas";
import type { z } from "zod/v4";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const createAvatarUploadUrlsByUserId = async (
  userId: string,
  data: z.infer<typeof AVATAR_UPLOAD_SCHEMA>,
): Promise<AvatarUploadUrls> => {
  const ext = data.fileExt === "jpg" ? "jpeg" : data.fileExt;
  const key = `avatars/${userId}/${data.fileHash}.${ext}`;

  // Check if object already exists (deduplication)
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      }),
    );

    const publicUrl = `https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/${key}`;
    return { publicUrl };
  } catch {
    // Skip deduplication if any error occurs
  }

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: data.fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = `https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/${key}`;

  return { uploadUrl, publicUrl };
};
