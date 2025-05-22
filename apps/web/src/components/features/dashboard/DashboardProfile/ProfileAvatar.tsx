import { Icon } from "$/components/ui/Icon";
import { toast } from "$/components/ui/Toast";
import type { UpdateProfileData } from "$/hooks/useProfile";
import { apiClient } from "$/lib/apiClient";
import { hashFileSHA256 } from "$/lib/utils";
import type { AvatarUploadUrls } from "@repo/shared/contracts";
import { AVATAR_UPLOAD_SCHEMA } from "@repo/shared/schemas";
import Image from "next/image";
import { useRef, useState } from "react";
import { CropAvatarModal } from "./modals/CropAvatarModal";

const avatarMetadataSchema = AVATAR_UPLOAD_SCHEMA.omit({ fileHash: true });

const validateImage = async (file: File) => {
  const result = await avatarMetadataSchema.safeParseAsync({
    fileType: file.type,
    fileSize: file.size,
    fileExt: file.name.split(".").pop()?.toLowerCase() || "",
  });
  if (!result.success) {
    return result.error.issues[0].message;
  }
};

interface ProfileAvatarProps {
  currentUrl: string;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
}

export function ProfileAvatar({
  currentUrl,
  updateProfile,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = await validateImage(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImageUrl(imageUrl);
    setIsCropModalOpen(true);
  };

  const handleCrop = async (croppedBlob: Blob) => {
    setIsCropModalOpen(false);
    setIsLoading(true);
    try {
      // Create a file from the cropped image
      const file = new File([croppedBlob], "avatar.webp", {
        type: "image/webp",
      });

      // Compute SHA-256 hash of the file for deduplication
      const fileHash = await hashFileSHA256(file);

      const { uploadUrl, publicUrl } = await apiClient.post<AvatarUploadUrls>(
        "/avatars/upload-url",
        {
          fileType: file.type,
          fileSize: file.size,
          fileExt: "webp",
          fileHash,
        },
      );

      if (uploadUrl) {
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });
      }
      await updateProfile({ avatarUrl: publicUrl });
    } catch (error) {
      console.error("Error on avatar upload:", error);
      toast.error("Erro ao enviar avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropModalOpen(false);
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl("");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="focus-ring ring-purple group relative overflow-hidden rounded-full"
        onClick={handleClick}
        aria-label="Alterar avatar do perfil"
        disabled={isLoading}
      >
        <Image
          className={isLoading ? "opacity-50" : ""}
          width={64}
          height={64}
          src={currentUrl}
          alt="Avatar do perfil"
        />
        {isLoading ? (
          <div className="absolute inset-0 grid place-items-center bg-white/60 text-white">
            <Icon className="icon-[svg-spinners--180-ring] text-2xl" />
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Icon className="icon-[fa6-solid--pen] text-lg text-white" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <CropAvatarModal
        isOpen={isCropModalOpen}
        onClose={handleCancelCrop}
        imageUrl={selectedImageUrl}
        onCrop={handleCrop}
        onCancel={handleCancelCrop}
      />
    </div>
  );
}
